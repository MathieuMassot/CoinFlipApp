import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CardOverlay from './components/CardOverlay';
import LastFlips from './components/LastFlips';
import OkaunPanel from './components/OkaunPanel';
import SmallButton from './components/SmallButton';
import StatsPage from './components/StatsPage';
import { Flip } from './flip';
import SlotReel from './components/SlotReel';
import { loseHaptic } from './haptics';
import { GameEvent, okaunProgression } from './game';
import { useSounds } from './useSounds';
import { useGame } from './useGame';
import { useReveal } from './useReveal';
import CharacterSlot from './components/CharacterSlot';
import OkaunArt from './components/characters/OkaunArt';
import ZndrspltArt from './components/characters/ZndrspltArt';
import YusriArt, { YusriEtat } from './components/characters/YusriArt';
import PouceDeKrark, { PouceEtat } from './components/characters/PouceDeKrark';
import CharacterDetail from './components/CharacterDetail';
import NumberPad from './components/NumberPad';

type Overlay = 'z' | 'okaun' | 'yusri' | null;

const ART = 124; // taille d'affichage des personnages
const ART_BIG = 230; // taille dans le détail
const THUMB = 84; // taille du Pouce, entre le Z et Okaun

const CoinFlipApp = () => {
  useKeepAwake();
  const insets = useSafeAreaInsets();
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

  const [padOpen, setPadOpen] = useState(false);

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

    // Marges pour ne pas passer sous l'heure, l'appareil photo ou la barre de navigation
  const safeStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + 8,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const [yusri, setYusri] = useState<{ etat: YusriEtat; declencheur: number }>({
    etat: 'repos',
    declencheur: 0,
  });
  const [streak, setStreak] = useState({ wins: 0, losses: 0 });

  const [thumb, setThumb] = useState<{
    etat: PouceEtat;
    declencheur: number;
    frappes: 1 | 2;
    suite?: PouceEtat; // état à jouer quand celui-ci se termine
  }>({ etat: 'repos', declencheur: 0, frappes: 1 });

  if (!g.loaded) {
    return (
      <View style={[styles.center, safeStyle]}>
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
  const launch = (
    run: () => Flip[],
    react?: (flip: Flip, index: number, flips: Flip[]) => void,
  ) => {
    const before = game.okaunNow;
    const flips = run();
    if (flips.length > 0) {
      start(
        flips.length,
        board.okaun ? okaunProgression(before, flips) : null,
        i => {
          if (flips[i].result === 'Lose') {
            loseHaptic();
          }
          react?.(flips[i], i, flips);
        },
      );
    }
  };

  // Yusri réagit à chaque lancer dévoilé ; 5 identiques déclenchent l'état « total »
  const reactYusri = (flip: Flip, index: number, flips: Flip[]) => {
    const win = flip.result === 'Win';
    setStreak(s =>
      win
        ? { wins: Math.min(5, s.wins + 1), losses: 0 }
        : { wins: 0, losses: Math.min(5, s.losses + 1) },
    );
    const total =
      index === flips.length - 1 &&
      flips.length === 5 &&
      flips.every(f => f.result === flip.result);
    const etat: YusriEtat = total
      ? win
        ? 'victoire-totale'
        : 'defaite-totale'
      : win
        ? 'victoire'
        : 'defaite';
    setYusri(y => ({ etat, declencheur: y.declencheur + 1 }));
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
        <SmallButton
          title="Fin de tour"
          onPress={g.endTurn}
          disabled={turn.doublings === 0}
        />
        <SmallButton title="↶" onPress={g.undo} disabled={!g.canUndo} />
      </View>

      <View style={styles.triangle}>
        <View style={styles.yusriRow}>
          <View style={styles.yusriSide} />
          <CharacterSlot
            size={ART}
            present={board.yusri}
            onPlace={() => g.toggleBoard('yusri')}
            onRemove={() => g.toggleBoard('yusri')}
            onOpen={() => setOverlay('yusri')}
            onLaunch={() =>
              launch(() => g.launchYusri(yusriCount), reactYusri)
            }
            badge={<Text style={styles.big}>×{yusriCount}</Text>}
          >
            <YusriArt
              size={ART}
              present={board.yusri}
              etat={yusri.etat}
              declencheur={yusri.declencheur}
              nombrePieces={yusriCount}
              victoiresConsecutives={streak.wins}
              echecsConsecutifs={streak.losses}
              onAnimationFin={() => setYusri(y => ({ ...y, etat: 'repos' }))}
            />
          </CharacterSlot>
          <View style={styles.yusriSide}>
            <SlotReel
              value={yusriCount}
              onChange={setYusriCount}
              enabled={board.yusri}
            />
          </View>
        </View>
        <View style={styles.triangleRow}>
          <CharacterSlot
            size={ART}
            present={board.zndrsplt}
            onPlace={() => g.toggleBoard('zndrsplt')}
            onRemove={() => g.toggleBoard('zndrsplt')}
            onOpen={() => setOverlay('z')}
            onLaunch={() => launch(g.launchZ)}
            badge={
              <Text style={styles.big}>À piocher : {game.pendingDraws}</Text>
            }
          >
            <ZndrspltArt size={ART} present={board.zndrsplt} />
          </CharacterSlot>
          <TouchableOpacity
            style={styles.thumb}
            activeOpacity={0.85}
            onPress={() => g.toggleBoard('thumb')}
          >
            <PouceDeKrark
              size={THUMB}
              present={board.thumb}
              etat={thumb.etat}
              declencheur={thumb.declencheur}
              nombreFrappes={thumb.frappes}
              onAnimationFin={() =>
                setThumb(t =>
                  t.suite
                    ? {
                        etat: t.suite,
                        declencheur: t.declencheur + 1,
                        frappes: 1,
                      }
                    : { ...t, etat: 'repos' },
                )
              }
            />
            <Text style={styles.thumbLabel}>Pouce</Text>
          </TouchableOpacity>
          <CharacterSlot
            size={ART}
            present={board.okaun}
            onPlace={() => g.toggleBoard('okaun')}
            onRemove={() => g.toggleBoard('okaun')}
            onOpen={() => setOverlay('okaun')}
            onLaunch={() => launch(g.launchOkaun)}
            badge={
              <Text style={styles.big} numberOfLines={1} adjustsFontSizeToFit>
                {okaunShown.power}/{okaunShown.toughness}
              </Text>
            }
          >
            <OkaunArt size={ART} present={board.okaun} />
          </CharacterSlot>
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
        <TouchableOpacity style={styles.input} onPress={() => setPadOpen(true)}>
          <Text style={styles.inputText}>{count}</Text>
        </TouchableOpacity>
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
    <View style={[styles.container, safeStyle]}>
      <StatusBar barStyle="light-content" />
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

      <CardOverlay visible={overlay === 'yusri'} onClose={() => setOverlay(null)}>
        <CharacterDetail
          title="Yusri"
          artSize={ART_BIG}
          art={
            <YusriArt
              size={ART_BIG}
              present={board.yusri}
              nombrePieces={yusriCount}
            />
          }
        >
          <Text style={styles.line}>
            Automutilation : {game.stats.lifeLost} PV
          </Text>
          <Text style={styles.line}>
            Pioche : {game.stats.cardsYusri} carte
            {game.stats.cardsYusri >= 2 ? 's' : ''}
          </Text>
        </CharacterDetail>
      </CardOverlay>

      <CardOverlay visible={overlay === 'okaun'} onClose={() => setOverlay(null)}>
        <CharacterDetail
          title="Okaun"
          artSize={ART_BIG}
          art={<OkaunArt size={ART_BIG} present={board.okaun} />}
        >
          <OkaunPanel
            now={game.okaunNow}
            base={game.okaunBase}
            onAdjust={g.adjustOkaun}
            onSetValue={g.setOkaunValue}
          />
        </CharacterDetail>
      </CardOverlay>

      <CardOverlay visible={overlay === 'z'} onClose={() => setOverlay(null)}>
        <CharacterDetail
          title="Zndrsplt"
          artSize={ART_BIG}
          art={<ZndrspltArt size={ART_BIG} present={board.zndrsplt} />}
        >
          <Text style={styles.zNumber}>{game.pendingDraws}</Text>
          <Text style={styles.line}>cartes à piocher</Text>
          <SmallButton
            title="Pioché"
            onPress={() => {
              g.markCardsDrawn();
              setOverlay(null);
            }}
          />
        </CharacterDetail>
      </CardOverlay>
            <CardOverlay visible={padOpen} onClose={() => setPadOpen(false)}>
        <View style={styles.padCard}>
          <NumberPad
            title="Nombre de lancers"
            initial={count}
            maxDigits={5}
            onSubmit={v => {
              setCountText(String(v));
              setPadOpen(false);
            }}
            onCancel={() => setPadOpen(false)}
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
    width: 62,
    height: 38,
    borderWidth: 1,
    borderColor: '#7f8c8d',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: { color: '#ecf0f1', fontSize: 18 },
  padCard: {
    backgroundColor: '#1f2a38',
    borderColor: '#f1c40f',
    borderWidth: 2,
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
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

const App = () => (
  <SafeAreaProvider>
    <CoinFlipApp />
  </SafeAreaProvider>
);

export default App;