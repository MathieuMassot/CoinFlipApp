import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { rand, seq } from './animation';
import ContactShadow from './ContactShadow';
import Layer from './Layer';

const ASSETS = {
  armLeft: require('../../assets/characters/okaun_bras-gauche.png'),
  body: require('../../assets/characters/okaun_corps.png'),
  fistRight: require('../../assets/characters/okaun_poing-droit.png'),
  eye: require('../../assets/characters/okaun_oeil.png'),
};

const SILHOUETTE = '#272738';

// En px du carré 1024. Tu avais demandé 2 à 4 : à la taille affichée (environ 124 dp),
// 1 px du carré vaut 0,12 dp, donc c'est monté à 8 pour que le tremblement se voie.
const EYE_JITTER = 8;

// Tremblement : une série de petits déplacements rapides, puis une pause
const jitter = (amp: number) => {
  const moves = Array.from({ length: 8 + Math.floor(rand(0, 6)) }, () =>
    withTiming(rand(-amp, amp), { duration: rand(35, 90) }),
  );
  return seq([
    ...moves,
    withTiming(0, { duration: 70 }),
    withDelay(rand(700, 2200), withTiming(0, { duration: 0 })),
  ]);
};

// Le poing se serre de temps en temps, après une pause aléatoire
const clench = () =>
  seq([
    withDelay(rand(1800, 3600), withTiming(1, { duration: 0 })),
    withTiming(0.95, { duration: 130 }),
    withTiming(0.95, { duration: 220 }),
    withTiming(1, { duration: 260 }),
  ]);

type Props = { size: number; present: boolean };

const OkaunArt = ({ size, present }: Props) => {
  const k = size / 1024; // du carré 1024 à la taille affichée
  const breath = useSharedValue(1);
  const eyeX = useSharedValue(0);
  const eyeY = useSharedValue(0);
  const fist = useSharedValue(1);
  const arm = useSharedValue(0);

  useEffect(() => {
    const all = [breath, eyeX, eyeY, fist, arm];
    all.forEach(v => cancelAnimation(v));
    breath.value = 1;
    eyeX.value = 0;
    eyeY.value = 0;
    fist.value = 1;
    arm.value = 0;

    if (present) {
      const ease = Easing.inOut(Easing.sin);
      breath.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2200, easing: ease }),
          withTiming(1, { duration: 2200, easing: ease }),
        ),
        -1,
      );
      eyeX.value = withRepeat(jitter(EYE_JITTER), -1);
      eyeY.value = withRepeat(jitter(EYE_JITTER), -1);
      fist.value = withRepeat(clench(), -1);
      arm.value = withRepeat(
        withTiming(1, { duration: 2600, easing: ease }),
        -1,
        true,
      );
    }
    return () => all.forEach(v => cancelAnimation(v));
  }, [present, breath, eyeX, eyeY, fist, arm]);

  // Respiration : sur le conteneur, origine aux pieds, toutes les pièces restent solidaires
  const breathStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 92%',
    transform: [{ scaleY: breath.value }],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: eyeX.value * k }, { translateY: eyeY.value * k }],
  }));

  const fistStyle = useAnimatedStyle(() => {
    const squeeze = (1 - fist.value) / 0.05; // 0 au repos, 1 poing serré
    return {
      transformOrigin: '90% 57%',
      transform: [{ scale: fist.value }, { rotate: `${-4 * squeeze}deg` }],
    };
  });

  const armStyle = useAnimatedStyle(() => ({
    transformOrigin: '34% 35%',
    transform: [{ rotate: `${(arm.value * 2 - 1) * 7}deg` }],
  }));

  const tint = present ? undefined : SILHOUETTE;

  return (
    <View style={{ width: size, height: size }}>
      {present && <ContactShadow source={ASSETS.body} size={size} />}
      <Animated.View style={[styles.fill, breathStyle]}>
        <Layer source={ASSETS.armLeft} tint={tint} style={armStyle} />
        <Layer source={ASSETS.body} tint={tint} />
        <Layer source={ASSETS.fistRight} tint={tint} style={fistStyle} />
        <Layer source={ASSETS.eye} tint={tint} style={eyeStyle} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { position: 'absolute', width: '100%', height: '100%' },
});

export default OkaunArt;