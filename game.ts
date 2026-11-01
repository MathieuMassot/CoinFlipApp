import { Flip } from './flip';

export type Player = 'me' | 'opponent';
export type FlipSource = 'manual' | 'yusri' | 'zndrsplt' | 'okaun';

// Ce qui est posé sur le terrain
export type Board = {
  thumb: boolean; // Pouce de Krark
  yusri: boolean;
  zndrsplt: boolean;
  okaun: boolean;
};

export type Stats = { power: number; toughness: number };

// Un lancer enregistré, avec son contexte
export type RecordedFlip = Flip & {
  player: Player;
  source: FlipSource;
  board: Board; // état du terrain au moment du lancer
};

export type Turn = {
  number: number;
  mine: boolean; // est-ce mon tour ?
  doublings: number; // doublements d'Okaun depuis le début de ce tour
  flips: RecordedFlip[];
};

export type GameStats = {
  wins: { withThumb: number; withoutThumb: number };
  losses: { withThumb: number; withoutThumb: number };
  lifeLost: number; // PV perdus à cause de Yusri
  cardsYusri: number;
  cardsZndrsplt: number;
  okaunMax: Stats; // plus forte valeur atteinte par Okaun
};

export type GameState = {
  board: Board;
  okaunBase: Stats; // la base, modifiée par les artefacts, qui persiste
  okaunNow: Stats; // la valeur du moment, qui revient à la base en fin de tour
  pendingDraws: number; // cartes à piocher, remis à zéro quand on a pioché
  turn: Turn;
  stats: GameStats;
};

export const DEFAULT_OKAUN: Stats = { power: 3, toughness: 3 };

const emptyTurn = (number: number, mine: boolean): Turn => ({
  number,
  mine,
  doublings: 0,
  flips: [],
});

export const newGame = (okaunBase: Stats = DEFAULT_OKAUN): GameState => ({
  board: { thumb: false, yusri: false, zndrsplt: false, okaun: false },
  okaunBase,
  okaunNow: okaunBase,
  pendingDraws: 0,
  turn: emptyTurn(1, false),
  stats: {
    wins: { withThumb: 0, withoutThumb: 0 },
    losses: { withThumb: 0, withoutThumb: 0 },
    lifeLost: 0,
    cardsYusri: 0,
    cardsZndrsplt: 0,
    okaunMax: { power: 0, toughness: 0 },
  },
});

const double = (s: Stats): Stats => ({
  power: s.power * 2,
  toughness: s.toughness * 2,
});

const maxStats = (a: Stats, b: Stats): Stats => ({
  power: Math.max(a.power, b.power),
  toughness: Math.max(a.toughness, b.toughness),
});

// Change la valeur du moment d'Okaun et met à jour son maximum
const withOkaunNow = (state: GameState, now: Stats): GameState => ({
  ...state,
  okaunNow: now,
  stats: state.board.okaun
    ? { ...state.stats, okaunMax: maxStats(state.stats.okaunMax, now) }
    : state.stats,
});

// Pose ou retire des cartes du terrain
export const setBoard = (state: GameState, change: Partial<Board>): GameState => {
  const next = { ...state, board: { ...state.board, ...change } };
  // Okaun arrive sur le terrain : il repart de sa base
  return change.okaun && !state.board.okaun
    ? withOkaunNow(next, state.okaunBase)
    : next;
};

// Nouvelle base (artefacts). Si Okaun n'a pas encore doublé ce tour-ci,
// la valeur du moment suit.
export const setOkaunBase = (state: GameState, base: Stats): GameState => {
  const next = { ...state, okaunBase: base };
  return state.turn.doublings === 0 ? withOkaunNow(next, base) : next;
};

// Correction de la valeur du moment, en cours de tour
export const setOkaunNow = (state: GameState, now: Stats): GameState =>
  withOkaunNow(state, now);

// Ouvre un nouveau tour : Okaun revient à sa base
const startTurn = (state: GameState, mine: boolean): GameState =>
  withOkaunNow(
    { ...state, turn: emptyTurn(state.turn.number + 1, mine) },
    state.okaunBase,
  );

// Début (true) ou fin (false) de mon tour
export const setMyTurn = (state: GameState, mine: boolean): GameState =>
  startTurn(state, mine);

// Bouton « fin de tour » de la carte d'Okaun (tour d'un adversaire)
export const endTurn = (state: GameState): GameState => startTurn(state, false);

// J'ai pioché les cartes : le compteur repart de zéro, pas les stats
export const markCardsDrawn = (state: GameState): GameState => ({
  ...state,
  pendingDraws: 0,
});

type Context = { player: Player; source: FlipSource };

const recordFlip = (
  state: GameState,
  flip: Flip,
  { player, source }: Context,
): GameState => {
  const { board } = state;
  const won = flip.result === 'Win';
  const entry: RecordedFlip = { ...flip, player, source, board };

  let next: GameState = {
    ...state,
    turn: { ...state.turn, flips: [...state.turn.flips, entry] },
  };

  // Okaun : toute réussite, de n'importe quel joueur, double sa valeur du moment
  if (won && board.okaun) {
    next = withOkaunNow(next, double(next.okaunNow));
    next = {
      ...next,
      turn: { ...next.turn, doublings: next.turn.doublings + 1 },
    };
  }

  // Statistiques et cartes : seulement mes lancers
  if (player === 'me') {
    const thumbKey = flip.coins.length > 1 ? 'withThumb' : 'withoutThumb';
    const stats = { ...next.stats };
    let draws = 0;

    if (won) {
      stats.wins = { ...stats.wins, [thumbKey]: stats.wins[thumbKey] + 1 };
      if (source === 'yusri') {
        stats.cardsYusri += 1;
        draws += 1;
      }
      if (board.zndrsplt) {
        stats.cardsZndrsplt += 1;
        draws += 1;
      }
    } else {
      stats.losses = { ...stats.losses, [thumbKey]: stats.losses[thumbKey] + 1 };
      if (source === 'yusri') {
        stats.lifeLost += 2;
      }
    }

    next = { ...next, stats, pendingDraws: next.pendingDraws + draws };
  }

  return next;
};

export const recordFlips = (
  state: GameState,
  flips: Flip[],
  context: Context,
): GameState => flips.reduce((s, f) => recordFlip(s, f, context), state);