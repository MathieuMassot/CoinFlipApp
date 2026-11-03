import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BUTTON_DEPTH, BUTTON_RADIUS, OUTLINE, TONES, Tone } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  selected?: boolean; // mis en avant (doré), par exemple l'onglet actif
  danger?: boolean; // raccourci pour tone="danger"
  tone?: Tone;
  width?: number; // taille imposée de la face (touches du pavé numérique)
  height?: number;
  fontSize?: number;
};

// Bouton « cartoon jeu mobile » : une base sombre (l'épaisseur), une face colorée
// cerclée de sombre avec un reflet, et qui s'enfonce quand on appuie.
const SmallButton = ({
  title,
  onPress,
  onLongPress,
  disabled = false,
  selected = false,
  danger = false,
  tone = 'default',
  width,
  height,
  fontSize = 15,
}: Props) => {
  const key: Tone = disabled
    ? 'disabled'
    : selected
      ? 'gold'
      : danger
        ? 'danger'
        : tone;
  const c = TONES[key];
  const fixed = width !== undefined || height !== undefined ? { width, height } : null;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={4}
    >
      {({ pressed }) => (
        <View style={styles.wrap}>
          {/* La base sombre : l'épaisseur du bouton */}
          <View style={[styles.edge, { backgroundColor: c.edge }]} />
          <View
            style={[
              styles.face,
              fixed,
              { backgroundColor: c.face },
              pressed && styles.facePressed,
            ]}
          >
            <View style={styles.shine} />
            <Text style={[styles.text, { color: c.text, fontSize }]}>
              {title}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingBottom: BUTTON_DEPTH },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: BUTTON_DEPTH,
    borderRadius: BUTTON_RADIUS,
    borderWidth: 2.5,
    borderColor: OUTLINE,
  },
  face: {
    borderRadius: BUTTON_RADIUS,
    borderWidth: 2.5,
    borderColor: OUTLINE,
    paddingVertical: 6,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
    // La face s'enfonce de l'épaisseur du bouton quand on appuie
  facePressed: { top: BUTTON_DEPTH },
  // Reflet clair sur le haut de la face
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  text: {
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 1,
  },
});

export default SmallButton;