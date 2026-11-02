import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDoubleTap } from '../useDoubleTap';

type Props = {
  size: number;
  present: boolean;
  onPlace: () => void; // appui sur une silhouette : poser
  onOpen: () => void; // appui court : ouvrir le détail
  onLaunch: () => void; // double appui : lancer
  onRemove: () => void; // appui long : retirer du board
  badge?: ReactNode; // sous le personnage : force, cartes à piocher…
  overlay?: ReactNode; // par-dessus, en haut à gauche (ex. « Fin de tour »)
  children: ReactNode; // l'illustration
};

const CharacterSlot = ({
  size,
  present,
  onPlace,
  onOpen,
  onLaunch,
  onRemove,
  badge,
  overlay,
  children,
}: Props) => {
  const tap = useDoubleTap(onOpen, onLaunch);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ width: size }}
      onPress={present ? tap : onPlace}
      onLongPress={present ? onRemove : undefined}
    >
      <View style={{ width: size, height: size }}>
        {children}
        {present && overlay ? (
          <View style={styles.overlay}>{overlay}</View>
        ) : null}
      </View>
      <View style={styles.badge}>
        {present ? badge : <Text style={styles.hint}>Poser</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: { minHeight: 28, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#6c6c88', fontSize: 12 },
  overlay: { position: 'absolute', top: 0, left: 0 },
});

export default CharacterSlot;