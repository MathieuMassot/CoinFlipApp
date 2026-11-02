import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  cancelAnimation,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { gazePlan, gazeSequence, seq } from './animation';
import Layer from './Layer';
import OrbiteDePieces from './OrbiteDePieces';

const ASSETS = {
  backFlames: require('../../assets/characters/yusri_flammes-dos.png'),
  flameL: require('../../assets/characters/yusri_flamme-g.png'),
  flameR: require('../../assets/characters/yusri_flamme-d.png'),
  capeL: require('../../assets/characters/yusri_cape-g.png'),
  capeR: require('../../assets/characters/yusri_cape-d.png'),
  eyes: require('../../assets/characters/yusri_yeux.png'),
  body: require('../../assets/characters/yusri_corps.png'),
  bodyOff: require('../../assets/characters/yusri_corps-eteint.png'),
  capeCenter: require('../../assets/characters/yusri_cape-centre.png'),
};

// ───── Réglages, faciles à ajuster ─────
const SILHOUETTE = '#272738';

// Pivots, en % du carré 1024 (transformOrigin)
const PIVOT = {
  backFlames: '50% 78%',
  flameL: '20% 65%',
  flameR: '80% 65%',
  capeL: '30% 72%',
  capeR: '71% 72%',
  body: '50% 92%', // écrasement à l'atterrissage
  eyes: '50% 37%',
};

// Distances (flottaison, envol, chute, tremblement) données pour un personnage
// affiché à 256 px : elles s'adaptent à la taille réelle.
const REF = 256;
const FLOAT = 8;

// Limites testées : ne pas dépasser, sinon des zones cachées apparaissent
const CAPE_IDLE = 3.5; // ° au repos
const CAPE_STATE = 4.5; // ° en plus pendant un état (8° max au total)
const SKEW_MAX = 3; // ° (limite : 4)
const EYE_X = 11; // px du carré 1024 (limite : 11)
const EYE_Y = 8;

const ORBIT_SECONDS = 5; // un tour complet de l'orbite

// Progression selon les échecs consécutifs (0 à 5)
const BACK_REST = [1, 0.85, 0.7, 0.55, 0.4, 0.4];
const DEAD_REST = [0, 0.2, 0.4, 0.6, 0.8, 0.8];

export type YusriEtat =
  | 'repos'
  | 'victoire'
  | 'defaite'
  | 'victoire-totale'
  | 'defaite-totale';

// Durées des séquences, en ms (le callback de fin est appelé après)
const DUREE: Record<Exclude<YusriEtat, 'repos'>, number> = {
  victoire: 900,
  defaite: 1500,
  'victoire-totale': 2000,
  'defaite-totale': 3000,
};

// Valeurs animées par les états, et leur valeur de repos
const REPOS = {
  dropY: 0, // décalage vertical (envol, chute)
  squash: 1, // écrasement
  shakeX: 0, // tremblement
  tilt: 0, // rotation du conteneur
  backOpacity: 1,
  backScale: 1,
  dead: 0, // opacité du corps éteint
  eyeOpacity: 1,
  eyeScale: 1,
  handScale: 1,
  handOpacity: 1,
  capeState: 0,
  orbitSpeed: 1,
  orbitWiden: 1,
  coinsY: 0,
  coinsOpacity: 1,
  floatAmp: 1,
};

type Cle = keyof typeof REPOS;
type Valeurs = Record<Cle, SharedValue<number>>;

type Ease = (t: number) => number;
const T = (to: number, duration: number, easing?: Ease) =>
  withTiming(to, easing ? { duration, easing } : { duration });
// Reste à cette valeur pendant ms millisecondes
const hold = (ms: number, value: number) =>
  withDelay(ms, withTiming(value, { duration: 0 }));

// Ramène en douceur toutes les valeurs au repos (ce qui interrompt l'état en cours)
const reinitialiser = (v: Valeurs, ms: number) => {
  (Object.keys(REPOS) as Cle[]).forEach(k => {
    v[k].value = withTiming(REPOS[k], { duration: ms });
  });
};

