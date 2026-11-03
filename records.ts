import { GameState, GameStats, emptyStats } from './game';

export type GameRecord = { endedAt: number; stats: GameStats };

// Résumé archivé quand on termine une partie
export const endGame = (
  state: GameState,
  endedAt: number = Date.now(),
): GameRecord => ({ endedAt, stats: state.stats });

// Vue « globale » : tout additionné (pour la force d'Okaun, le record absolu)
export const totalStats = (records: GameRecord[]): GameStats =>
  records.reduce<GameStats>(
    (t, { stats: s }) => ({
      wins: {
        withThumb: t.wins.withThumb + s.wins.withThumb,
        withoutThumb: t.wins.withoutThumb + s.wins.withoutThumb,
      },
      losses: {
        withThumb: t.losses.withThumb + s.losses.withThumb,
        withoutThumb: t.losses.withoutThumb + s.losses.withoutThumb,
      },
      lifeLost: t.lifeLost + s.lifeLost,
      thumbSaves: t.thumbSaves + s.thumbSaves,
      cardsYusri: t.cardsYusri + s.cardsYusri,
      cardsZndrsplt: t.cardsZndrsplt + s.cardsZndrsplt,
      okaunMax: {
        power: Math.max(t.okaunMax.power, s.okaunMax.power),
        toughness: Math.max(t.okaunMax.toughness, s.okaunMax.toughness),
      },
    }),
    emptyStats(),
  );

// Vue « moyenne » : par partie (null s'il n'y a encore aucune partie)
export const averageStats = (records: GameRecord[]): GameStats | null => {
  const n = records.length;
  if (n === 0) {
    return null;
  }
  const avg = (pick: (s: GameStats) => number) =>
    records.reduce((sum, r) => sum + pick(r.stats), 0) / n;

  return {
    wins: {
      withThumb: avg(s => s.wins.withThumb),
      withoutThumb: avg(s => s.wins.withoutThumb),
    },
    losses: {
      withThumb: avg(s => s.losses.withThumb),
      withoutThumb: avg(s => s.losses.withoutThumb),
    },
    lifeLost: avg(s => s.lifeLost),
    thumbSaves: avg(s => s.thumbSaves),
    cardsYusri: avg(s => s.cardsYusri),
    cardsZndrsplt: avg(s => s.cardsZndrsplt),
    okaunMax: {
      power: avg(s => s.okaunMax.power),
      toughness: avg(s => s.okaunMax.toughness),
    },
  };
};