import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { T, hold, seq } from './animation';
import Reactif from './Reactif';
import Layer from './Layer';

const ASSETS = {
  chain: require('../../assets/characters/pouce_chaine.png'),
  thumb: require('../../assets/characters/pouce_pouce.png'),
};

// ───── Réglages, faciles à ajuster ─────
const SILHOUETTE = '#272738';
const FLASH = '#f1c40f'; // éclair doré du sauvetage

// Pivots, en % du carré 1024 (transformOrigin)
const PIVOT = {
  pendulum: '50% 15%', // centre de l'anneau du haut
  thumb: '50% 46%', // sous le dernier maillon
};

// Distances données pour un personnage affiché à 256 px : elles s'adaptent à la taille réelle
const REF = 256;
const BOB = 4; // montée du pendule au repos

// Limites testées : balancier ±15° au total, pouce ±8° par rapport à la chaîne
const SWING_IDLE = 6; // ° du pendule au repos
const THUMB_IDLE = 3; // ° du pouce au repos

// La pichenette
const ARM = 300; // armement
const HIT = 120; // frappe
const REARM = 160; // réarmement entre deux frappes
const RETURN_MS = 400; // retour
const SPRING = { damping: 8, stiffness: 120 };

export type PouceEtat =
  | 'repos'
  | 'lancer'
  | 'choix'
  | 'victoire'
  | 'defaite'
  | 'sauvetage';

// Valeurs animées par les états, et leur valeur de repos
const REPOS = {
  swing: 0, // ° ajoutés au balancier
  thumbRot: 0, // ° ajoutés au pouce
  lift: 0, // décalage vertical, en unités de référence
  scale: 1,
  opacity: 1,
  idleAmp: 1, // 1 : le pendule de repos s'applique, 0 : il est en pause
  flash: 0, // opacité de l'éclair doré
};

type Cle = keyof typeof REPOS;
type Valeurs = Record<Cle, SharedValue<number>>;

// Ramène en douceur toutes les valeurs au repos (ce qui interrompt l'état en cours)
const reinitialiser = (v: Valeurs, ms: number) => {
  (Object.keys(REPOS) as Cle[]).forEach(k => {
    v[k].value = withTiming(REPOS[k], { duration: ms });
  });
};

// La pichenette : armement, frappe, (réarmement, frappe), retour. Renvoie la durée.
const lancer = (v: Valeurs, frappes: 1 | 2): number => {
  const hit = Easing.out(Easing.back(1.7));
  const swing = [T(-14, ARM), T(12, HIT, hit)];
  const thumb = [T(-8, ARM), T(8, HIT, hit)];
  let duree = ARM + HIT;
  if (frappes === 2) {
    swing.push(T(-10, REARM), T(12, HIT, hit));
    thumb.push(T(-6, REARM), T(8, HIT, hit));
    duree += REARM + HIT;
  }
  duree += RETURN_MS;
  v.swing.value = seq([...swing, withSpring(0, SPRING)]);
  v.thumbRot.value = seq([...thumb, withSpring(0, SPRING)]);
  v.idleAmp.value = seq([T(0, 150), hold(duree - 450, 0), T(1, 300)]);
  return duree;
};

// Joue un état et renvoie sa durée en ms (null : il dure jusqu'au retour au repos)
const jouerEtat = (
  v: Valeurs,
  etat: Exclude<PouceEtat, 'repos'>,
  frappes: 1 | 2,
  cote: 'gauche' | 'droite',
): number | null => {
  switch (etat) {
    case 'lancer':
      return lancer(v, frappes);

    case 'choix': // pointe vers la pièce gardée et y reste
      v.swing.value = withSpring(cote === 'gauche' ? -10 : 10, {
        damping: 10,
        stiffness: 120,
      });
      v.idleAmp.value = T(0, 200);
      return null;

    case 'sauvetage': // ~280 ms : gonflement discret et éclair doré
      v.scale.value = seq([T(1.12, 110), T(1, 170)]);
      v.flash.value = seq([T(0.75, 90), T(0, 190)]);
      return 280;

    case 'victoire': // ~1200 ms
      v.lift.value = seq([T(-20, 150), withSpring(0, { damping: 6, stiffness: 150 })]);
      v.thumbRot.value = seq([
        hold(100, 0),
        T(6, 90),
        T(-6, 90),
        T(6, 90),
        T(-6, 90),
        T(0, 90),
      ]);
      v.scale.value = seq([T(1.08, 200), T(1, 300)]);
      v.idleAmp.value = seq([T(0, 150), hold(750, 0), T(1, 300)]);
      return 1200;

    case 'defaite': // ~1500 ms
      // Pendule lâché : ±10° qui s'éteint en trois oscillations
      v.swing.value = seq([
        T(10, 150, Easing.out(Easing.quad)),
        T(-8, 260),
        T(5, 230),
        T(-2.5, 200),
        T(0, 200),
        hold(460, 0),
      ]);
      // Le pouce pend, mou, puis revient lentement
      v.thumbRot.value = seq([T(5, 300), hold(300, 5), T(0, 900)]);
      v.opacity.value = seq([T(0.8, 200), hold(900, 0.8), T(1, 400)]);
      v.idleAmp.value = seq([T(0, 150), hold(1050, 0), T(1, 300)]);
      return 1500;
  }
};

