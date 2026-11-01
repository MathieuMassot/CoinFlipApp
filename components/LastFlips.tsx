import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlipSource, RecordedFlip } from '../game';

const SOURCE_LABEL: Record<FlipSource, string> = {
  manual: 'Libre',
  yusri: 'Yusri',
  zndrsplt: 'Z',
  okaun: 'Okaun',
};

type Props = {
  series: RecordedFlip[]; // le dernier lancer (la série qu'on vient de faire)
  turnFlips: RecordedFlip[]; // tous les lancers du tour
  turnNumber: number;
  mine: boolean;
};

const LastFlips = ({ series, turnFlips, turnNumber, mine }: Props) => {
  const wins = series.filter(f => f.result === 'Win').length;
  const losses = series.length - wins;
  const first = series[0];
  const origin = first
    ? first.player === 'opponent'
      ? 'Adversaire'
      : SOURCE_LABEL[first.source]
    : '';

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        {series.length === 0
          ? 'Aucun lancer'
          : `${origin} · ${wins} Win · ${losses} Lose`}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tiles}>
          {series.map((f, i) => {
            const win = f.result === 'Win';
            return (
              <View
                key={i}
                style={[styles.tile, win ? styles.tileWin : styles.tileLose]}
              >
                <Text style={styles.tileText}>{win ? 'Win' : 'Lose'}</Text>
                {f.coins.length > 1 && (
                  <Text style={styles.tileSub}>{f.coins.join('+')}</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.historyTitle}>
        Tour {turnNumber}
        {mine ? ' (le mien)' : ''} · {turnFlips.length} lancers
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
    </View>
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
  tiles: { flexDirection: 'row', gap: 6, minHeight: 40 },
  tile: {
    minWidth: 48,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileWin: { backgroundColor: '#1e8449' },
  tileLose: { backgroundColor: '#922b21' },
  tileText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  tileSub: { color: '#ecf0f1', fontSize: 9 },
  historyTitle: { color: '#95a5a6', fontSize: 11 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', maxHeight: 36, overflow: 'hidden' },
  chipWin: { color: '#2ecc71', fontSize: 11 },
  chipLose: { color: '#e74c3c', fontSize: 11 },
});

export default LastFlips;