const jouerEtat = (v: Valeurs, etat: Exclude<YusriEtat, 'repos'>) => {
  switch (etat) {
    case 'victoire': // ~900 ms
      v.handScale.value = seq([T(1.15, 150), hold(250, 1.15), T(1, 500)]);
      v.backScale.value = seq([T(1.015, 150), hold(250, 1.015), T(1, 500)]);
      v.eyeScale.value = seq([T(1.1, 150), hold(250, 1.1), T(1, 500)]);
      v.orbitSpeed.value = seq([T(2.5, 150), hold(250, 2.5), T(1, 500)]);
      break;

    case 'defaite': // ~1500 ms
      v.shakeX.value = seq([
        T(6, 40),
        T(-6, 70),
        T(5, 60),
        T(-5, 60),
        T(3, 50),
        T(0, 50),
        hold(1170, 0),
      ]);
      v.handScale.value = seq([T(0.2, 300), hold(400, 0.2), T(1, 800)]);
      v.handOpacity.value = seq([T(0.3, 300), hold(400, 0.3), T(1, 800)]);
      v.backOpacity.value = seq([T(0.6, 300), hold(400, 0.6), T(1, 800)]);
      v.dead.value = seq([T(0.5, 300), hold(400, 0.5), T(0, 800)]);
      v.eyeOpacity.value = seq([T(0.5, 300), hold(400, 0.5), T(1, 800)]);
      v.floatAmp.value = seq([T(0, 200), hold(500, 0), T(1, 800)]);
      v.dropY.value = seq([T(28, 500), hold(200, 28), T(0, 800)]);
      v.capeState.value = seq([
        T(-CAPE_STATE, 500),
        hold(200, -CAPE_STATE),
        T(0, 800),
      ]);
      // Les pièces tombent (gravité), disparaissent, puis reviennent
      v.coinsY.value = seq([
        T(120, 700, Easing.in(Easing.quad)),
        hold(500, 120),
        T(0, 0),
        hold(300, 0),
      ]);
      v.coinsOpacity.value = seq([hold(500, 1), T(0, 200), hold(500, 0), T(1, 300)]);
      break;

    case 'victoire-totale': // ~2000 ms
      v.squash.value = seq([T(0.94, 200), T(1, 150), hold(1650, 1)]);
      v.dropY.value = seq([
        hold(200, 0),
        T(-55, 400), // envol
        hold(800, -55),
        withSpring(0, { damping: 9, stiffness: 140 }), // retour avec rebond
      ]);
      v.floatAmp.value = seq([T(0, 150), hold(1250, 0), T(1, 600)]);
      v.capeState.value = seq([
        hold(200, 0),
        T(CAPE_STATE, 300),
        hold(900, CAPE_STATE),
        T(0, 600),
      ]);
      v.backScale.value = seq([hold(600, 1), T(1.02, 200), hold(600, 1.02), T(1, 600)]);
      v.handScale.value = seq([hold(600, 1), T(1.4, 250), hold(550, 1.4), T(1, 600)]);
      v.eyeScale.value = seq([T(1.1, 300), hold(1100, 1.1), T(1, 600)]);
      v.orbitSpeed.value = seq([hold(600, 1), T(4, 400), hold(400, 4), T(1, 600)]);
      v.orbitWiden.value = seq([hold(600, 1), T(1.5, 400), hold(400, 1.5), T(1, 600)]);
      // Les pièces jaillissent vers le haut
      v.coinsY.value = seq([
        hold(900, 0),
        T(-160, 500, Easing.in(Easing.quad)),
        hold(100, -160),
        T(0, 0),
        hold(500, 0),
      ]);
      v.coinsOpacity.value = seq([
        hold(1100, 1),
        T(0, 300),
        hold(100, 0),
        T(1, 400),
        hold(100, 1),
      ]);
      break;

    case 'defaite-totale': // ~3000 ms
      // 0 à 0,3 s : choc fort
      v.shakeX.value = seq([
        T(12, 40),
        T(-12, 60),
        T(10, 50),
        T(-10, 50),
        T(5, 50),
        T(0, 50),
        hold(2700, 0),
      ]);
      v.tilt.value = seq([T(3, 60), T(-3, 80), T(2, 60), T(0, 100), hold(2700, 0)]);
      // 0,3 à 0,9 s : extinction, l'une après l'autre ; 2 à 3 s : renaissance
      v.eyeOpacity.value = seq([
        hold(300, 1),
        T(0.15, 300),
        hold(1400, 0.15),
        T(1, 400),
        hold(600, 1),
      ]);
      v.handScale.value = seq([
        hold(300, 1),
        T(0, 300),
        hold(1700, 0),
        T(1, 500),
        hold(200, 1),
      ]);
      v.handOpacity.value = seq([
        hold(300, 1),
        T(0, 300),
        hold(1700, 0),
        T(1, 500),
        hold(200, 1),
      ]);
      v.backOpacity.value = seq([hold(400, 1), T(0, 300), hold(1900, 0), T(1, 400)]);
      v.dead.value = seq([hold(500, 0), T(1, 400), hold(1700, 1), T(0, 400)]);
      // 0,9 à 1,4 s : chute, écrasement, puis immobile ; il redécolle à 2,5 s
      v.dropY.value = seq([hold(900, 0), T(70, 500), hold(1100, 70), T(0, 500)]);
      v.squash.value = seq([hold(1300, 1), T(0.9, 100), T(1, 150), hold(1450, 1)]);
      v.floatAmp.value = seq([T(0, 200), hold(2300, 0), T(1, 500)]);
      v.capeState.value = seq([
        hold(300, 0),
        T(-CAPE_STATE, 600),
        hold(1600, -CAPE_STATE),
        T(0, 500),
      ]);
      // Les pièces tombent, rebondissent une fois, puis disparaissent
      v.coinsY.value = seq([
        hold(300, 0),
        T(110, 450, Easing.in(Easing.quad)),
        T(80, 150, Easing.out(Easing.quad)),
        T(110, 150, Easing.in(Easing.quad)),
        hold(350, 110),
        T(0, 0),
        hold(1600, 0),
      ]);
      v.coinsOpacity.value = seq([
        hold(1150, 1),
        T(0, 250),
        hold(1000, 0),
        T(1, 500),
        hold(100, 1),
      ]);
      break;
  }
};

