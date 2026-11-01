import { Vibration } from 'react-native';
import { GameEvent } from './game';

// Un petit « tic » à chaque lancer dévoilé : court pour un Win, plus marqué pour un Lose
export const tickHaptic = (result: 'Win' | 'Lose') => {
  Vibration.vibrate(result === 'Win' ? 12 : 45);
};

// Du plus important au moins important : un seul motif est joué
const PRIORITY: GameEvent['type'][] = [
  'yusriJackpot',
  'yusriDisaster',
  'okaunMilestone',
  'longStreak',
  'thumbDoubleFail',
  'thumbSave',
];

// [attente, vibration, attente, vibration…] en millisecondes
const PATTERNS: Record<GameEvent['type'], number[]> = {
  yusriJackpot: [0, 100, 60, 100, 60, 300],
  yusriDisaster: [0, 200, 80, 200],
  okaunMilestone: [0, 80, 50, 80],
  longStreak: [0, 60, 40, 60, 40, 60],
  thumbDoubleFail: [0, 120],
  thumbSave: [0, 15, 40, 15],
};

export const eventHaptic = (events: GameEvent[]) => {
  const top = PRIORITY.find(type => events.some(e => e.type === type));
  if (top) {
    Vibration.vibrate(PATTERNS[top]);
  }
};