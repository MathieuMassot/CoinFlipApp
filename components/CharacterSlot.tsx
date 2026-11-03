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
  badge?: ReactNode; // sous le personnage (absent : pas de texte sous lui)
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
  children,
}: Props) => {
  const tap = useDoubleTap(onOpen, onLaunch);
  const hasBadge = badge !== undefined;

  // Toujours branché, même sur une silhouette : sinon, au relâchement,
  // l'appui long retire le personnage puis est pris pour un appui qui le repose
  const handleLongPress = () => {
    if (present) {
      onRemove();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ width: size }}
      onPress={present ? tap : onPlace}
      onLongPress={handleLongPress}
    >
      <View style={{ width: size, height: size }}>
        {children}
        {/* Sans zone de texte dessous, « Poser » se superpose en bas du personnage */}
        {!present && !hasBadge && (
          <Text style={styles.hintOverlay}>Poser</Text>
        )}
      </View>
      {hasBadge && (
        <View style={styles.badge}>
          {present ? badge : <Text style={styles.hint}>Poser</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: { minHeight: 28, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#6c6c88', fontSize: 12 },
  hintOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    color: '#6c6c88',
    fontSize: 12,
  },
});

export default CharacterSlot;