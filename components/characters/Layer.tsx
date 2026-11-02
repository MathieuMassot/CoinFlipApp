import React, { ComponentProps } from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

type Props = {
  source: ImageSourcePropType;
  tint?: string; // silhouette : le calque est teinté d'une seule couleur
  style?: ComponentProps<typeof Animated.Image>['style'];
};

const Layer = ({ source, tint, style }: Props) => (
  <Animated.Image
    source={source}
    resizeMode="contain"
    fadeDuration={0}
    style={[styles.layer, tint ? { tintColor: tint } : null, style]}
  />
);

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

export default Layer;