import { useCallback, useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import { SOUND_FILES, SoundName } from './sounds';

const NAMES = Object.keys(SOUND_FILES) as SoundName[];

export const useSounds = () => {
  // Chaque son est chargé une seule fois, à la demande ou en arrière-plan
  const loaded = useRef<Partial<Record<SoundName, Promise<Sound>>>>({});
  const current = useRef<Sound | null>(null); // la voix en cours
  const ticket = useRef(0); // le dernier son demandé l'emporte
  const alive = useRef(true);

  const load = useCallback((name: SoundName): Promise<Sound> => {
    const cached = loaded.current[name];
    if (cached) {
      return cached;
    }
    const promise = new Promise<Sound>((resolve, reject) => {
      const s = new Sound(SOUND_FILES[name], Sound.MAIN_BUNDLE, error => {
        if (error) {
          reject(error);
        } else {
          resolve(s);
        }
      });
    });
    // Un chargement raté sera retenté à la prochaine demande
    promise.catch(() => {
      delete loaded.current[name];
    });
    loaded.current[name] = promise;
    return promise;
  }, []);

  // Préchargement, un son après l'autre pour ne pas tout charger d'un coup
  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    (async () => {
      for (const name of NAMES) {
        if (cancelled) {
          return;
        }
        try {
          await load(name);
        } catch {
          // il sera retenté à la première lecture
        }
      }
    })();
    const cache = loaded.current;
    return () => {
      cancelled = true;
      alive.current = false;
      Object.values(cache).forEach(p =>
        p?.then(s => s.release()).catch(() => undefined),
      );
    };
  }, [load]);

  // Une seule voix à la fois : un nouveau son coupe celui qui est en cours
  const play = useCallback(
    (name: SoundName) => {
      const mine = ++ticket.current;
      load(name)
        .then(s => {
          if (mine !== ticket.current || !alive.current) {
            return; // un son plus récent a pris la place pendant le chargement
          }
          if (current.current && current.current !== s) {
            current.current.stop();
          }
          current.current = s;
          s.stop(() => s.play());
        })
        .catch(error => console.log('Erreur de lecture du son', name, error));
    },
    [load],
  );

  return { play };
};