type Props = {
  size: number;
  present?: boolean; // faux : silhouette sombre, sans animation
  etat?: YusriEtat;
  declencheur?: number; // à incrémenter pour rejouer le même état
  nombrePieces?: number; // de 1 à 5
  victoiresConsecutives?: number; // 0 à 5
  echecsConsecutifs?: number; // 0 à 5
  onAnimationFin?: () => void;
};

const YusriArt = ({
  size,
  present = true,
  etat = 'repos',
  declencheur = 0,
  nombrePieces = 5,
  victoiresConsecutives = 0,
  echecsConsecutifs = 0,
  onAnimationFin,
}: Props) => {
  const m = size / REF; // distances en unités de référence
  const k = size / 1024; // yeux : coordonnées 1024

  // Valeurs pilotées par les états
  const v: Valeurs = {
    dropY: useSharedValue(REPOS.dropY),
    squash: useSharedValue(REPOS.squash),
    shakeX: useSharedValue(REPOS.shakeX),
    tilt: useSharedValue(REPOS.tilt),
    backOpacity: useSharedValue(REPOS.backOpacity),
    backScale: useSharedValue(REPOS.backScale),
    dead: useSharedValue(REPOS.dead),
    eyeOpacity: useSharedValue(REPOS.eyeOpacity),
    eyeScale: useSharedValue(REPOS.eyeScale),
    handScale: useSharedValue(REPOS.handScale),
    handOpacity: useSharedValue(REPOS.handOpacity),
    capeState: useSharedValue(REPOS.capeState),
    orbitSpeed: useSharedValue(REPOS.orbitSpeed),
    orbitWiden: useSharedValue(REPOS.orbitWiden),
    coinsY: useSharedValue(REPOS.coinsY),
    coinsOpacity: useSharedValue(REPOS.coinsOpacity),
    floatAmp: useSharedValue(REPOS.floatAmp),
  };

  // Progression (selon les séries de victoires ou d'échecs)
  const restBack = useSharedValue(1);
  const restDead = useSharedValue(0);
  const restHands = useSharedValue(1);

  // Boucles de repos
  const floatPhase = useSharedValue(-1);
  const capePhase = useSharedValue(-1);
  const backPhase = useSharedValue(0);
  const pulseL = useSharedValue(0);
  const pulseR = useSharedValue(0);
  const eyeX = useSharedValue(0);
  const eyeY = useSharedValue(0);
  const orbitAngle = useSharedValue(0);

  const finRef = useRef(onAnimationFin);
  finRef.current = onAnimationFin;

  // Boucles de repos : flottaison, cape, flammes, regard
  useEffect(() => {
    const idle = [floatPhase, capePhase, backPhase, pulseL, pulseR, eyeX, eyeY];
    idle.forEach(x => cancelAnimation(x));
    floatPhase.value = -1;
    capePhase.value = -1;
    backPhase.value = 0;
    pulseL.value = 0;
    pulseR.value = 0;
    eyeX.value = 0;
    eyeY.value = 0;

    if (present) {
      const ease = Easing.inOut(Easing.sin);
      floatPhase.value = withRepeat(
        withTiming(1, { duration: 1250, easing: ease }),
        -1,
        true,
      );
      // La cape suit avec un quart de cycle de retard
      capePhase.value = withDelay(
        625,
        withRepeat(withTiming(1, { duration: 1100, easing: ease }), -1, true),
      );
      backPhase.value = withRepeat(
        withTiming(1, { duration: 900, easing: ease }),
        -1,
        true,
      );
      pulseL.value = withRepeat(
        withTiming(1, { duration: 700, easing: ease }),
        -1,
        true,
      );
      pulseR.value = withDelay(
        350,
        withRepeat(withTiming(1, { duration: 700, easing: ease }), -1, true),
      );
      const plan = gazePlan(EYE_X, EYE_Y);
      eyeX.value = withRepeat(gazeSequence(plan, 'x'), -1);
      eyeY.value = withRepeat(gazeSequence(plan, 'y'), -1);
    }
    return () => idle.forEach(x => cancelAnimation(x));
  }, [present, floatPhase, capePhase, backPhase, pulseL, pulseR, eyeX, eyeY]);

  // Rotation de l'orbite : une horloge qui permet de changer la vitesse en douceur
  const frame = useFrameCallback(info => {
    const dt = info.timeSincePreviousFrame ?? 16;
    orbitAngle.value =
      (orbitAngle.value +
        (dt / 1000) * (360 / ORBIT_SECONDS) * v.orbitSpeed.value) %
      360;
  }, false);
  useEffect(() => {
    frame.setActive(present);
    return () => frame.setActive(false);
  }, [present, frame]);

  // Progression : flammes du dos et corps éteint selon les échecs, flammes des mains selon les victoires
  useEffect(() => {
    const e = Math.min(5, Math.max(0, Math.round(echecsConsecutifs)));
    const w = Math.min(5, Math.max(0, Math.round(victoiresConsecutives)));
    restBack.value = withTiming(BACK_REST[e], { duration: 600 });
    restDead.value = withTiming(DEAD_REST[e], { duration: 600 });
    restHands.value = withTiming(1 + 0.03 * w, { duration: 600 });
  }, [echecsConsecutifs, victoiresConsecutives, restBack, restDead, restHands]);

  // États : chaque nouvel état interrompt le précédent, puis prévient à la fin
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    reinitialiser(v, present ? 200 : 0);
    if (present && etat !== 'repos') {
      jouerEtat(v, etat);
      timer = setTimeout(() => finRef.current?.(), DUREE[etat]);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // v regroupe des valeurs partagées stables : inutile de le surveiller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat, declencheur, present]);

  const containerStyle = useAnimatedStyle(() => ({
    transformOrigin: PIVOT.body,
    transform: [
      { translateX: v.shakeX.value * m },
      {
        translateY:
          (floatPhase.value * FLOAT * v.floatAmp.value + v.dropY.value) * m,
      },
      { rotate: `${v.tilt.value}deg` },
      { scaleY: v.squash.value },
    ],
  }));

  // L'ombre rétrécit et pâlit quand il monte, grossit et fonce quand il tombe
  const shadowStyle = useAnimatedStyle(() => {
    const up = -(floatPhase.value * FLOAT * v.floatAmp.value + v.dropY.value);
    return {
      opacity: Math.min(0.6, Math.max(0.12, 0.3 - up * 0.004)),
      transform: [{ scaleX: Math.min(1.4, Math.max(0.6, 1 - up * 0.012)) }],
    };
  });

  const backFlamesStyle = useAnimatedStyle(() => ({
    opacity: restBack.value * v.backOpacity.value,
    transformOrigin: PIVOT.backFlames,
    transform: [
      { scaleY: (1 + 0.04 * backPhase.value) * v.backScale.value },
      { skewX: `${(backPhase.value * 2 - 1) * SKEW_MAX}deg` },
    ],
  }));

  const flameLStyle = useAnimatedStyle(() => ({
    opacity: v.handOpacity.value,
    transformOrigin: PIVOT.flameL,
    transform: [
      {
        scale:
          (0.95 + 0.13 * pulseL.value) * restHands.value * v.handScale.value,
      },
    ],
  }));

  const flameRStyle = useAnimatedStyle(() => ({
    opacity: v.handOpacity.value,
    transformOrigin: PIVOT.flameR,
    transform: [
      {
        scale:
          (0.95 + 0.13 * pulseR.value) * restHands.value * v.handScale.value,
      },
    ],
  }));

  // Les deux pans de cape oscillent en sens opposés
  const capeLStyle = useAnimatedStyle(() => ({
    transformOrigin: PIVOT.capeL,
    transform: [
      { rotate: `${capePhase.value * CAPE_IDLE - v.capeState.value}deg` },
    ],
  }));

  const capeRStyle = useAnimatedStyle(() => ({
    transformOrigin: PIVOT.capeR,
    transform: [
      { rotate: `${-capePhase.value * CAPE_IDLE + v.capeState.value}deg` },
    ],
  }));

  const eyesStyle = useAnimatedStyle(() => ({
    opacity: v.eyeOpacity.value,
    transformOrigin: PIVOT.eyes,
    transform: [
      { translateX: eyeX.value * k },
      { translateY: eyeY.value * k },
      { scale: v.eyeScale.value },
    ],
  }));

  const bodyOffStyle = useAnimatedStyle(() => ({
    opacity: Math.max(restDead.value, v.dead.value),
  }));

  const tint = present ? undefined : SILHOUETTE;

  // Fond brun foncé derrière chaque œil, visible quand les yeux s'atténuent
  const eyeBack = (cx: number) => ({
    left: size * (cx - 0.07),
    top: size * (0.37 - 0.06),
    width: size * 0.14,
    height: size * 0.12,
  });

  const orbite = (couche: 'arriere' | 'avant') => (
    <OrbiteDePieces
      couche={couche}
      nombre={nombrePieces}
      size={size}
      angle={orbitAngle}
      elargissement={v.orbitWiden}
      decalageY={v.coinsY}
      opacite={v.coinsOpacity}
    />
  );

  return (
    <View style={{ width: size, height: size }}>
      {present && (
        <Animated.View
          style={[
            styles.shadow,
            {
              left: size * 0.2,
              top: size * 0.9,
              width: size * 0.6,
              height: size * 0.07,
            },
            shadowStyle,
          ]}
        />
      )}
      <Animated.View style={[styles.fill, containerStyle]}>
        {present && orbite('arriere')}
        <Layer source={ASSETS.backFlames} tint={tint} style={backFlamesStyle} />
        {present && (
          <>
            <View style={[styles.eyeBack, eyeBack(0.415)]} />
            <View style={[styles.eyeBack, eyeBack(0.58)]} />
          </>
        )}
        <Layer source={ASSETS.flameL} tint={tint} style={flameLStyle} />
        <Layer source={ASSETS.flameR} tint={tint} style={flameRStyle} />
        <Layer source={ASSETS.capeL} tint={tint} style={capeLStyle} />
        <Layer source={ASSETS.capeR} tint={tint} style={capeRStyle} />
        <Layer source={ASSETS.eyes} tint={tint} style={eyesStyle} />
        <Layer source={ASSETS.body} tint={tint} />
        {present && (
          <Layer source={ASSETS.bodyOff} style={bodyOffStyle} />
        )}
        <Layer source={ASSETS.capeCenter} tint={tint} />
        {present && orbite('avant')}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { position: 'absolute', width: '100%', height: '100%' },
  shadow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#000000',
  },
  eyeBack: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#3A2416',
  },
});

export default YusriArt;