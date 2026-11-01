import { Flip } from './flip';

export type Player = 'me' | 'opponent';
export type FlipSource = 'manual' | 'yusri' | 'okaun';

// Ce qui est sur le terrain (Pouce de Krark : un seul possible)
export type Board = {
  thumb: boolean;
  zndrsplt: boolean;
  okaun: boolean;
};

// Un lancer enregistré dans un tour, avec son contexte
export type TurnFlip = Flip & {
  player: Player;
  source: FlipSource;
  board: Board; // état du terrain AU MOMENT du lancer
};

export type Stats = { power: number; toughness: number };

export type Turn = {
  number: number;
  okaunBase: Stats; // force / défense d'Okaun en début de tour
  flips: TurnFlip[];
};

export const newTurn = (
  number: number,
  okaunBase: Stats = { power: 0, toughness: 0 },
): Turn => ({ number, okaunBase, flips: [] });

// Ajoute des lancers au tour (sans modifier l'ancien tour)
export const recordFlips = (
  turn: Turn,
  flips: Flip[],
  context: { player: Player; source: FlipSource; board: Board },
): Turn => ({
  ...turn,
  flips: [...turn.flips, ...flips.map(f => ({ ...f, ...context }))],
});

export type TurnSummary = {
  wins: number; // mes lancers réussis
  losses: number; // mes lancers ratés
  cards: { yusri: number; zndrsplt: number; total: number };
  lifeLost: number;
  okaun: { doublings: number; power: number; toughness: number };
  yusriJackpot: boolean; // 5 lancers Yusri, 5 réussites
};

export const summarizeTurn = (turn: Turn): TurnSummary => {
  const mine = turn.flips.filter(f => f.player === 'me');
  const yusriFlips = mine.filter(f => f.source === 'yusri');
  const isWin = (f: TurnFlip) => f.result === 'Win';

  const yusriCards = yusriFlips.filter(isWin).length;
  const zndrspltCards = mine.filter(f => isWin(f) && f.board.zndrsplt).length;

  // Okaun : tout lancer réussi, de n'importe quel joueur, double sa force
  const doublings = turn.flips.filter(f => isWin(f) && f.board.okaun).length;
  const factor = 2 ** doublings;

  return {
    wins: mine.filter(isWin).length,
    losses: mine.filter(f => !isWin(f)).length,
    cards: {
      yusri: yusriCards,
      zndrsplt: zndrspltCards,
      total: yusriCards + zndrspltCards,
    },
    lifeLost: yusriFlips.filter(f => !isWin(f)).length * 2,
    okaun: {
      doublings,
      power: turn.okaunBase.power * factor,
      toughness: turn.okaunBase.toughness * factor,
    },
    yusriJackpot: yusriFlips.length === 5 && yusriFlips.every(isWin),
  };
};