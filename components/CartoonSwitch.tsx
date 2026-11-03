import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { OUTLINE, TONES, Tone } from '../theme';

const W = 56;
const H = 30;
const BORDER = 2.5;
const KNOB = 22;
const PAD = 2;
const TRAVEL = W - 2 * BORDER - KNOB - 2 * PAD; // course du bouton rond

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  tone?: Tone; // couleur quand l'interrupteur est activé
};

// Interrupteur dans le style des boutons : contour sombre, bouton rond qui glisse
const CartoonSwitch = ({
  value,
  onValueChange,
  disabled = false,
  tone = 'action',
}: Props) => {
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(x, {
      toValue: value ? 1 : 0,
      friction: 7,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [value, x]);

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });
  const on = TONES[disabled ? 'disabled' : tone];
  const off = TONES.neutral;

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      hitSlop={6}
      style={[styles.track, { backgroundColor: value ? on.face : off.face }]}
    >
      <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: W,
    height: H,
    borderRadius: H / 2,
    borderWidth: BORDER,
    borderColor: OUTLINE,
    justifyContent: 'center',
    paddingHorizontal: PAD,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#f4f1ea',
    borderWidth: 2,
    borderColor: OUTLINE,
  },
});

export default CartoonSwitch;