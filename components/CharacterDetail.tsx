import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLandscape } from '../useLandscape';

const OVERLAP = 46; // en portrait, le personnage déborde sur le haut du panneau

type Props = {
  title: string;
  art: ReactNode; // le personnage, en grand
  artSize: number;
  children: ReactNode; // les réglages et actions
};

const CharacterDetail = ({ title, art, artSize, children }: Props) => {
  const landscape = useLandscape();
  const topPadding = landscape ? 14 : OVERLAP + 8;

  return (
    <View style={[styles.wrapper, landscape && styles.wrapperL]}>
      <View
        style={[
          styles.artBox,
          landscape && styles.artBoxL,
          { width: artSize, height: artSize },
        ]}
      >
        <View
          style={[
            styles.glow,
            {
              top: artSize * 0.08,
              left: artSize * 0.08,
              width: artSize * 0.84,
              height: artSize * 0.84,
              borderRadius: artSize,
            },
          ]}
        />
        {art}
      </View>
      <View
        style={[
          styles.panel,
          landscape && styles.panelL,
          { paddingTop: topPadding },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Portrait : le personnage au-dessus du panneau. Paysage : côte à côte.
  wrapper: { width: '100%', alignItems: 'center' },
  wrapperL: { flexDirection: 'row' },
  artBox: { marginBottom: -OVERLAP, zIndex: 2 },
  artBoxL: { marginBottom: 0, marginRight: 12 },
  glow: { position: 'absolute', backgroundColor: 'rgba(241,196,15,0.10)' },
  panel: {
    width: '100%',
    backgroundColor: '#1f2a38',
    borderColor: '#f1c40f',
    borderWidth: 2,
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  panelL: { flex: 1, width: 'auto' },
  title: { color: '#ecf0f1', fontSize: 18, fontWeight: 'bold' },
});

export default CharacterDetail;