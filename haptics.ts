import { Vibration } from 'react-native';

const LOSE_MS = 60; // durée de la vibration
const DELAY_MS = 110; // attente pour que la tuile soit visible avant

// Seul un Lose vibre, juste après l'apparition de sa tuile
export const loseHaptic = () => {
  setTimeout(() => Vibration.vibrate(LOSE_MS), DELAY_MS);
};