type Props = {
  size: number;
  present?: boolean; // faux : silhouette sombre, sans animation
  etat?: PouceEtat;
  declencheur?: number; // à incrémenter pour rejouer le même état
  nombreFrappes?: 1 | 2;
  cote?: 'gauche' | 'droite'; // pour l'état 'choix'
  onFrappe?: () => void; // au début de chaque frappe
  onAnimationFin?: () => void; // quand un état se termine (sauf 'choix')
  gains?: number; // réussites de la série en cours (grossissement)
};

const PouceDeKrark = ({
  size,
  present = true,
  etat = 'repos',
  declencheur = 0,
  nombreFrappes = 1,
  cote = 'gauche',
  onFrappe,
  onAnimationFin,
  gains = 0,
}: Props) => {
  const m = size / REF;

  // Valeurs pilotées par les états
  const v: Valeurs = {
    swing: useSharedValue(REPOS.swing),
    thumbRot: useSharedValue(REPOS.thumbRot),
    lift: useSharedValue(REPOS.lift),
    scale: useSharedValue(REPOS.scale),
    opacity: useSharedValue(REPOS.opacity),
    idleAmp: useSharedValue(REPOS.idleAmp),
    flash: useSharedValue(REPOS.flash),
  };

  // Boucles de repos
  const pendulum = useSharedValue(-1);
  const thumbPhase = useSharedValue(-1);

  const frappeRef = useRef(onFrappe);
  const finRef = useRef(onAnimationFin);
  frappeRef.current = onFrappe;
  finRef.current = onAnimationFin;

  // Pendule de repos : le pouce suit la chaîne avec un quart de cycle de retard
  useEffect(() => {
    const idle = [pendulum, thumbPhase];
    idle.forEach(x => cancelAnimation(x));
    pendulum.value = -1;
    thumbPhase.value = -1;
    if (present) {
      const ease = Easing.inOut(Easing.sin);
      pendulum.value = withRepeat(
        withTiming(1, { duration: 1250, easing: ease }),
        -1,
        true,
      );
      thumbPhase.value = withDelay(
        625,
        withRepeat(withTiming(1, { duration: 1250, easing: ease }), -1, true),
      );
    }
    return () => idle.forEach(x => cancelAnimation(x));
  }, [present, pendulum, thumbPhase]);

  // États : chaque nouvel état interrompt le précédent, puis prévient à la fin
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    reinitialiser(v, present ? 200 : 0);
    if (present && etat !== 'repos') {
      const duree = jouerEtat(v, etat, nombreFrappes, cote);
      if (etat === 'lancer') {
        timers.push(setTimeout(() => frappeRef.current?.(), ARM));
        if (nombreFrappes === 2) {
          timers.push(
            setTimeout(() => frappeRef.current?.(), ARM + HIT + REARM),
          );
        }
      }
      if (duree !== null) {
        timers.push(setTimeout(() => finRef.current?.(), duree));
      }
    }
    return () => timers.forEach(t => clearTimeout(t));
    // v regroupe des valeurs partagées stables : inutile de le surveiller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat, declencheur, present, nombreFrappes, cote]);

  // Le balancier contient la chaîne et le pouce
  const pendulumStyle = useAnimatedStyle(() => ({
    opacity: v.opacity.value,
    transformOrigin: PIVOT.pendulum,
    transform: [
      {
        translateY:
          (v.lift.value - BOB * Math.abs(pendulum.value) * v.idleAmp.value) * m,
      },
      { rotate: `${pendulum.value * SWING_IDLE * v.idleAmp.value + v.swing.value}deg` },
      { scale: v.scale.value },
    ],
  }));

  // Le pouce a sa propre rotation, avec du retard au bout de la chaîne
  const thumbStyle = useAnimatedStyle(() => ({
    transformOrigin: PIVOT.thumb,
    transform: [
      {
        rotate: `${thumbPhase.value * THUMB_IDLE * v.idleAmp.value + v.thumbRot.value}deg`,
      },
    ],
  }));

  const flashStyle = useAnimatedStyle(() => ({ opacity: v.flash.value }));

  const tint = present ? undefined : SILHOUETTE;

  return (
    <View style={{ width: size, height: size }}>
      <Reactif gains={gains} actif={present} pivot={PIVOT.pendulum}>
        <Animated.View style={[styles.fill, pendulumStyle]}>
          <Layer source={ASSETS.chain} tint={tint} />
          <Layer source={ASSETS.thumb} tint={tint} style={thumbStyle} />
          {present && (
            <Layer
              source={ASSETS.thumb}
              tint={FLASH}
              style={[thumbStyle, flashStyle]}
            />
          )}
        </Animated.View>
      </Reactif>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { position: 'absolute', width: '100%', height: '100%' },
});

export default PouceDeKrark;