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
  thumbSaves: number; // Win obtenus grâce au Pouce (W+L ou L+W)
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
  lastSeries: RecordedFlip[]; // les lancers du dernier enregistrement
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


export const emptyStats = (): GameStats => ({
  wins: { withThumb: 0, withoutThumb: 0 },
  losses: { withThumb: 0, withoutThumb: 0 },
  thumbSaves: 0,
  lifeLost: 0,
  cardsYusri: 0,
  cardsZndrsplt: 0,
  okaunMax: { power: 0, toughness: 0 },
});

export const newGame = (okaunBase: Stats = DEFAULT_OKAUN): GameState => ({
  board: { thumb: false, yusri: false, zndrsplt: false, okaun: false },
  okaunBase,
  okaunNow: okaunBase,
  pendingDraws: 0,
  turn: emptyTurn(1, false),
  stats: emptyStats(),
  lastSeries: [],
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

const addStats = (a: Stats, d: Stats): Stats => ({
  power: Math.max(0, a.power + d.power),
  toughness: Math.max(0, a.toughness + d.toughness),
});

// Bonus ou malus d'artefact : permanent (la base bouge aussi)
// ou pour ce tour seulement
export const adjustOkaun = (
  state: GameState,
  delta: Stats,
  permanent: boolean,
): GameState =>
  withOkaunNow(
    permanent
      ? { ...state, okaunBase: addStats(state.okaunBase, delta) }
      : state,
    addStats(state.okaunNow, delta),
  );

// Ouvre un nouveau tour : Okaun revient à sa base, l'affichage du dernier lancer repart de zéro
const startTurn = (state: GameState, mine: boolean): GameState =>
  withOkaunNow(
    {
      ...state,
      lastSeries: [],
      turn: emptyTurn(state.turn.number + 1, mine),
    },
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

  // Statistiques : seulement mes lancers
  if (player === 'me') {
    const thumbKey = flip.coins.length > 1 ? 'withThumb' : 'withoutThumb';
    const stats = { ...next.stats };

    if (won) {
      stats.wins = { ...stats.wins, [thumbKey]: stats.wins[thumbKey] + 1 };
      if (flip.coins.length > 1 && flip.coins.includes('Lose')) {
        stats.thumbSaves += 1; // le Pouce a sauvé ce lancer
      }
      if (source === 'yusri') {
        stats.cardsYusri += 1; // statistique de Yusri, pas de carte « à piocher »
      }
    } else {
      stats.losses = { ...stats.losses, [thumbKey]: stats.losses[thumbKey] + 1 };
      if (source === 'yusri') {
        stats.lifeLost += 2;
      }
    }

    next = { ...next, stats };
  }

  // Zndrsplt : « chaque fois qu'un joueur gagne un lancer, pioche une carte » :
  // les réussites des adversaires comptent aussi
  if (won && board.zndrsplt) {
    next = {
      ...next,
      pendingDraws: next.pendingDraws + 1,
      stats: { ...next.stats, cardsZndrsplt: next.stats.cardsZndrsplt + 1 },
    };
  }

  return next;
};

export const recordFlips = (
  state: GameState,
  flips: Flip[],
  context: Context,
): GameState => {
  if (flips.length === 0) {
    return state;
  }
  const next = flips.reduce((s, f) => recordFlip(s, f, context), state);
  return { ...next, lastSeries: next.turn.flips.slice(-flips.length) };
};

// Ce qui vient de se passer, pour déclencher les sons (et plus tard les animations)
export type GameEvent =
  | { type: 'yusriJackpot' } // 5 réussites sur 5
  | { type: 'yusriDisaster' } // 5 échecs sur 5
  | { type: 'thumbSave'; count: number } // le Pouce transforme un échec en réussite
  | { type: 'thumbDoubleFail'; count: number } // deux échecs malgré le Pouce
  | { type: 'okaunMilestone'; threshold: number } // la force d'Okaun dépasse un palier
  | { type: 'longStreak'; source: 'okaun' | 'zndrsplt'; wins: number }
  | { type: 'zMilestone'; threshold: number }; // les cartes à piocher dépassent un palier

export const OKAUN_MILESTONES = [40, 350, 3000, 1000000];
export const Z_MILESTONES = [5, 10, 25, 50];
export const LONG_STREAK = 8; //TODO:

const detectEvents = (
  before: GameState,
  after: GameState,
  flips: Flip[],
  { player, source }: Context,
): GameEvent[] => {
  const events: GameEvent[] = [];

  if (player === 'me') {
    if (source === 'yusri' && flips.length === 5) {
      if (flips.every(f => f.result === 'Win')) {
        events.push({ type: 'yusriJackpot' });
      }
      if (flips.every(f => f.result === 'Lose')) {
        events.push({ type: 'yusriDisaster' });
      }
    }

    const saves = flips.filter(
      f => f.coins.length > 1 && f.result === 'Win' && f.coins.includes('Lose'),
    ).length;
    const doubleFails = flips.filter(
      f => f.coins.length > 1 && f.result === 'Lose',
    ).length;
    if (saves > 0) {
      events.push({ type: 'thumbSave', count: saves });
    }
    if (doubleFails > 0) {
      events.push({ type: 'thumbDoubleFail', count: doubleFails });
    }

    if (source === 'okaun' || source === 'zndrsplt') {
      const wins = flips.filter(f => f.result === 'Win').length;
      if (wins >= LONG_STREAK) {
        events.push({ type: 'longStreak', source, wins });
      }
    }
  }

    // Cartes à piocher du Z : seul le palier le plus haut franchi est signalé
  const crossedZ = Z_MILESTONES.filter(
    t => before.pendingDraws <= t && after.pendingDraws > t,
  );
  if (crossedZ.length > 0) {
    events.push({ type: 'zMilestone', threshold: Math.max(...crossedZ) });
  }

  // Seul le palier le plus haut franchi est signalé
  const crossed = OKAUN_MILESTONES.filter(
    t => before.okaunNow.power <= t && after.okaunNow.power > t,
  );
  if (crossed.length > 0) {
    events.push({ type: 'okaunMilestone', threshold: Math.max(...crossed) });
  }

  return events;
};

// Comme recordFlips, mais renvoie aussi les événements à signaler
export const recordFlipsWithEvents = (
  state: GameState,
  flips: Flip[],
  context: Context,
): { state: GameState; events: GameEvent[] } => {
  const next = recordFlips(state, flips, context);
  return { state: next, events: detectEvents(state, next, flips, context) };
};

// Valeur d'Okaun après chaque lancer, pour rejouer une série en temps réel
export const okaunProgression = (start: Stats, flips: Flip[]): Stats[] => {
  const steps: Stats[] = [];
  let current = start;
  for (const f of flips) {
    if (f.result === 'Win') {
      current = double(current);
    }
    steps.push(current);
  }
  return steps;
};

// Cartes à piocher produites par un lancer enregistré : celles de Zndrsplt,
// qui pioche à chaque réussite de n'importe quel joueur
export const cardsFromFlip = (f: RecordedFlip): number =>
  f.result === 'Win' && f.board.zndrsplt ? 1 : 0;

// Doublements d'Okaun produits par un lancer enregistré
export const doublingsFromFlip = (f: RecordedFlip): number =>
  f.result === 'Win' && f.board.okaun ? 1 : 0;