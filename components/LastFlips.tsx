import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlipSource, RecordedFlip } from '../game';

const SOURCE_LABEL: Record<FlipSource, string> = {
  manual: 'Lancers libres',
  yusri: 'Yusri',
  zndrsplt: 'Zndrsplt',
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
        Dernier lancer{origin ? ` · ${origin}` : ''}
      </Text>

      {series.length === 0 ? (
        <Text style={styles.empty}>{"Aucun lancer pour l'instant"}</Text>
      ) : (
        <>
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
                    <Text style={styles.tileSub}>{f.coins.join(' + ')}</Text>
                  )}
                </View>
              );
            })}
          </View>
          <Text style={styles.summary}>
            {wins} Win · {losses} Lose
          </Text>
        </>
      )}

      <Text style={styles.historyTitle}>
        Tour {turnNumber}
        {mine ? ' (le mien)' : ''} · {turnFlips.length} lancers
      </Text>
      <View style={styles.chips}>
        {turnFlips.slice(-60).map((f, i) => (
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
    padding: 12,
    marginVertical: 10,
    gap: 8,
  },
  title: { color: '#ecf0f1', fontSize: 16, fontWeight: 'bold' },
  empty: { color: '#7f8c8d', fontSize: 14 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tileWin: { backgroundColor: '#1e8449' },
  tileLose: { backgroundColor: '#922b21' },
  tileText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  tileSub: { color: '#ecf0f1', fontSize: 10, marginTop: 2 },
  summary: { color: '#ecf0f1', fontSize: 16 },
  historyTitle: { color: '#95a5a6', fontSize: 12, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chipWin: { color: '#2ecc71', fontSize: 12 },
  chipLose: { color: '#e74c3c', fontSize: 12 },
});

export default LastFlips;