import { Vibration } from 'react-native';

const LOSE_MS = 60; // durée de la vibration
const DELAY_MS = 110; // attente pour que la tuile soit visible avant

// Seul un Lose vibre, juste après l'apparition de sa tuile
export const loseHaptic = () => {
  setTimeout(() => Vibration.vibrate(LOSE_MS), DELAY_MS);
};
const STEP_MS = 30; // vibration à chaque pièce de Yusri ajoutée ou retirée

export const stepHaptic = () => {
  Vibration.vibrate(STEP_MS);
};

const BLOCKED_MS = 450; // vibration longue : ce personnage a déjà lancé ce tour

export const blockedHaptic = () => {
  Vibration.vibrate(BLOCKED_MS);
};