import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDoubleTap } from '../useDoubleTap';

type Props = {
  title: string;
  active: boolean; // sur le board ?
  onPlace: () => void; // appui sur une carte absente : poser
  onRemove: () => void; // appui long : retirer du board
  onOpen?: () => void; // appui court (à venir pour Yusri)
  onLaunch?: () => void; // double appui : lancer
  children?: ReactNode;
};

const BoardCard = ({
  title,
  active,
  onPlace,
  onRemove,
  onOpen,
  onLaunch,
  children,
}: Props) => {
  const tap = useDoubleTap(
    () => onOpen?.(),
    () => onLaunch?.(),
  );

  return (
    <TouchableOpacity
      style={[styles.card, active ? styles.cardActive : styles.cardInactive]}
      onPress={active ? tap : onPlace}
      onLongPress={active ? onRemove : undefined}
      activeOpacity={0.8}
    >
      <Text style={styles.title}>{title}</Text>
      {active ? (
        <View style={styles.body}>{children}</View>
      ) : (
        <Text style={styles.hint}>Poser</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 118,
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActive: { backgroundColor: '#2c3e50', borderColor: '#f1c40f' },
  cardInactive: {
    backgroundColor: '#1c1c2b',
    borderColor: '#3b3b50',
    opacity: 0.55,
  },
  title: { color: '#ecf0f1', fontSize: 16, fontWeight: 'bold' },
  body: { alignItems: 'center', marginTop: 4 },
  hint: { color: '#95a5a6', fontSize: 12, marginTop: 4 },
});

export default BoardCard;