import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  size: number;
  present: boolean;
  onPlace: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  badge?: ReactNode; // sous le personnage : force, cartes à piocher…
  overlay?: ReactNode; // par-dessus, en haut à gauche (ex. « Fin de tour »)
  children: ReactNode; // l'illustration
};

const CharacterSlot = ({
  size,
  present,
  onPlace,
  onPress,
  onLongPress,
  badge,
  overlay,
  children,
}: Props) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={{ width: size }}
    onPress={present ? onPress : onPlace}
    onLongPress={present ? onLongPress : undefined}
  >
    <View style={{ width: size, height: size }}>
      {children}
      {present && overlay ? <View style={styles.overlay}>{overlay}</View> : null}
    </View>
    <View style={styles.badge}>
      {present ? badge : <Text style={styles.hint}>Poser</Text>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  badge: { minHeight: 28, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#6c6c88', fontSize: 12 },
  overlay: { position: 'absolute', top: 0, left: 0 },
});

export default CharacterSlot;