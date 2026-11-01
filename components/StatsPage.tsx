import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import SmallButton from './SmallButton';
import { GameState, GameStats, emptyStats } from '../game';
import { GameRecord, averageStats, endGame, totalStats } from '../records';

type Tab = 'game' | 'total' | 'average';

type Props = {
  game: GameState;
  records: GameRecord[];
  onNewGame: () => void;
  onFinishGame: () => void;
  onResetRecords: () => void;
};

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const StatsBlock = ({ s }: { s: GameStats }) => (
  <View style={styles.block}>
    <Text style={styles.line}>
      Réussis : {fmt(s.wins.withThumb + s.wins.withoutThumb)} (avec Pouce{' '}
      {fmt(s.wins.withThumb)} · sans {fmt(s.wins.withoutThumb)})
    </Text>
    <Text style={styles.line}>
      Ratés : {fmt(s.losses.withThumb + s.losses.withoutThumb)} (avec Pouce{' '}
      {fmt(s.losses.withThumb)} · sans {fmt(s.losses.withoutThumb)})
    </Text>
    <Text style={styles.line}>PV perdus (Yusri) : {fmt(s.lifeLost)}</Text>
    <Text style={styles.line}>Cartes piochées via Yusri : {fmt(s.cardsYusri)}</Text>
    <Text style={styles.line}>Cartes piochées via le Z : {fmt(s.cardsZndrsplt)}</Text>
    <Text style={styles.line}>
      Okaun max : {fmt(s.okaunMax.power)}/{fmt(s.okaunMax.toughness)}
    </Text>
  </View>
);

const StatsPage = ({
  game,
  records,
  onNewGame,
  onFinishGame,
  onResetRecords,
}: Props) => {
  const [tab, setTab] = useState<Tab>('game');

  // La partie en cours compte dans le total et la moyenne
  const all = [...records, endGame(game)];
  const stats =
    tab === 'game'
      ? game.stats
      : tab === 'total'
        ? totalStats(all)
        : averageStats(all) ?? emptyStats();

  const confirm = (title: string, message: string, onOk: () => void) =>
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Valider', onPress: onOk },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        <SmallButton title="Partie" onPress={() => setTab('game')} disabled={tab === 'game'} />
        <SmallButton title="Total" onPress={() => setTab('total')} disabled={tab === 'total'} />
        <SmallButton title="Moyenne" onPress={() => setTab('average')} disabled={tab === 'average'} />
      </View>

      <Text style={styles.subtitle}>
        {tab === 'game' && 'Partie en cours'}
        {tab === 'total' && `Total (${all.length} partie${all.length > 1 ? 's' : ''}, partie en cours incluse)`}
        {tab === 'average' && 'Moyenne par partie'}
      </Text>

      <StatsBlock s={stats} />

      <View style={styles.actions}>
        <SmallButton
          title="Nouvelle partie"
          onPress={() =>
            confirm('Nouvelle partie ?', 'Les stats de cette partie seront perdues.', onNewGame)
          }
        />
        <SmallButton
          title="Fin de partie"
          onPress={() =>
            confirm('Terminer la partie ?', 'Les stats seront archivées dans le total.', onFinishGame)
          }
        />
        <SmallButton
          title="Effacer l'historique"
          onPress={() =>
            confirm('Effacer l’historique ?', 'Le total et la moyenne repartiront de zéro.', onResetRecords)
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14 },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  subtitle: { color: '#ecf0f1', fontSize: 16, fontWeight: 'bold' },
  block: { backgroundColor: '#1f1f30', borderRadius: 12, padding: 12, gap: 8 },
  line: { color: '#bdc3c7', fontSize: 15 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
});

export default StatsPage;