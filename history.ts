const MAX_HISTORY = 50;

export type History<T> = { past: T[]; present: T };

export const newHistory = <T>(present: T): History<T> => ({
  past: [],
  present,
});

// Enregistre un nouvel état (l'ancien devient annulable)
export const commit = <T>(history: History<T>, next: T): History<T> =>
  next === history.present
    ? history
    : {
        past: [...history.past, history.present].slice(-MAX_HISTORY),
        present: next,
      };

export const canUndo = <T>(history: History<T>): boolean =>
  history.past.length > 0;

export const undo = <T>(history: History<T>): History<T> =>
  history.past.length === 0
    ? history
    : {
        past: history.past.slice(0, -1),
        present: history.past[history.past.length - 1],
      };