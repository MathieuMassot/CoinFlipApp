import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SmallButton from './SmallButton';
import { useLandscape } from '../useLandscape';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'];
const GAP = 8;

type Props = {
  title: string;
  initial: number;
  maxDigits?: number;
  onSubmit: (value: number) => void;
  onCancel: () => void;
};

const NumberPad = ({
  title,
  initial,
  maxDigits = 6,
  onSubmit,
  onCancel,
}: Props) => {
  const landscape = useLandscape();
  const keyW = landscape ? 62 : 72;
  const keyH = landscape ? 44 : 52;

  const [text, setText] = useState(String(initial));
  // Le premier chiffre remplace la valeur affichée, comme sur une calculatrice
  const [fresh, setFresh] = useState(true);

  const press = (key: string) => {
    if (key === 'OK') {
      onSubmit(parseInt(text || '0', 10));
      return;
    }
    if (key === '⌫') {
      setText(t => t.slice(0, -1));
      setFresh(false);
      return;
    }
    const base = fresh ? '' : text;
    const next = base === '0' ? key : base + key; // pas de zéro en tête
    if (next.length <= maxDigits) {
      setText(next);
    }
    setFresh(false);
  };

  const cancel = <SmallButton title="Annuler" onPress={onCancel} />;

  // Portrait : tout en colonne. Paysage : la valeur à gauche, les touches à droite.
  return (
    <View style={[styles.pad, landscape && styles.padL]}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.display}>{text || '0'}</Text>
        {landscape && cancel}
      </View>
      <View
        style={[styles.keys, { width: keyW * 3 + GAP * 2 }]}
      >
        {KEYS.map(key => (
          <TouchableOpacity
            key={key}
            style={[
              styles.key,
              { width: keyW, height: keyH },
              key === 'OK' && styles.keyOk,
              key === '⌫' && styles.keyBack,
            ]}
            onPress={() => press(key)}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!landscape && cancel}
    </View>
  );
};

const styles = StyleSheet.create({
  pad: { alignItems: 'center', gap: 10 },
  padL: { flexDirection: 'row', gap: 18 },
  info: { alignItems: 'center', gap: 10, minWidth: 110 },
  title: { color: '#95a5a6', fontSize: 14, textAlign: 'center' },
  display: { color: '#ffffff', fontSize: 40, fontWeight: 'bold' },
  keys: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  key: {
    borderRadius: 12,
    backgroundColor: '#34495e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyOk: { backgroundColor: '#27ae60' },
  keyBack: { backgroundColor: '#5d6d7e' },
  keyText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
});

export default NumberPad;