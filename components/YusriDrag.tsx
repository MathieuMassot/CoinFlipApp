import React, { ReactNode, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { stepHaptic } from '../haptics';

// Mets true pour voir les événements du geste dans les journaux (npx react-native log-android)
const DEBUG = false;
const log = (...args: unknown[]) => {
  if (DEBUG) {
    console.log('YusriDrag', ...args);
  }
};

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
  // Vrai quand rien d'autre n'a besoin des appuis sur Yusri (le détail) : le glissement
  // prend le geste dès que le doigt se pose, au lieu d'attendre un mouvement.
  claimTouch?: boolean;
  children: ReactNode;
};

// Glisser Yusri vers le haut ajoute des pièces, vers le bas en retire.
const YusriDrag = ({
  count,
  onChange,
  enabled,
  step = DEFAULT_STEP,
  claimTouch = false,
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
  const claimRef = useRef(claimTouch);
  countRef.current = count;
  enabledRef.current = enabled;
  onChangeRef.current = onChange;
  stepRef.current = step;
  claimRef.current = claimTouch;

  const release = () => {
    log('release');
    Animated.spring(lift, {
      toValue: 0,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const responder = useRef(
    PanResponder.create({
      // Détail : le glissement prend le geste dès le toucher.
      onStartShouldSetPanResponder: () => {
        log('start?', claimRef.current, enabledRef.current);
        return claimRef.current && enabledRef.current;
      },
      onMoveShouldSetPanResponder: () =>
        claimRef.current && enabledRef.current,
      // Écran principal : un appui est déjà en cours sur Yusri (ouvrir, lancer, retirer).
      // « Capture » : on prend le geste s'il est nettement vertical, sans gêner
      // le balayage de page.
      onMoveShouldSetPanResponderCapture: (_e, g) => {
        log('capture?', enabledRef.current, Math.round(g.dx), Math.round(g.dy));
        return (
          !claimRef.current &&
          enabledRef.current &&
          Math.abs(g.dy) > 8 &&
          Math.abs(g.dy) > Math.abs(g.dx) * 1.5
        );
      },
      onPanResponderGrant: () => {
        log('grant');
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
          log('count', next);
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