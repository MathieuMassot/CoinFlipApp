// Palette et dimensions communes aux boutons « cartoon jeu mobile »

export const OUTLINE = '#1a1226'; // contour sombre de tous les boutons

export type Tone =
  | 'default'
  | 'action'
  | 'force'
  | 'endurance'
  | 'danger'
  | 'gold'
  | 'neutral'
  | 'disabled';

type ToneColors = {
  face: string; // la face du bouton
  edge: string; // la base sombre, qui donne l'épaisseur
  text: string;
};

export const TONES: Record<Tone, ToneColors> = {
  default: { face: '#7a56e8', edge: '#4a2fb0', text: '#ffffff' }, // violet
  action: { face: '#38c45e', edge: '#1f8a3d', text: '#ffffff' }, // vert
  force: { face: '#f0553a', edge: '#a8301c', text: '#ffffff' }, // rouge-orangé
  endurance: { face: '#3f78f5', edge: '#2347b8', text: '#ffffff' }, // bleu roi
  danger: { face: '#b3263e', edge: '#751526', text: '#ffffff' }, // rouge sombre
  gold: { face: '#f6c21d', edge: '#b5870a', text: '#2b1d05' }, // sélectionné
  neutral: { face: '#56657d', edge: '#323c4f', text: '#ffffff' }, // ardoise
  disabled: { face: '#4b515e', edge: '#32363f', text: '#9aa1ae' },
};

export const BUTTON_DEPTH = 4; // épaisseur du bouton
export const BUTTON_RADIUS = 14;