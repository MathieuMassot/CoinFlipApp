import {
  Easing,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

// withSequence demande au moins une animation : on sépare la première des autres
export const seq = (animations: number[]) => {
  const [first, ...rest] = animations;
  return withSequence(first, ...rest);
};

export type GazeStep = { x: number; y: number; move: number; rest: number };

// Un parcours de regard : des cibles aléatoires, un mouvement rapide puis une pause
export const gazePlan = (maxX: number, maxY: number, steps = 10): GazeStep[] =>
  Array.from({ length: steps }, () => ({
    x: rand(-maxX, maxX),
    y: rand(-maxY, maxY),
    move: rand(110, 230),
    rest: rand(500, 2000),
  }));

// X et Y partent du même parcours : le regard se déplace d'un seul geste
export const gazeSequence = (plan: GazeStep[], axis: 'x' | 'y') =>
  seq(
    plan.flatMap(step => [
      withTiming(step[axis], {
        duration: step.move,
        easing: Easing.out(Easing.cubic),
      }),
      withDelay(step.rest, withTiming(step[axis], { duration: 0 })),
    ]),
  );

  type Ease = (t: number) => number;

// Un mouvement jusqu'à `to` en `duration` ms
export const T = (to: number, duration: number, easing?: Ease) =>
  withTiming(to, easing ? { duration, easing } : { duration });

// Reste à cette valeur pendant ms millisecondes
export const hold = (ms: number, value: number) =>
  withDelay(ms, withTiming(value, { duration: 0 }));