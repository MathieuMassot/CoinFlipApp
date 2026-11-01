import { GameState, newGame } from './game';
import { GameRecord } from './records';

export const SAVE_VERSION = 1;

export type Saved = {
  version: number;
  game: GameState; // la partie en cours
  records: GameRecord[]; // les parties terminées
};

export const defaultSaved = (): Saved => ({
  version: SAVE_VERSION,
  game: newGame(),
  records: [],
});

export const serializeSaved = (saved: Saved): string => JSON.stringify(saved);

// Absente, illisible ou d'une autre version : on repart de zéro
export const parseSaved = (raw: string | null): Saved => {
  if (raw === null) {
    return defaultSaved();
  }
  try {
    const data = JSON.parse(raw);
    if (
      data &&
      data.version === SAVE_VERSION &&
      data.game &&
      data.game.board &&
      data.game.turn &&
      data.game.stats &&
      Array.isArray(data.records)
    ) {
      return data as Saved;
    }
  } catch {
    // donnée illisible : on repart de zéro
  }
  return defaultSaved();
};