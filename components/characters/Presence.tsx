import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ───── Réglages ─────
const DROP = 36; // dp : de combien le personnage tombe en arrivant
const LEAVE_MS = 260; // durée du départ
const RING_COLOR = '#f6c21d'; // onde au sol à l'arrivée

type Props = {
  present: boolean;
  size: number; // taille d'affichage du personnage
  onde?: boolean; // faux : pas d'onde au sol (le Pouce, qui pend)
  // Reçoit `shown` : vrai tant que le personnage doit être affiché en couleur,
  // y compris pendant son départ (la silhouette n'apparaît qu'après).
  children: (shown: boolean) => ReactNode;
};

const Presence = ({ present, size, onde = true, children }: Props) => {
  const [shown, setShown] = useState(present);
  const first = useRef(true);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const ring = useSharedValue(1); // 0 : l'onde naît ; 1 : elle s'est effacée

  useEffect(() => {
    if (first.current) {
      first.current = false; // pas d'animation au premier affichage
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    [y, scale, opacity, ring].forEach(v => cancelAnimation(v));

    if (present) {
      // Arrivée : il tombe, rebondit en se tassant, une onde dorée se propage
      setShown(true);
      y.value = -DROP;
      scale.value = 0.8;
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 120 });
      y.value = withSpring(0, { damping: 7, stiffness: 150 });
      scale.value = withSequence(
        withTiming(0.92, { duration: 160 }),
        withSpring(1, { damping: 6, stiffness: 180 }),
      );
      ring.value = 0;
      ring.value = withTiming(1, {
        duration: 520,
        easing: Easing.out(Easing.quad),
      });
    } else {
      // Départ : il s'envole en rétrécissant, puis la silhouette apparaît en fondu
      y.value = withTiming(-DROP * 0.6, {
        duration: LEAVE_MS,
        easing: Easing.in(Easing.quad),
      });
      scale.value = withTiming(0.55, { duration: LEAVE_MS });
      opacity.value = withTiming(0, { duration: LEAVE_MS });
      timer = setTimeout(() => {
        setShown(false);
        y.value = 0;
        scale.value = 1;
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: 200 });
      }, LEAVE_MS);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [present, y, scale, opacity, ring]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transformOrigin: '50% 92%',
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));

  // Onde aplatie au niveau des pieds : elle s'étend et s'efface
  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - ring.value) * 0.8,
    transform: [{ scale: 0.3 + 0.9 * ring.value }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      {onde && (
        <Animated.View
          style={[
            styles.ring,
            {
              left: size * 0.2,
              top: size * 0.82,
              width: size * 0.6,
              height: size * 0.16,
            },
            ringStyle,
          ]}
        />
      )}
      <Animated.View style={[styles.fill, bodyStyle]}>
        {children(shown)}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { position: 'absolute', width: '100%', height: '100%' },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: RING_COLOR,
    pointerEvents: 'none',
  },
});

export default Presence;