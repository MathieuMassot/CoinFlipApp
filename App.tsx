import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CardOverlay from './components/CardOverlay';
import CharacterDetail from './components/CharacterDetail';
import CharacterSlot from './components/CharacterSlot';
import LastFlips from './components/LastFlips';
import NumberPad from './components/NumberPad';
import OkaunPanel from './components/OkaunPanel';
import SmallButton from './components/SmallButton';
import StatsPage from './components/StatsPage';
import YusriDrag from './components/YusriDrag';
import OkaunArt from './components/characters/OkaunArt';
import PouceDeKrark, { PouceEtat } from './components/characters/PouceDeKrark';
import Presence from './components/characters/Presence';
import YusriArt, { YusriEtat } from './components/characters/YusriArt';
import ZndrspltArt from './components/characters/ZndrspltArt';
import { Flip } from './flip';
import {
  GameEvent,
  LaunchCard,
  cardsFromFlip,
  okaunProgression,
} from './game';
import { blockedHaptic, loseHaptic } from './haptics';
import { SoundName, soundForEvents } from './sounds';
import { useGame } from './useGame';
import { useReveal } from './useReveal';
import { useSounds } from './useSounds';

type Overlay = 'z' | 'okaun' | 'yusri' | null;

const ART = 124; // taille des personnages en portrait
const ART_L = 108; // taille des personnages en paysage
const ART_BIG = 230; // taille dans le détail
const ART_BIG_L = 300; // taille dans le détail, en paysage
const THUMB = 84; // taille du Pouce en portrait
const THUMB_L = 72; // taille du Pouce en paysage

// Sensibilité du glissement de Yusri : part de sa taille nécessaire pour une pièce
// (plus petit = plus sensible ; 0.15 très sensible, 0.21 normal, 0.30 plus lent)
const COIN_STEP = 0.3;
// Dans le détail, Yusri est grand mais l'écran ne grandit pas : distance fixe par pièce
const DETAIL_STEP = 38;

