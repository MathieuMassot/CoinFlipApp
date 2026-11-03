import React, { ReactNode, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { stepHaptic } from '../haptics';

const DEFAULT_STEP = 26; // dp de glissement vertical par pièce, si le parent n'en donne pas
const MIN_COINS = 1;
const MAX_COINS = 5;
const LIFT = 0.35; // part du glissement que Yusri suit à l'écran
const LIFT_MAX = 16; // dp au maximum

type Props = {
  count: number; // nombre de pièces, de 1 à 5
  onChange: (count: number) => void;
  enabled: boolean; // faux : Yusri n'est pas sur le board
  step?: number; // dp de glissement par pièce : plus petit = plus sensible
  children: ReactNode;
};

// Glisser Yusri vers le haut ajoute des pièces, vers le bas en retire.
const YusriDrag = ({
  count,
  onChange,
  enabled,
  step = DEFAULT_STEP,
  children,
}: Props) => {
  const lift = useRef(new Animated.Value(0)).current;

  // Les dernières valeurs, lues par le détecteur de gestes créé une seule fois
  const start = useRef(count);
  const last = useRef(count);
  const countRef = useRef(count);
  const enabledRef = useRef(enabled);
  const onChangeRef = useRef(onChange);
  const stepRef = useRef(step);
  countRef.current = count;
  enabledRef.current = enabled;
  onChangeRef.current = onChange;
  stepRef.current = step;

  const release = () => {
    Animated.spring(lift, {
      toValue: 0,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const responder = useRef(
    PanResponder.create({
      // « Capture » : prend le geste même si un appui est déjà en cours sur Yusri.
      // Il faut un mouvement nettement vertical, pour ne pas gêner le balayage de page.
      onMoveShouldSetPanResponderCapture: (_e, g) =>
        enabledRef.current &&
        Math.abs(g.dy) > 8 &&
        Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
      onPanResponderGrant: () => {
        start.current = countRef.current;
        last.current = countRef.current;
      },
      onPanResponderMove: (_e, g) => {
        const steps = Math.round(-g.dy / stepRef.current); // vers le haut : positif
        const next = Math.min(
          MAX_COINS,
          Math.max(MIN_COINS, start.current + steps),
        );
        if (next !== last.current) {
          last.current = next;
          stepHaptic();
          onChangeRef.current(next);
        }
        lift.setValue(Math.max(-LIFT_MAX, Math.min(LIFT_MAX, g.dy * LIFT)));
      },
      // Une fois le geste pris, le balayage de page ne peut plus le voler
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: release,
      onPanResponderTerminate: release,
    }),
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{ transform: [{ translateY: lift }] }}
    >
      {children}
    </Animated.View>
  );
};

export default YusriDrag;