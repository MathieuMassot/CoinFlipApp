import { useCallback, useEffect, useRef, useState } from 'react';
import { Stats } from './game';

const STEP_MS = 450;

export type Reveal = {
  count: number; // lancers déjà dévoilés
  total: number;
  steps: Stats[] | null; // valeur d'Okaun après chaque lancer
};

export const useReveal = () => {
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // Coupe l'animation : tout est affiché d'un coup
  const skip = useCallback(() => {
    stop();
    setReveal(null);
  }, [stop]);

  const start = useCallback(
    (total: number, steps: Stats[] | null) => {
      stop();
      setReveal({ count: 1, total, steps });
      const tick = (count: number) => {
        timer.current = setTimeout(() => {
          if (count >= total) {
            timer.current = null;
            setReveal(null);
            return;
          }
          setReveal(r => (r ? { ...r, count: count + 1 } : r));
          tick(count + 1);
        }, STEP_MS);
      };
      tick(1);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { reveal, start, skip };
};