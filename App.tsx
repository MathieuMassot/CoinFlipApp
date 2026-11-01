import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import BoardCard from './components/BoardCard';
import LastFlips from './components/LastFlips';
import SmallButton from './components/SmallButton';
import StatsPage from './components/StatsPage';
import { useGame } from './useGame';

const CoinFlipApp = () => {
  useKeepAwake();
  const g = useGame();
  const [countText, setCountText] = useState('1');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [page, setPage] = useState(0);
  const count = Math.max(0, parseInt(countText, 10) || 0);

  if (!g.loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ecf0f1" />
      </View>
    );
  }

  const { game } = g;
  const { board, turn } = game;
  const addToCount = (n: number) => setCountText(String(Math.max(0, count + n)));

  const mainPage = (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <View style={styles.row}>
          <Text style={styles.label}>Mon tour</Text>
          <Switch value={turn.mine} onValueChange={g.setMyTurn} />
        </View>
        <SmallButton title="+1 adv." onPress={g.opponentWin} />
        <SmallButton title="↶" onPress={g.undo} disabled={!g.canUndo} />
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
            title="Z"
            active={board.zndrsplt}
            onPlace={() => g.toggleBoard('zndrsplt')}
            onRemove={() => g.toggleBoard('zndrsplt')}
          >
            <Text style={styles.big}>À piocher : {game.pendingDraws}</Text>
          </BoardCard>
          <View style={styles.thumb}>
            <Text style={styles.thumbLabel}>Pouce</Text>
            <Switch
              value={board.thumb}
              onValueChange={() => g.toggleBoard('thumb')}
            />
          </View>
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
              <SmallButton title="Fin de tour" onPress={g.endTurn} />
            )}
          </BoardCard>
        </View>
      </View>

      <LastFlips
        series={game.lastSeries}
        turnFlips={turn.flips}
        turnNumber={turn.number}
        mine={turn.mine}
      />

      <View style={styles.freeBar}>
        <SmallButton
          title="−"
          onPress={() => addToCount(-1)}
          onLongPress={() => addToCount(-10)}
        />
        <TextInput
          style={styles.input}
          value={countText}
          onChangeText={setCountText}
          keyboardType="number-pad"
        />
        <SmallButton
          title="+"
          onPress={() => addToCount(1)}
          onLongPress={() => addToCount(10)}
        />
        <SmallButton
          title="Lancer"
          onPress={() => g.launchFree(count)}
          disabled={count === 0}
        />
        <SmallButton title="∞ Lose" onPress={g.launchFreeUntilLose} />
      </View>

      <Text style={styles.dots}>{page === 0 ? '● ○' : '○ ●'}</Text>
    </View>
  );

  const statsPage = (
    <View style={styles.page}>
      <StatsPage
        game={game}
        records={g.records}
        onNewGame={g.startNewGame}
        onFinishGame={g.finishGame}
        onResetRecords={g.resetRecords}
      />
      <Text style={styles.dots}>{page === 0 ? '● ○' : '○ ●'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={e => setSize(e.nativeEvent.layout)}
        onMomentumScrollEnd={e =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / size.width))
        }
      >
        {size.width > 0 && (
          <>
            <View style={{ width: size.width, height: size.height }}>
              {mainPage}
            </View>
            <View style={{ width: size.width, height: size.height }}>
              {statsPage}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14141f' },
  center: { flex: 1, backgroundColor: '#14141f', justifyContent: 'center' },
  page: { flex: 1, padding: 12, gap: 10 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { color: '#ecf0f1', fontSize: 15, fontWeight: 'bold' },
  triangle: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' },
  triangleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  thumb: { alignItems: 'center' },
  thumbLabel: { color: '#ecf0f1', fontSize: 12, fontWeight: 'bold' },
  big: { color: '#ecf0f1', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
  freeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    width: 56,
    borderWidth: 1,
    borderColor: '#7f8c8d',
    borderRadius: 10,
    color: '#ecf0f1',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 4,
  },
  dots: { color: '#7f8c8d', textAlign: 'center', fontSize: 12 },
});

export default CoinFlipApp;