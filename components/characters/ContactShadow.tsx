import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

const FLATTEN = 0.14; // aplatissement de l'ombre
const DROP = 0.045; // décalage vers le bas, en part de la taille

type Props = { source: ImageSourcePropType; size: number };

// Le corps du personnage, teinté en noir, flouté, puis aplati au niveau des pieds
const ContactShadow = ({ source, size }: Props) => (
  <Image
    source={source}
    resizeMode="contain"
    blurRadius={6}
    fadeDuration={0}
    style={[
      styles.shadow,
      {
        width: size,
        height: size,
        transform: [{ translateY: size * DROP }, { scaleY: FLATTEN }],
      },
    ]}
  />
);

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    tintColor: '#000000',
    opacity: 0.35,
    transformOrigin: '50% 92%',
  },
});

export default ContactShadow;