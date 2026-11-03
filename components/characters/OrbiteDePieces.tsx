import React from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const MAX_PIECES = 5;

// Quand yusri_piece.png existera, renvoie :
//   require('../../assets/characters/yusri_piece.png')
// En attendant : null, et la pièce est dessinée en code (argentée, bien cerclée).
const pieceSource = (): ImageSourcePropType | null => null;

type Point = { x: number; y: number };

type PieceProps = {
  index: number;
  couche: 'arriere' | 'avant';
  size: number; // taille d'affichage du personnage
  nombre: SharedValue<number>; // nombre de pièces, animé (de 1 à 5)
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
  couche,
  size,
  nombre,
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
    const n = Math.max(1, nombre.value);
    // 0 : la pièce n'existe pas encore ; 1 : elle est là. Entre les deux, elle grandit.
    const presence = Math.min(1, Math.max(0, nombre.value - index));
    const a = ((angle.value + (index * 360) / n) * Math.PI) / 180;
    const s = Math.sin(a); // > 0 : la pièce est à l'avant (moitié basse de l'ellipse)
    const scale = (0.8 + 0.2 * ((s + 1) / 2)) * presence; // plus petite à l'arrière
    const visible =
      couche === 'avant'
        ? interpolate(s, [-0.15, 0.15], [0, 1], Extrapolation.CLAMP)
        : interpolate(s, [-0.15, 0.15], [0.7, 0], Extrapolation.CLAMP);
    return {
      opacity: visible * opacite.value * presence,
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
    >
      {/* Liseré intérieur : donne l'allure d'une pièce */}
      <Animated.View
        style={[
          styles.rim,
          { borderRadius: taillePiece / 2, margin: taillePiece * 0.16 },
        ]}
      />
    </Animated.View>
  );
};

type Props = {
  couche: 'arriere' | 'avant';
  nombre: SharedValue<number>; // de 1 à 5, animé
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
// Cinq pièces sont toujours prêtes ; celles au-delà du nombre voulu sont invisibles.
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
  taillePiece = size * 0.15,
}: Props) => (
  <>
    {Array.from({ length: MAX_PIECES }, (_, i) => (
      <Piece
        key={i}
        index={i}
        couche={couche}
        size={size}
        nombre={nombre}
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
  // Argentée, avec un épais contour sombre : elle se lit bien devant le feu de Yusri
  placeholder: {
    backgroundColor: '#e3e9f0',
    borderWidth: 3,
    borderColor: '#17202b',
  },
  rim: { flex: 1, borderWidth: 1.5, borderColor: '#8996a6' },
});

export default OrbiteDePieces;