import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import SmallButton from './SmallButton';
import { Stats } from '../game';

type StatRowProps = {
  label: string;
  value: number;
  onDelta: (d: number) => void;
  onSet: (v: number) => void;
};

const StatRow = ({ label, value, onDelta, onSet }: StatRowProps) => {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commitText = () => {
    const v = parseInt(text, 10);
    if (Number.isFinite(v) && v >= 0) {
      onSet(v);
    } else {
      setText(String(value));
    }
  };

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <SmallButton title="−1" onPress={() => onDelta(-1)} />
      <SmallButton title="+1" onPress={() => onDelta(1)} />
      <SmallButton title="+3" onPress={() => onDelta(3)} />
      <TextInput
        style={styles.statInput}
        value={text}
        onChangeText={setText}
        onEndEditing={commitText}
        keyboardType="number-pad"
      />
    </View>
  );
};

type Props = {
  now: Stats;
  base: Stats;
  onAdjust: (delta: Stats, permanent: boolean) => void;
  onSetValue: (value: Stats, permanent: boolean) => void;
};

const OkaunPanel = ({ now, base, onAdjust, onSetValue }: Props) => {
  const [permanent, setPermanent] = useState(true);
  const shown = permanent ? base : now;

  return (
    <View style={styles.panel}>
      <View style={styles.valueRow}>
        <Text style={styles.big}>
          {now.power}/{now.toughness}
        </Text>
        <Text style={styles.sub}>
          base {base.power}/{base.toughness}
        </Text>
      </View>

      {/* À gauche : permanent (artefact). À droite : ce tour seulement. */}
      <View style={styles.modeRow}>
        <Text style={[styles.mode, permanent && styles.modeOn]}>
          Permanent
        </Text>
        <Switch value={!permanent} onValueChange={v => setPermanent(!v)} />
        <Text style={[styles.mode, !permanent && styles.modeOn]}>
          Ce tour seulement
        </Text>
      </View>

      <StatRow
        label="Attaque"
        value={shown.power}
        onDelta={d => onAdjust({ power: d, toughness: 0 }, permanent)}
        onSet={v =>
          onSetValue({ power: v, toughness: shown.toughness }, permanent)
        }
      />
      <StatRow
        label="Défense"
        value={shown.toughness}
        onDelta={d => onAdjust({ power: 0, toughness: d }, permanent)}
        onSet={v => onSetValue({ power: shown.power, toughness: v }, permanent)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { alignItems: 'center', gap: 8 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  big: { color: '#ffffff', fontSize: 34, fontWeight: 'bold' },
  sub: { color: '#95a5a6', fontSize: 13 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mode: { color: '#7f8c8d', fontSize: 13 },
  modeOn: { color: '#f1c40f', fontWeight: 'bold' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { color: '#ecf0f1', fontSize: 14, width: 62 },
  statInput: {
    width: 52,
    borderWidth: 1,
    borderColor: '#7f8c8d',
    borderRadius: 10,
    color: '#ecf0f1',
    fontSize: 17,
    textAlign: 'center',
    paddingVertical: 4,
  },
});

export default OkaunPanel;