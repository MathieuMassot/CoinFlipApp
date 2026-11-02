import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  size: number;
  present: boolean;
  onPlace: () => void;
  onRemove: () => void;
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
  onRemove,
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
      {present && (
        <TouchableOpacity style={styles.cross} onPress={onRemove} hitSlop={8}>
          <Text style={styles.crossText}>✕</Text>
        </TouchableOpacity>
      )}
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
  cross: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossText: { color: '#e67e22', fontSize: 14, fontWeight: 'bold' },
});

export default CharacterSlot;