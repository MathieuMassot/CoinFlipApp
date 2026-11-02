import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const OVERLAP = 46; // le personnage déborde sur le haut du panneau

type Props = {
  title: string;
  art: ReactNode; // le personnage, en grand
  artSize: number;
  children: ReactNode; // les réglages et actions
};

const CharacterDetail = ({ title, art, artSize, children }: Props) => (
  <View style={styles.wrapper}>
    <View style={[styles.artBox, { width: artSize, height: artSize }]}>
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
    <View style={[styles.panel, { paddingTop: OVERLAP + 8 }]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'center' },
  artBox: { marginBottom: -OVERLAP, zIndex: 2 },
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
  title: { color: '#ecf0f1', fontSize: 18, fontWeight: 'bold' },
});

export default CharacterDetail;