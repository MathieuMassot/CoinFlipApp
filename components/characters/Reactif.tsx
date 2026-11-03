import React, { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Grossissement : +4 % par réussite d'une série, plafonné à +35 %
const GROW_STEP = 0.04;
const GROW_MAX = 0.35;

type Props = {
  gains?: number; // réussites de la série en cours (0 : au repos)
  actif?: boolean; // faux : silhouette, rien ne bouge
  pivot?: string; // origine du grossissement, en % du carré
  children: ReactNode;
};

const Reactif = ({
  gains = 0,
  actif = true,
  pivot = '50% 92%',
  children,
}: Props) => {
  const grow = useSharedValue(1);

  // Un petit rebond à chaque réussite, retour à la taille normale à la fin de la série
  useEffect(() => {
    const target = actif ? 1 + Math.min(GROW_MAX, gains * GROW_STEP) : 1;
    grow.value = withSpring(target, { damping: 9, stiffness: 220 });
  }, [gains, actif, grow]);

  const style = useAnimatedStyle(() => ({
    transformOrigin: pivot,
    transform: [{ scale: grow.value }],
  }));

  return <Animated.View style={[styles.fill, style]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  fill: { position: 'absolute', width: '100%', height: '100%' },
});

export default Reactif;