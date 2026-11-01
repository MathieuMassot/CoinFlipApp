import { useCallback, useEffect, useRef } from 'react';
import Sound from 'react-native-sound';

// Un nom = un fichier dans android/app/src/main/res/raw
const FILES = {
  laugh: 'laugh.mp3',
};

export type SoundName = keyof typeof FILES;

export const useSounds = () => {
  const sounds = useRef<Partial<Record<SoundName, Sound>>>({});

  useEffect(() => {
    const loaded = sounds.current;
    (Object.keys(FILES) as SoundName[]).forEach(name => {
      loaded[name] = new Sound(FILES[name], Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('Erreur lors du chargement du son', name, error);
        }
      });
    });
    return () => {
      Object.values(loaded).forEach(s => s?.release());
    };
  }, []);

  // Rejoue le son depuis le début, même s'il est déjà en cours
  const play = useCallback((name: SoundName) => {
    const s = sounds.current[name];
    if (s) {
      s.stop(() => s.play());
    }
  }, []);

  return { play };
};