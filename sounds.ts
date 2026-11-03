import { GameEvent } from './game';

// Un nom = un fichier .mp3 dans android/app/src/main/res/raw
export const SOUND_FILES = {
  yusri_arrivee: 'yusri_arrivee.mp3',
  yusri_depart: 'yusri_depart.mp3',
  yusri_jackpot: 'yusri_jackpot.mp3',
  yusri_catastrophe: 'yusri_catastrophe.mp3',
  okaun_arrivee: 'okaun_arrivee.mp3',
  okaun_depart: 'okaun_depart.mp3',
  okaun_palier_40: 'okaun_palier_40.mp3',
  okaun_palier_350: 'okaun_palier_350.mp3',
  okaun_palier_3000: 'okaun_palier_3000.mp3',
  okaun_palier_1000000: 'okaun_palier_1000000.mp3',
  z_arrivee: 'z_arrivee.mp3',
  z_depart: 'z_depart.mp3',
  z_cartes_5: 'z_cartes_5.mp3',
  z_cartes_10: 'z_cartes_10.mp3',
  z_cartes_25: 'z_cartes_25.mp3',
  z_cartes_50: 'z_cartes_50.mp3',
} as const;

export type SoundName = keyof typeof SOUND_FILES;

// Palier franchi → son (les paliers eux-mêmes sont dans game.ts)
const OKAUN_SOUNDS: Record<number, SoundName> = {
  40: 'okaun_palier_40',
  350: 'okaun_palier_350',
  3000: 'okaun_palier_3000',
  1000000: 'okaun_palier_1000000',
};

const Z_SOUNDS: Record<number, SoundName> = {
  5: 'z_cartes_5',
  10: 'z_cartes_10',
  25: 'z_cartes_25',
  50: 'z_cartes_50',
};

// Une seule voix par série, dans cet ordre : jackpot de Yusri, catastrophe de Yusri,
// palier d'Okaun (le plus haut franchi), palier du Z (le plus haut franchi).
export const soundForEvents = (events: GameEvent[]): SoundName | null => {
  if (events.some(e => e.type === 'yusriJackpot')) {
    return 'yusri_jackpot';
  }
  if (events.some(e => e.type === 'yusriDisaster')) {
    return 'yusri_catastrophe';
  }

  const okaun = Math.max(
    0,
    ...events.flatMap(e => (e.type === 'okaunMilestone' ? [e.threshold] : [])),
  );
  if (okaun > 0) {
    return OKAUN_SOUNDS[okaun] ?? null;
  }

  const z = Math.max(
    0,
    ...events.flatMap(e => (e.type === 'zMilestone' ? [e.threshold] : [])),
  );
  if (z > 0) {
    return Z_SOUNDS[z] ?? null;
  }

  return null;
};