const CoinFlipApp = () => {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();
  const landscape = screen.width > screen.height;
  const art = landscape ? ART_L : ART;
  const thumbPx = landscape ? THUMB_L : THUMB;
  const artBig = landscape ? ART_BIG_L : ART_BIG;

  const { reveal, start, skip } = useReveal();
  const sounds = useSounds();
  const pendingEvents = useRef<GameEvent[]>([]);
  const queueEvents = useCallback((events: GameEvent[]) => {
    pendingEvents.current.push(...events);
  }, []);
  const g = useGame({ onBeforeChange: skip, onEvents: queueEvents });

  const pagerRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [yusriCount, setYusriCount] = useState(1);
  const [countText, setCountText] = useState('1');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [page, setPage] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [padOpen, setPadOpen] = useState(false);
  const [endAsk, setEndAsk] = useState(false); // la fiche du Z rappelle les cartes à piocher
  const [gains, setGains] = useState(0); // réussites de la série en cours
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

  const count = Math.max(0, parseInt(countText, 10) || 0);

  // Les sons attendent la fin du dévoilement (ou son annulation)
  useEffect(() => {
    if (!reveal && pendingEvents.current.length > 0) {
      const events = pendingEvents.current;
      pendingEvents.current = [];
      const sound = soundForEvents(events);
      if (sound) {
        sounds.play(sound);
      }
    }
  });

  // Quand le dévoilement se termine (ou est sauté), le Pouce reprend sa taille
  useEffect(() => {
    if (!reveal) {
      setGains(0);
    }
  }, [reveal]);

  // Après une rotation, on recale le pager sur la page affichée
  useEffect(() => {
    pagerRef.current?.scrollTo({ x: page * size.width, animated: false });
    // seul un changement de largeur doit recaler le pager
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width]);

  // Marges pour ne pas passer sous l'heure, l'appareil photo ou la barre de navigation
  const safeStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + 8,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

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

  // Poser ou retirer un personnage, avec sa voix. Seuls ces deux gestes le font parler :
  // jamais au démarrage, avec « Nouvelle partie » ni avec l'annulation.
  const withVoice =
    (card: 'yusri' | 'zndrsplt' | 'okaun', voice: SoundName) => () => {
      g.toggleBoard(card);
      sounds.play(voice);
    };

  // Pendant le dévoilement, on n'affiche que les lancers déjà « sortis »
  const revealCount = reveal ? reveal.count : game.lastSeries.length;
  const shownSeries = game.lastSeries.slice(0, revealCount);
  const hidden = game.lastSeries.length - shownSeries.length;
  const shownTurnFlips = turn.flips.slice(0, turn.flips.length - hidden);
  const okaunShown =
    reveal && reveal.steps
      ? reveal.steps[Math.min(reveal.count, reveal.steps.length) - 1]
      : game.okaunNow;

  // Ce qui n'est pas encore dévoilé ne doit apparaître nulle part
  const unrevealed = game.lastSeries.slice(revealCount);
  const shownDraws = Math.max(
    0,
    game.pendingDraws - unrevealed.reduce((n, f) => n + cardsFromFlip(f), 0),
  );

  // Ferme la fiche du Z (et abandonne le rappel de fin de tour)
  const closeZ = () => {
    setOverlay(null);
    setEndAsk(false);
  };

  // Fin de tour : s'il reste des cartes à piocher du Z, on le rappelle d'abord
  const endTurnChecked = () => {
    if (board.zndrsplt && shownDraws > 0) {
      setEndAsk(true);
      setOverlay('z');
    } else {
      g.endTurn();
    }
  };

  // Série d'Okaun ou du Z : le Pouce grossit à chaque réussite,
  // et s'affaisse si la série commence directement par un Lose
  const reactSerie = (flip: Flip, index: number) => {
    if (flip.result === 'Win') {
      setGains(index + 1);
      return;
    }
    setGains(0);
    if (index === 0) {
      setThumb(t => ({
        etat: 'defaite',
        declencheur: t.declencheur + 1,
        frappes: 1,
      }));
    }
  };

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
          const f = flips[i];
          if (f.result === 'Lose') {
            loseHaptic();
          }
          if (
            f.result === 'Win' &&
            f.coins.length > 1 &&
            f.coins.includes('Lose')
          ) {
            // le Pouce a sauvé ce lancer
            setThumb(t => ({
              etat: 'sauvetage',
              declencheur: t.declencheur + 1,
              frappes: 1,
            }));
          }
          react?.(f, i, flips);
        },
      );
    }
  };

  // Yusri, Okaun et le Z ne lancent qu'une fois par tour : un double appui de trop
  // ne lance rien et fait vibrer longuement
  const launchCard = (
    card: LaunchCard,
    run: () => Flip[],
    react?: (flip: Flip, index: number, flips: Flip[]) => void,
  ) => {
    if (!g.canLaunch(card)) {
      blockedHaptic();
      return;
    }
    launch(run, react);
  };

  // Dans la fiche d'un personnage déjà utilisé : autoriser un nouveau lancer
  // (combat supplémentaire)
  const relaunchRow = (card: LaunchCard) =>
    turn.launched[card] ? (
      <View style={styles.relaunch}>
        <Text style={styles.warn}>Déjà lancé ce tour</Text>
        <SmallButton
          title="Autoriser un nouveau lancer"
          onPress={() => g.allowRelaunch(card)}
        />
      </View>
    ) : null;

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

  // ───── Les quatre blocs de l'écran principal ─────

  const topBar = (
    <View style={styles.topBar}>
      <SmallButton title="+1 adv." onPress={g.opponentWin} />
      <SmallButton title="Fin de tour" onPress={endTurnChecked} />
      <SmallButton
        title="↶"
        tone="neutral"
        onPress={g.undo}
        disabled={!g.canUndo}
      />
    </View>
  );

  const triangle = (
    <View style={styles.triangle}>
      <View style={styles.space3} />

      <View style={styles.yusriRow}>
        <YusriDrag
          count={yusriCount}
          onChange={setYusriCount}
          enabled={board.yusri}
          step={art * COIN_STEP}
        >
          <CharacterSlot
            size={art}
            present={board.yusri}
            onPlace={withVoice('yusri', 'yusri_arrivee')}
            onRemove={withVoice('yusri', 'yusri_depart')}
            onOpen={() => setOverlay('yusri')}
            onLaunch={() =>
              launchCard('yusri', () => g.launchYusri(yusriCount), reactYusri)
            }
          >
            <Presence present={board.yusri} size={art}>
              {shown => (
                <YusriArt
                  size={art}
                  present={shown}
                  etat={yusri.etat}
                  declencheur={yusri.declencheur}
                  nombrePieces={yusriCount}
                  victoiresConsecutives={streak.wins}
                  echecsConsecutifs={streak.losses}
                  onAnimationFin={() =>
                    setYusri(y => ({ ...y, etat: 'repos' }))
                  }
                />
              )}
            </Presence>
          </CharacterSlot>
        </YusriDrag>
      </View>

      <View style={styles.space2} />

      {/* Le Pouce : un point d'ancrage dans la mise en page, au centre de gravité du
          triangle. Il bouge avec le reste à la rotation, sans mesure ni retard. */}
      <View
        style={[
          styles.thumbAnchor,
          { height: thumbPx, marginVertical: -thumbPx / 2, top: art / 6 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => g.toggleBoard('thumb')}
        >
          <Presence present={board.thumb} size={thumbPx} onde={false}>
            {shown => (
              <PouceDeKrark
                size={thumbPx}
                present={shown}
                etat={thumb.etat}
                declencheur={thumb.declencheur}
                nombreFrappes={thumb.frappes}
                gains={gains}
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
            )}
          </Presence>
        </TouchableOpacity>
      </View>

      <View style={styles.space1} />

      <View
        style={[styles.triangleRow, landscape && styles.triangleRowLandscape]}
      >
        <CharacterSlot
          size={art}
          present={board.zndrsplt}
          onPlace={withVoice('zndrsplt', 'z_arrivee')}
          onRemove={withVoice('zndrsplt', 'z_depart')}
          onOpen={() => setOverlay('z')}
          onLaunch={() => launchCard('zndrsplt', g.launchZ, reactSerie)}
          badge={<Text style={styles.big}>{shownDraws}</Text>}
        >
          <Presence present={board.zndrsplt} size={art}>
            {shown => <ZndrspltArt size={art} present={shown} />}
          </Presence>
        </CharacterSlot>

        <CharacterSlot
          size={art}
          present={board.okaun}
          onPlace={withVoice('okaun', 'okaun_arrivee')}
          onRemove={withVoice('okaun', 'okaun_depart')}
          onOpen={() => setOverlay('okaun')}
          onLaunch={() => launchCard('okaun', g.launchOkaun, reactSerie)}
          badge={
            <Text style={styles.big} numberOfLines={1} adjustsFontSizeToFit>
              {okaunShown.power}/{okaunShown.toughness}
            </Text>
          }
        >
          <Presence present={board.okaun} size={art}>
            {shown => <OkaunArt size={art} present={shown} />}
          </Presence>
        </CharacterSlot>
      </View>

      <View style={styles.space3} />
    </View>
  );

  const results = (
    <LastFlips
      series={shownSeries}
      turnFlips={shownTurnFlips}
      turnNumber={turn.number}
      onPress={skip}
    />
  );

  const freeBar = (
    <View style={styles.freeBar}>
      <SmallButton
        title="−"
        tone="neutral"
        onPress={() => addToCount(-1)}
        onLongPress={() => addToCount(-10)}
      />
      <TouchableOpacity style={styles.input} onPress={() => setPadOpen(true)}>
        <Text style={styles.inputText}>{count}</Text>
      </TouchableOpacity>
      <SmallButton
        title="+"
        tone="neutral"
        onPress={() => addToCount(1)}
        onLongPress={() => addToCount(10)}
      />
      <SmallButton
        title="Lancer"
        tone="action"
        onPress={() => launch(() => g.launchFree(count))}
        disabled={count === 0}
      />
      <SmallButton
        title="∞ Lose"
        tone="force"
        onPress={() => launch(g.launchFreeUntilLose)}
      />
    </View>
  );

  // Le même arbre en portrait et en paysage : seul le style change, donc rien
  // n'est détruit puis recréé à la rotation
  const mainPage = (
    <View style={styles.pageMain}>
      <View style={styles.pageInner}>
        <View style={landscape ? styles.topBarL : undefined}>{topBar}</View>
        <View style={landscape ? styles.triangleL : styles.triangleP}>
          {triangle}
        </View>
        <View style={landscape ? styles.resultsL : undefined}>{results}</View>
        <View style={landscape ? styles.freeBarL : undefined}>{freeBar}</View>
        {!landscape && <Text style={styles.dots}>{dots}</Text>}
      </View>
    </View>
  );

  const statsPage = (
    <View style={landscape ? styles.pageStatsL : styles.page}>
      <StatsPage
        game={game}
        records={g.records}
        onNewGame={g.startNewGame}
        onFinishGame={g.finishGame}
        onResetRecords={g.resetRecords}
      />
      {!landscape && <Text style={styles.dots}>{dots}</Text>}
    </View>
  );

  return (
    <View style={[styles.container, safeStyle]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        ref={pagerRef}
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

      <CardOverlay
        visible={overlay === 'yusri'}
        onClose={() => setOverlay(null)}
      >
        <CharacterDetail
          title="Yusri"
          artSize={artBig}
          art={
            <YusriDrag
              count={yusriCount}
              onChange={setYusriCount}
              enabled={board.yusri}
              step={DETAIL_STEP}
              claimTouch
            >
              <YusriArt
                size={artBig}
                present={board.yusri}
                nombrePieces={yusriCount}
              />
            </YusriDrag>
          }
        >
          <Text style={styles.line}>
            Automutilation : {game.stats.lifeLost} PV
          </Text>
          <Text style={styles.line}>
            Pioche : {game.stats.cardsYusri} carte
            {game.stats.cardsYusri >= 2 ? 's' : ''}
          </Text>
          {relaunchRow('yusri')}
        </CharacterDetail>
      </CardOverlay>

      <CardOverlay
        visible={overlay === 'okaun'}
        onClose={() => setOverlay(null)}
      >
        <CharacterDetail
          title="Okaun"
          artSize={artBig}
          art={<OkaunArt size={artBig} present={board.okaun} />}
        >
          <OkaunPanel
            now={game.okaunNow}
            base={game.okaunBase}
            onAdjust={g.adjustOkaun}
            onSetValue={g.setOkaunValue}
          />
          {relaunchRow('okaun')}
        </CharacterDetail>
      </CardOverlay>

      <CardOverlay visible={overlay === 'z'} onClose={closeZ}>
        <CharacterDetail
          title="Zndrsplt"
          artSize={artBig}
          art={<ZndrspltArt size={artBig} present={board.zndrsplt} />}
        >
          {endAsk && (
            <Text style={styles.warn}>
              Il reste des cartes à piocher avant de finir le tour !
            </Text>
          )}
          <Text style={styles.zNumber}>{shownDraws}</Text>
          <Text style={styles.line}>cartes à piocher</Text>
          {endAsk ? (
            <>
              <SmallButton
                title="Pioché, fin de tour"
                tone="action"
                onPress={() => {
                  g.endTurn();
                  closeZ();
                }}
              />
              <SmallButton title="Retour" tone="neutral" onPress={closeZ} />
            </>
          ) : (
            <>
              <SmallButton
                title="Pioché"
                tone="action"
                onPress={() => {
                  g.markCardsDrawn();
                  closeZ();
                }}
              />
              {relaunchRow('zndrsplt')}
            </>
          )}
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
  pageMain: { flex: 1, padding: 12 },
  pageInner: { flex: 1, gap: 10 },
  pageStatsL: { flex: 1, padding: 4 },
  // Paysage : le triangle à gauche, le reste à droite
  triangleP: { flex: 1 },
  triangleL: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '48%' },
  topBarL: { position: 'absolute', top: 0, right: 0, width: '48%' },
  resultsL: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '48%',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  freeBarL: { position: 'absolute', bottom: 0, right: 0, width: '48%' },
  // Espaces du triangle (3 / 2 / 1 / 3) : le Pouce se place par la mise en page
  space1: { flex: 1 },
  space2: { flex: 2 },
  space3: { flex: 3 },
  thumbAnchor: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
    pointerEvents: 'box-none',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triangle: { flex: 1, alignItems: 'center' },
  yusriRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  triangleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    pointerEvents: 'box-none',
  },
  triangleRowLandscape: { justifyContent: 'space-around' },
  big: {
    color: '#ecf0f1',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  freeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    width: 62,
    height: 39,
    borderWidth: 2.5,
    borderColor: '#5a6a85',
    borderRadius: 12,
    backgroundColor: '#0d0f18',
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
    alignSelf: 'center',
  },
  dots: { color: '#7f8c8d', textAlign: 'center', fontSize: 12 },
  zNumber: { color: '#ffffff', fontSize: 56, fontWeight: 'bold' },
  line: { color: '#bdc3c7', fontSize: 15 },
  warn: {
    color: '#f6c21d',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  relaunch: { alignItems: 'center', gap: 6 },
});

const App = () => (
  <SafeAreaProvider>
    <CoinFlipApp />
  </SafeAreaProvider>
);

export default App;