import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NumberPad from './NumberPad';
import SmallButton from './SmallButton';
import { Stats } from '../game';
import { useLandscape } from '../useLandscape';

type StatRowProps = {
  label: string;
  value: number;
  onDelta: (d: number) => void;
  onEdit: () => void;
};

const StatRow = ({ label, value, onDelta, onEdit }: StatRowProps) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <SmallButton title="−1" onPress={() => onDelta(-1)} />
    <SmallButton title="+1" onPress={() => onDelta(1)} />
    <SmallButton title="+3" onPress={() => onDelta(3)} />
    {/* On touche la valeur pour la saisir au pavé numérique */}
    <TouchableOpacity style={styles.statValue} onPress={onEdit}>
      <Text style={styles.statValueText}>{value}</Text>
    </TouchableOpacity>
  </View>
);

type Props = {
  now: Stats;
  base: Stats;
  onAdjust: (delta: Stats, permanent: boolean) => void;
  onSetValue: (value: Stats, permanent: boolean) => void;
};

type Editing = 'power' | 'toughness' | null;

const OkaunPanel = ({ now, base, onAdjust, onSetValue }: Props) => {
  const landscape = useLandscape();
  const [permanent, setPermanent] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);
  const shown = permanent ? base : now;

  // En paysage, la hauteur manque : pendant la saisie, le pavé prend toute la place
  const compactEdit = landscape && editing !== null;

  const submit = (v: number) => {
    onSetValue(
      editing === 'power'
        ? { power: v, toughness: shown.toughness }
        : { power: shown.power, toughness: v },
      permanent,
    );
    setEditing(null);
  };

  return (
    <View style={styles.panel}>
      {!compactEdit && (
        <>
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
            <Switch
              value={!permanent}
              onValueChange={v => setPermanent(!v)}
              disabled={editing !== null}
            />
            <Text style={[styles.mode, !permanent && styles.modeOn]}>
              Ce tour seulement
            </Text>
          </View>
        </>
      )}

      {editing ? (
        <NumberPad
          key={editing}
          title={`${editing === 'power' ? 'Force' : 'Endurance'} · ${
            permanent ? 'permanent' : 'ce tour'
          }`}
          initial={editing === 'power' ? shown.power : shown.toughness}
          maxDigits={7}
          onSubmit={submit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <StatRow
            label="Force"
            value={shown.power}
            onDelta={d => onAdjust({ power: d, toughness: 0 }, permanent)}
            onEdit={() => setEditing('power')}
          />
          <StatRow
            label="Endurance"
            value={shown.toughness}
            onDelta={d => onAdjust({ power: 0, toughness: d }, permanent)}
            onEdit={() => setEditing('toughness')}
          />
        </>
      )}
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
  statLabel: { color: '#ecf0f1', fontSize: 13, width: 70 },
  statValue: {
    width: 56,
    height: 36,
    borderWidth: 1,
    borderColor: '#7f8c8d',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueText: { color: '#ecf0f1', fontSize: 16 },
});

export default OkaunPanel;