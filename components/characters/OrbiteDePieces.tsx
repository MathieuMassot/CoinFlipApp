import React from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

// Quand yusri_piece.png existera, renvoie :
//   require('../../assets/characters/yusri_piece.png')
// En attendant : null, et la pièce est un simple cercle doré.
const pieceSource = (): ImageSourcePropType | null => null;

type Point = { x: number; y: number };

type PieceProps = {
  index: number;
  total: number;
  couche: 'arriere' | 'avant';
  size: number; // taille d'affichage du personnage
  angle: SharedValue<number>; // rotation de l'orbite, en degrés
  elargissement: SharedValue<number>; // 1 = orbite normale
  decalageY: SharedValue<number>; // décalage vertical, en unités de référence
  opacite: SharedValue<number>;
  mouvement: number; // size / taille de référence
  centre: Point; // en part de la taille
  rayon: Point; // en part de la taille
  taillePiece: number;
};

const Piece = ({
  index,
  total,
  couche,
  size,
  angle,
  elargissement,
  decalageY,
  opacite,
  mouvement,
  centre,
  rayon,
  taillePiece,
}: PieceProps) => {
  const source = pieceSource();

  const style = useAnimatedStyle(() => {
    const a = ((angle.value + (index * 360) / total) * Math.PI) / 180;
    const s = Math.sin(a); // > 0 : la pièce est à l'avant (moitié basse de l'ellipse)
    const scale = 0.8 + 0.2 * ((s + 1) / 2); // plus petite à l'arrière
    const visible =
      couche === 'avant'
        ? interpolate(s, [-0.15, 0.15], [0, 1], Extrapolation.CLAMP)
        : interpolate(s, [-0.15, 0.15], [0.7, 0], Extrapolation.CLAMP);
    return {
      opacity: visible * opacite.value,
      transform: [
        {
          translateX:
            size * centre.x +
            Math.cos(a) * size * rayon.x * elargissement.value -
            taillePiece / 2,
        },
        {
          translateY:
            size * centre.y +
            s * size * rayon.y +
            decalageY.value * mouvement -
            taillePiece / 2,
        },
        { scale },
        { scaleX: 0.8 + 0.2 * Math.cos(a * 3 + index) }, // la pièce tourne sur elle-même
      ],
    };
  });

  const dims = { width: taillePiece, height: taillePiece };

  return source ? (
    <Animated.Image source={source} style={[styles.piece, dims, style]} />
  ) : (
    <Animated.View
      style={[
        styles.piece,
        styles.placeholder,
        dims,
        { borderRadius: taillePiece / 2 },
        style,
      ]}
    />
  );
};

type Props = {
  couche: 'arriere' | 'avant';
  nombre: number; // de 1 à 5
  size: number;
  angle: SharedValue<number>;
  elargissement: SharedValue<number>;
  decalageY: SharedValue<number>;
  opacite: SharedValue<number>;
  centre?: Point;
  rayon?: Point;
  taillePiece?: number;
};

// Une des deux couches de l'orbite : la pièce est dessinée derrière le personnage
// quand elle passe à l'arrière, et devant quand elle passe à l'avant.
const OrbiteDePieces = ({
  couche,
  nombre,
  size,
  angle,
  elargissement,
  decalageY,
  opacite,
  centre = { x: 0.5, y: 0.6 },
  rayon = { x: 0.3, y: 0.08 },
  taillePiece = size * 0.11,
}: Props) => (
  <>
    {Array.from({ length: nombre }, (_, i) => (
      <Piece
        key={i}
        index={i}
        total={nombre}
        couche={couche}
        size={size}
        angle={angle}
        elargissement={elargissement}
        decalageY={decalageY}
        opacite={opacite}
        mouvement={size / 256}
        centre={centre}
        rayon={rayon}
        taillePiece={taillePiece}
      />
    ))}
  </>
);

const styles = StyleSheet.create({
  piece: { position: 'absolute', left: 0, top: 0 },
  placeholder: {
    backgroundColor: '#f1c40f',
    borderWidth: 1.5,
    borderColor: '#b7950b',
  },
});

export default OrbiteDePieces;