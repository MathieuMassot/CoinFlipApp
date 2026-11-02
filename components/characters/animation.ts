import { withSequence } from 'react-native-reanimated';

export const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

// withSequence demande au moins une animation : on sépare la première des autres
export const seq = (animations: number[]) => {
  const [first, ...rest] = animations;
  return withSequence(first, ...rest);
};