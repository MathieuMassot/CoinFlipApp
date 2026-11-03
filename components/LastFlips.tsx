import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlipSource, RecordedFlip } from '../game';

const SOURCE_LABEL: Record<FlipSource, string> = {
  manual: 'Libre',
  yusri: 'Yusri',
  zndrsplt: 'Z',
  okaun: 'Okaun',
};

type TierName = 'big' | 'medium' | 'letter' | 'dot';

// Le palier dépend du nombre de lancers DÉJÀ dévoilés, jamais du total de la série :
// sinon la taille des tuiles trahirait la longueur du résultat avant la fin de l'animation
export const tierFor = (count: number): TierName => {
  if (count <= 5) {
    return 'big';
  }
  if (count <= 10) {
    return 'medium';
  }
  if (count <= 24) {
    return 'letter';
  }
  return 'dot';
};

// Nombre de colonnes de chaque palier
const COLS: Record<TierName, number> = {
  big: 5, // 1 rangée
  medium: 5, // 2 rangées
  letter: 12, // 2 rangées
  dot: 26, // jusqu'à 4 rangées
};
const MAX_DOTS = 4 * COLS.dot;

type Props = {
  series: RecordedFlip[]; // les lancers de la série déjà dévoilés
  turnFlips: RecordedFlip[]; // tous les lancers du tour
  turnNumber: number;
  onPress?: () => void; // saute l'animation
};

const LastFlips = ({ series, turnFlips, turnNumber, onPress }: Props) => {
  const wins = series.filter(f => f.result === 'Win').length;
  const losses = series.length - wins;
  const first = series[0];
  const origin = first
    ? first.player === 'opponent'
      ? 'Adversaire'
      : SOURCE_LABEL[first.source]
    : '';

  const tier = tierFor(series.length);
  const shown = tier === 'dot' ? series.slice(-MAX_DOTS) : series;
  const truncated = shown.length < series.length;
  const cellWidth = `${100 / COLS[tier]}%` as const;

  return (
    <TouchableOpacity style={styles.panel} activeOpacity={1} onPress={onPress}>
      <Text style={styles.title}>
        {series.length === 0
          ? 'Aucun lancer'
          : `${origin} · ${wins} Win · ${losses} Lose${
              truncated ? ` · ${MAX_DOTS} derniers` : ''
            }`}
      </Text>

      <View style={styles.area}>
        {shown.map((f, i) => {
          const win = f.result === 'Win';
          const color = win ? styles.win : styles.lose;
          return (
            <View key={i} style={[styles.cell, { width: cellWidth }]}>
              {tier === 'big' && (
                <View style={[styles.big, color]}>
                  <Text style={styles.bigText}>{win ? 'Win' : 'Lose'}</Text>
                  {f.coins.length > 1 && (
                    <Text style={styles.bigSub}>{f.coins.join('+')}</Text>
                  )}
                </View>
              )}
              {tier === 'medium' && (
                <View style={[styles.medium, color]}>
                  <Text style={styles.mediumText}>{win ? 'Win' : 'Lose'}</Text>
                </View>
              )}
              {tier === 'letter' && (
                <View style={[styles.square, color]}>
                  <Text style={styles.letter}>{win ? 'W' : 'L'}</Text>
                </View>
              )}
              {tier === 'dot' && <View style={[styles.square, color]} />}
            </View>
          );
        })}
      </View>

      <Text style={styles.historyTitle}>
        Tour {turnNumber} · {turnFlips.length} lancers
      </Text>
      <View style={styles.chips}>
        {turnFlips.slice(-45).map((f, i) => (
          <Text
            key={`${turnNumber}-${i}`}
            style={f.result === 'Win' ? styles.chipWin : styles.chipLose}
          >
            ●
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#1f1f30',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  title: { color: '#ecf0f1', fontSize: 15, fontWeight: 'bold' },
  // Hauteur fixe : le bloc ne change pas de taille d'un palier à l'autre
  area: {
    height: 74,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    overflow: 'hidden',
  },
  cell: { padding: 2 },
  win: { backgroundColor: '#1e8449' },
  lose: { backgroundColor: '#922b21' },
  big: {
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  bigSub: { color: '#ecf0f1', fontSize: 9 },
  medium: {
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  square: {
    aspectRatio: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  historyTitle: { color: '#95a5a6', fontSize: 11 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxHeight: 36,
    overflow: 'hidden',
  },
  chipWin: { color: '#2ecc71', fontSize: 11 },
  chipLose: { color: '#e74c3c', fontSize: 11 },
});

export default LastFlips;