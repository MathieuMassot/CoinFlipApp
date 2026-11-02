import React, { useEffect } from 'react';
import { View } from 'react-native';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { rand, seq } from './animation';
import ContactShadow from './ContactShadow';
import Layer from './Layer';

const ASSETS = {
  cape: require('../../assets/characters/zndrsplt_cape.png'),
  eyeWhite: require('../../assets/characters/zndrsplt_oeil-blanc.png'),
  iris: require('../../assets/characters/zndrsplt_iris.png'),
  body: require('../../assets/characters/zndrsplt_corps.png'),
  glint: require('../../assets/characters/zndrsplt_reflet.png'),
  orb: require('../../assets/characters/zndrsplt_orbe.png'),
  particles: require('../../assets/characters/zndrsplt_particules.png'),
};

const SILHOUETTE = '#272738';
const IRIS_X = 30; // px du carré 1024
const IRIS_Y = 20;
const GLINT_FOLLOW = 0.3; // le reflet suit l'iris à 30 %

type GazeStep = { x: number; y: number; move: number; rest: number };

// Un parcours de regard : des cibles aléatoires, un mouvement rapide puis une pause
const gazePlan = (): GazeStep[] =>
  Array.from({ length: 10 }, () => ({
    x: rand(-IRIS_X, IRIS_X),
    y: rand(-IRIS_Y, IRIS_Y),
    move: rand(110, 230),
    rest: rand(500, 2000),
  }));

// X et Y partent du même parcours : l'iris se déplace en diagonale, d'un seul geste
const gazeSequence = (plan: GazeStep[], axis: 'x' | 'y') =>
  seq(
    plan.flatMap(step => [
      withTiming(step[axis], {
        duration: step.move,
        easing: Easing.out(Easing.cubic),
      }),
      withDelay(step.rest, withTiming(step[axis], { duration: 0 })),
    ]),
  );

type Props = { size: number; present: boolean };

const ZndrspltArt = ({ size, present }: Props) => {
  const k = size / 1024; // du carré 1024 à la taille affichée
  const irisX = useSharedValue(0);
  const irisY = useSharedValue(0);
  const orb = useSharedValue(0);
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);
  const cape = useSharedValue(0);

  useEffect(() => {
    const all = [irisX, irisY, orb, spin, pulse, cape];
    all.forEach(v => cancelAnimation(v));
    all.forEach(v => {
      v.value = 0;
    });

    if (present) {
      const ease = Easing.inOut(Easing.sin);
      const plan = gazePlan();
      irisX.value = withRepeat(gazeSequence(plan, 'x'), -1);
      irisY.value = withRepeat(gazeSequence(plan, 'y'), -1);
      orb.value = withRepeat(
        withTiming(1, { duration: 1500, easing: ease }),
        -1,
        true,
      );
      spin.value = withRepeat(
        withTiming(360, { duration: 7000, easing: Easing.linear }),
        -1,
        false,
      );
      pulse.value = withRepeat(
        withTiming(1, { duration: 3200, easing: ease }),
        -1,
        true,
      );
      cape.value = withRepeat(
        withTiming(1, { duration: 2600, easing: ease }),
        -1,
        true,
      );
    }
    return () => all.forEach(v => cancelAnimation(v));
  }, [present, irisX, irisY, orb, spin, pulse, cape]);

  const irisStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: irisX.value * k },
      { translateY: irisY.value * k },
    ],
  }));

  const glintStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: irisX.value * GLINT_FOLLOW * k },
      { translateY: irisY.value * GLINT_FOLLOW * k },
    ],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transformOrigin: '38% 31%',
    opacity: 0.8 + 0.2 * orb.value,
    transform: [{ scale: 0.95 + 0.1 * orb.value }],
  }));

  const particlesStyle = useAnimatedStyle(() => ({
    transformOrigin: '38% 31%',
    transform: [
      { rotate: `${spin.value}deg` },
      { scale: 0.85 + 0.3 * pulse.value },
    ],
  }));

  const capeStyle = useAnimatedStyle(() => ({
    transformOrigin: '48% 48%',
    transform: [
      { rotate: `${(cape.value * 2 - 1) * 3}deg` },
      { scaleX: 0.97 + 0.03 * cape.value },
    ],
  }));

  const tint = present ? undefined : SILHOUETTE;

  return (
    <View style={{ width: size, height: size }}>
      {present && <ContactShadow source={ASSETS.body} size={size} />}
      <Layer source={ASSETS.cape} tint={tint} style={capeStyle} />
      <Layer source={ASSETS.eyeWhite} tint={tint} />
      <Layer source={ASSETS.iris} tint={tint} style={irisStyle} />
      <Layer source={ASSETS.body} tint={tint} />
      <Layer source={ASSETS.glint} tint={tint} style={glintStyle} />
      <Layer source={ASSETS.orb} tint={tint} style={orbStyle} />
      <Layer source={ASSETS.particles} tint={tint} style={particlesStyle} />
    </View>
  );
};

export default ZndrspltArt;