import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import LastFlips from './components/LastFlips';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import BoardCard from './components/BoardCard';
import StyledButton from './components/StyledButton';
import { useGame } from './useGame';

const CoinFlipApp = () => {
  useKeepAwake();
  const g = useGame();
  const [countText, setCountText] = useState('1');
  const count = Math.max(0, parseInt(countText, 10) || 0);

  if (!g.loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ecf0f1" />
      </View>
    );
  }

  const { game } = g;
  const { board, stats, turn } = game;
  const addToCount = (n: number) => setCountText(String(Math.max(0, count + n)));

  const totalWins = stats.wins.withThumb + stats.wins.withoutThumb;
  const totalLosses = stats.losses.withThumb + stats.losses.withoutThumb;

  const confirm = (title: string, message: string, onOk: () => void) =>
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Valider', onPress: onOk },
    ]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.row}>
            <Text style={styles.label}>Mon tour</Text>
            <Switch value={turn.mine} onValueChange={g.setMyTurn} />
          </View>
          <StyledButton
            title="Annuler"
            onPress={g.undo}
            disabled={!g.canUndo}
          />
        </View>

        <View style={styles.triangle}>
          <BoardCard
            title="Yusri"
            active={board.yusri}
            onPlace={() => g.toggleBoard('yusri')}
            onRemove={() => g.toggleBoard('yusri')}
          />
          <View style={styles.triangleRow}>
            <BoardCard
              title="Zndrsplt"
              active={board.zndrsplt}
              onPlace={() => g.toggleBoard('zndrsplt')}
              onRemove={() => g.toggleBoard('zndrsplt')}
            >
              <Text style={styles.big}>À piocher : {game.pendingDraws}</Text>
            </BoardCard>
            <BoardCard
              title="Okaun"
              active={board.okaun}
              onPlace={() => g.toggleBoard('okaun')}
              onRemove={() => g.toggleBoard('okaun')}
            >
              <Text style={styles.big}>
                {game.okaunNow.power}/{game.okaunNow.toughness}
              </Text>
              {turn.doublings > 0 && (
                <StyledButton title="Fin de tour" onPress={g.endTurn} />
              )}
            </BoardCard>
          </View>
          <View style={styles.thumb}>
            <Text style={styles.label}>Pouce de Krark</Text>
            <Switch
              value={board.thumb}
              onValueChange={() => g.toggleBoard('thumb')}
            />
          </View>
        </View>

        <LastFlips
          series={game.lastSeries}
          turnFlips={turn.flips}
          turnNumber={turn.number}
          mine={turn.mine}
        />

        <StyledButton title="+1 réussite adverse" onPress={g.opponentWin} />

        <View style={styles.panel}>
          <Text style={styles.label}>Lancers libres</Text>
          <View style={styles.row}>
            <StyledButton title="-" onPress={() => addToCount(-1)} />
            <TextInput
              style={styles.input}
              value={countText}
              onChangeText={setCountText}
              keyboardType="number-pad"
            />
            <StyledButton title="+" onPress={() => addToCount(1)} />
          </View>
          <View style={styles.row}>
            <StyledButton title="+10" onPress={() => addToCount(10)} />
            <StyledButton title="+50" onPress={() => addToCount(50)} />
          </View>
          <StyledButton
            title="Lancer"
            onPress={() => g.launchFree(count)}
            disabled={count === 0}
          />
          <StyledButton
            title="Jusqu'à un Lose"
            onPress={g.launchFreeUntilLose}
          />
        </View>

        <View style={styles.panel}>
        <View style={styles.panel}>
          <Text style={styles.label}>Statistiques de la partie</Text>
          <Text style={styles.line}>
            {totalWins} réussis · {totalLosses} ratés
          </Text>
          <Text style={styles.line}>
            Avec Pouce : {stats.wins.withThumb} réussis ·{' '}
            {stats.losses.withThumb} ratés
          </Text>
          <Text style={styles.line}>
            Sans Pouce : {stats.wins.withoutThumb} réussis ·{' '}
            {stats.losses.withoutThumb} ratés
          </Text>
          <Text style={styles.line}>
            PV perdus (Yusri) : {stats.lifeLost} · Cartes : Yusri{' '}
            {stats.cardsYusri} + Zndrsplt {stats.cardsZndrsplt}
          </Text>
          <Text style={styles.line}>
            Okaun max : {stats.okaunMax.power}/{stats.okaunMax.toughness}
          </Text>
        </View>
          <View style={styles.chips}>
            {turn.flips.slice(-40).map((f, i) => (
              <Text
                key={`${turn.number}-${i}`}
                style={f.result === 'Win' ? styles.win : styles.lose}
              >
                ●
              </Text>
            ))}
          </View>
          <Text style={styles.line}>
            Partie : {totalWins} réussis · {totalLosses} ratés
          </Text>
          <Text style={styles.line}>
            Avec Pouce : {stats.wins.withThumb} réussis ·{' '}
            {stats.losses.withThumb} ratés
          </Text>
          <Text style={styles.line}>
            Sans Pouce : {stats.wins.withoutThumb} réussis ·{' '}
            {stats.losses.withoutThumb} ratés
          </Text>
          <Text style={styles.line}>
            PV perdus (Yusri) : {stats.lifeLost} · Cartes : Yusri{' '}
            {stats.cardsYusri} + Zndrsplt {stats.cardsZndrsplt}
          </Text>
          <Text style={styles.line}>
            Okaun max : {stats.okaunMax.power}/{stats.okaunMax.toughness}
          </Text>
        </View>

        <View style={styles.row}>
          <StyledButton
            title="Nouvelle partie"
            onPress={() =>
              confirm(
                'Nouvelle partie ?',
                'Les stats de cette partie seront perdues.',
                g.startNewGame,
              )
            }
          />
          <StyledButton
            title="Fin de partie"
            onPress={() =>
              confirm(
                'Terminer la partie ?',
                'Les stats seront archivées dans le total.',
                g.finishGame,
              )
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14141f' },
  center: { flex: 1, backgroundColor: '#14141f', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: { color: '#ecf0f1', fontSize: 16, fontWeight: 'bold' },
  triangle: { alignItems: 'center', marginVertical: 12 },
  triangleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  thumb: { alignItems: 'center', marginTop: 12 },
  panel: {
    backgroundColor: '#1f1f30',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    gap: 6,
  },
  input: {
    width: 90,
    borderWidth: 1,
    borderColor: '#7f8c8d',
    borderRadius: 10,
    color: '#ecf0f1',
    fontSize: 20,
    textAlign: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  win: { color: '#2ecc71', fontSize: 18 },
  lose: { color: '#e74c3c', fontSize: 18 },
  line: { color: '#bdc3c7', fontSize: 14 },
  big: { color: '#ecf0f1', fontSize: 22, fontWeight: 'bold', marginVertical: 6 },
});

export default CoinFlipApp;