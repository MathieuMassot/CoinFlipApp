import React, { ReactNode, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import OkaunArt from './characters/OkaunArt';
import PouceDeKrark from './characters/PouceDeKrark';
import YusriArt from './characters/YusriArt';
import ZndrspltArt from './characters/ZndrspltArt';
import SmallButton from './SmallButton';
import { GameState, emptyStats } from '../game';
import { GameRecord, averageStats, endGame, totalStats } from '../records';
import { useLandscape } from '../useLandscape';

const ART = 100; // taille des personnages en portrait
const ART_L = 84; // en paysage (la hauteur manque)
const SIDE_PAD = 14;

type Tab = 'game' | 'total' | 'average';

type Props = {
  game: GameState;
  records: GameRecord[];
  onNewGame: () => void;
  onFinishGame: () => void;
  onResetRecords: () => void;
};

// Les moyennes ont une décimale, les totaux sont entiers
const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');

// Grands nombres : raccourcis pour tenir sur une seule ligne
// (la force d'Okaun double à chaque réussite et peut devenir énorme)
const fmtBig = (n: number): string => {
  if (n < 10000) {
    return fmt(n);
  }
  if (n < 1e6) {
    return Math.round(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  }
  if (n < 1e9) {
    return `${(n / 1e6).toFixed(1).replace('.', ',')} M`;
  }
  if (n < 1e12) {
    return `${(n / 1e9).toFixed(1).replace('.', ',')} Md`;
  }
  return n.toExponential(1).replace('.', ',');
};

const cards = (n: number) => `${fmtBig(n)} carte${n >= 2 ? 's' : ''}`;

type CardProps = {
  side: 'left' | 'right';
  artSize: number;
  landscape: boolean;
  art: ReactNode;
  children: ReactNode;
};

// Le personnage déborde sur le cadre, côté gauche ou droit
const StatCard = ({ side, artSize, landscape, art, children }: CardProps) => {
  const artPad = artSize - 8;
  const padLeft = side === 'left' ? artPad : SIDE_PAD;
  const padRight = side === 'left' ? SIDE_PAD : artPad;

  return (
    <View
      style={[
        styles.card,
        landscape && styles.cardL,
        { paddingLeft: padLeft, paddingRight: padRight },
      ]}
    >
      <View
        style={[
          styles.art,
          landscape && styles.artL,
          side === 'left' ? styles.artLeft : styles.artRight,
          { width: artSize, height: artSize },
        ]}
      >
        {art}
      </View>
      {children}
    </View>
  );
};

const Line = ({ label, children }: { label: string; children: ReactNode }) => (
  <View style={styles.line}>
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
    <Text style={styles.value} numberOfLines={1}>
      {children}
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
  const landscape = useLandscape();
  const artSize = landscape ? ART_L : ART;
  const [tab, setTab] = useState<Tab>('game');

  // La partie en cours compte dans le total et la moyenne
  const all = [...records, endGame(game)];
  const s =
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
    <ScrollView
      contentContainerStyle={[styles.content, landscape && styles.contentL]}
    >
      <View style={styles.tabs}>
        <SmallButton
          title="Partie"
          onPress={() => setTab('game')}
          selected={tab === 'game'}
        />
        <SmallButton
          title="Total"
          onPress={() => setTab('total')}
          selected={tab === 'total'}
        />
        <SmallButton
          title="Moyenne"
          onPress={() => setTab('average')}
          selected={tab === 'average'}
        />
      </View>

      <Text style={[styles.subtitle, landscape && styles.subtitleL]}>
        {tab === 'game' && 'Partie en cours'}
        {tab === 'total' &&
          `Total (${all.length} partie${all.length > 1 ? 's' : ''}, partie en cours incluse)`}
        {tab === 'average' && 'Moyenne par partie'}
      </Text>

      {/* Portrait : les quatre encadrés l'un sous l'autre. Paysage : grille 2 × 2. */}
      <View style={landscape ? styles.gridL : undefined}>
        <StatCard
          side="left"
          artSize={artSize}
          landscape={landscape}
          art={<PouceDeKrark size={artSize} present />}
        >
          <Line label="Sans Pouce">
            <Text style={styles.win}>{fmtBig(s.wins.withoutThumb)}</Text> /{' '}
            <Text style={styles.lose}>{fmtBig(s.losses.withoutThumb)}</Text>
          </Line>
          <Line label="Avec Pouce">
            <Text style={styles.win}>{fmtBig(s.wins.withThumb)}</Text> /{' '}
            <Text style={styles.lose}>{fmtBig(s.losses.withThumb)}</Text>
          </Line>
          <Line label="Sauvetages du Pouce">{fmtBig(s.thumbSaves)}</Line>
        </StatCard>

        <StatCard
          side="right"
          artSize={artSize}
          landscape={landscape}
          art={<YusriArt size={artSize} present />}
        >
          <Line label="Automutilation de Yusri">{fmtBig(s.lifeLost)} PV</Line>
          <Line label="Pioche de Yusri">{cards(s.cardsYusri)}</Line>
        </StatCard>

        <StatCard
          side="left"
          artSize={artSize}
          landscape={landscape}
          art={<ZndrspltArt size={artSize} present />}
        >
          <Line label="Sagesse de Zndrsplt">{cards(s.cardsZndrsplt)}</Line>
        </StatCard>

        <StatCard
          side="right"
          artSize={artSize}
          landscape={landscape}
          art={<OkaunArt size={artSize} present />}
        >
          <Line label="Chaos d'Okaun">{fmtBig(s.okaunMax.power)}</Line>
        </StatCard>
      </View>

      <View style={[styles.actions, landscape && styles.actionsL]}>
        <SmallButton
          title="Nouvelle partie"
          tone="action"
          onPress={() =>
            confirm(
              'Nouvelle partie ?',
              'Les stats de cette partie seront perdues.',
              onNewGame,
            )
          }
        />
        <SmallButton
          title="Fin de partie"
          
          onPress={() =>
            confirm(
              'Terminer la partie ?',
              'Les stats seront archivées dans le total.',
              onFinishGame,
            )
          }
        />
        <SmallButton
          title="Effacer l'historique"
          danger
          onPress={() =>
            confirm(
              'Effacer l’historique ?',
              'Le total et la moyenne repartiront de zéro.',
              onResetRecords,
            )
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, gap: 6 },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  subtitle: {
    color: '#ecf0f1',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  gridL: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1f1f30',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3a3a55',
    minHeight: 84,
    marginTop: 26,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 4,
  },
  art: {
    position: 'absolute',
    top: -26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artLeft: { left: -8 },
  artRight: { right: -8 },
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  label: { color: '#bdc3c7', fontSize: 13, flexShrink: 1 },
  value: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', flexShrink: 0 },
  win: { color: '#2ecc71' },
  lose: { color: '#e74c3c' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 22,
  },
    contentL: { paddingVertical: 4, paddingHorizontal: 8, gap: 4 },
  subtitleL: { marginTop: 0 },
  cardL: {
    width: '48.5%',
    minHeight: 64,
    marginTop: 16,
    paddingVertical: 8,
    gap: 2,
  },
  artL: { top: -16 },
  actionsL: { marginTop: 10 },
});

export default StatsPage;