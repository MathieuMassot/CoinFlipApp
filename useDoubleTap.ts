import { useCallback, useEffect, useRef } from 'react';

// Distingue un appui simple d'un double appui.
// L'appui simple n'est déclenché qu'après ce délai, si aucun second appui n'est venu.
const DELAY_MS = 260;

export const useDoubleTap = (onSingle: () => void, onDouble: () => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On garde les dernières fonctions : elles changent à chaque affichage
  const single = useRef(onSingle);
  const double = useRef(onDouble);
  single.current = onSingle;
  double.current = onDouble;

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      double.current();
    } else {
      timer.current = setTimeout(() => {
        timer.current = null;
        single.current();
      }, DELAY_MS);
    }
  }, []);
};