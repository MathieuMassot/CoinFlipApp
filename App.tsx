import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import CardOverlay from './components/CardOverlay';
import LastFlips from './components/LastFlips';
import OkaunPanel from './components/OkaunPanel';
import SmallButton from './components/SmallButton';
import StatsPage from './components/StatsPage';
import { Flip } from './flip';
import SlotReel from './components/SlotReel';
import { GameEvent, okaunProgression } from './game';
import { useSounds } from './useSounds';
import { useGame } from './useGame';
import { useReveal } from './useReveal';

type Overlay = 'z' | 'okaun' | null;

const CoinFlipApp = () => {
  useKeepAwake();
  const { reveal, start, skip } = useReveal();
  const sounds = useSounds();
  const pendingEvents = useRef<GameEvent[]>([]);
  const queueEvents = useCallback((events: GameEvent[]) => {
    pendingEvents.current.push(...events);
  }, []);
  const g = useGame({ onBeforeChange: skip, onEvents: queueEvents });
  const [yusriCount, setYusriCount] = useState(5);
  const [countText, setCountText] = useState('1');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [page, setPage] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const count = Math.max(0, parseInt(countText, 10) || 0);

  // Les sons attendent la fin du dévoilement (ou son annulation)
  useEffect(() => {
    if (!reveal && pendingEvents.current.length > 0) {
      const events = pendingEvents.current;
      pendingEvents.current = [];
      if (events.some(e => e.type === 'yusriJackpot')) {
        sounds.play('laugh');
      }
    }
  });

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

  // Pendant le dévoilement, on n'affiche que les lancers déjà « sortis »
  const revealCount = reveal ? reveal.count : game.lastSeries.length;
  const shownSeries = game.lastSeries.slice(0, revealCount);
  const hidden = game.lastSeries.length - shownSeries.length;
  const shownTurnFlips = turn.flips.slice(0, turn.flips.length - hidden);
  const okaunShown =
    reveal && reveal.steps
      ? reveal.steps[Math.min(reveal.count, reveal.steps.length) - 1]
      : game.okaunNow;

  // Lance une série puis la dévoile lancer par lancer
  const launch = (run: () => Flip[]) => {
    const before = game.okaunNow;
    const flips = run();
    if (flips.length > 0) {
      start(flips.length, board.okaun ? okaunProgression(before, flips) : null);
    }
  };

  const dots = page === 0 ? '● ○' : '○ ●';

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
        <View style={styles.yusriRow}>
          <View style={styles.yusriSide} />
          <BoardCard
            title="Yusri"
            active={board.yusri}
            onPlace={() => g.toggleBoard('yusri')}
            onRemove={() => g.toggleBoard('yusri')}
            onPress={() => launch(() => g.launchYusri(yusriCount))}
          >
            <Text style={styles.big}>×{yusriCount}</Text>
            <Text style={styles.hintSmall}>touche = lancer</Text>
          </BoardCard>
          <View style={styles.yusriSide}>
            <SlotReel
              value={yusriCount}
              onChange={setYusriCount}
              enabled={board.yusri}
            />
          </View>
        </View>
        <View style={styles.triangleRow}>
          <BoardCard
            title="Z"
            active={board.zndrsplt}
            onPlace={() => g.toggleBoard('zndrsplt')}
            onRemove={() => g.toggleBoard('zndrsplt')}
            onPress={() => setOverlay('z')}
            onLongPress={() => launch(g.launchZ)}
          >
            <Text style={styles.big}>À piocher : {game.pendingDraws}</Text>
            <Text style={styles.hintSmall}>maintenir = lancer</Text>
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
            onPress={() => setOverlay('okaun')}
            onLongPress={() => launch(g.launchOkaun)}
          >
            <Text style={styles.big}>
              {okaunShown.power}/{okaunShown.toughness}
            </Text>
            <Text style={styles.hintSmall}>maintenir = lancer</Text>
            {turn.doublings > 0 && (
              <SmallButton title="Fin de tour" onPress={g.endTurn} />
            )}
          </BoardCard>
        </View>
      </View>

      <LastFlips
        series={shownSeries}
        turnFlips={shownTurnFlips}
        turnNumber={turn.number}
        mine={turn.mine}
        onPress={skip}
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
          onPress={() => launch(() => g.launchFree(count))}
          disabled={count === 0}
        />
        <SmallButton
          title="∞ Lose"
          onPress={() => launch(g.launchFreeUntilLose)}
        />
      </View>

      <Text style={styles.dots}>{dots}</Text>
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
      <Text style={styles.dots}>{dots}</Text>
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

      <CardOverlay visible={overlay === 'okaun'} onClose={() => setOverlay(null)}>
        <OkaunPanel
          now={game.okaunNow}
          base={game.okaunBase}
          onAdjust={g.adjustOkaun}
          onSetValue={g.setOkaunValue}
        />
      </CardOverlay>

      <CardOverlay visible={overlay === 'z'} onClose={() => setOverlay(null)}>
        <View style={styles.zPanel}>
          <Text style={styles.overlayTitle}>Z</Text>
          <Text style={styles.zNumber}>{game.pendingDraws}</Text>
          <Text style={styles.line}>cartes à piocher</Text>
          <SmallButton
            title="Pioché"
            onPress={() => {
              g.markCardsDrawn();
              setOverlay(null);
            }}
          />
        </View>
      </CardOverlay>
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
  hintSmall: { color: '#7f8c8d', fontSize: 10, marginTop: 2 },
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
  zPanel: { alignItems: 'center', gap: 10 },
  overlayTitle: { color: '#ecf0f1', fontSize: 20, fontWeight: 'bold' },
  zNumber: { color: '#ffffff', fontSize: 56, fontWeight: 'bold' },
  line: { color: '#bdc3c7', fontSize: 15 },
    yusriRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  yusriSide: { width: 60, alignItems: 'center' },
});

export default CoinFlipApp;