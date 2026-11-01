import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  active: boolean; // sur le board ?
  onPlace: () => void;
  onRemove: () => void;
  onPress?: () => void; // appui sur une carte posée (utilisé en 7b)
  children?: ReactNode;
};

const BoardCard = ({
  title,
  active,
  onPlace,
  onRemove,
  onPress,
  children,
}: Props) => (
  <TouchableOpacity
    style={[styles.card, active ? styles.cardActive : styles.cardInactive]}
    onPress={active ? onPress : onPlace}
    activeOpacity={0.8}
  >
    <Text style={styles.title}>{title}</Text>
    {active ? (
      <>
        {children}
        <TouchableOpacity onPress={onRemove} hitSlop={10}>
          <Text style={styles.remove}>Retirer</Text>
        </TouchableOpacity>
      </>
    ) : (
      <Text style={styles.hint}>Touche pour poser</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: 150,
    minHeight: 130,
    borderRadius: 14,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActive: {
    backgroundColor: '#2c3e50',
    borderColor: '#f1c40f',
  },
  cardInactive: {
    backgroundColor: '#1c1c2b',
    borderColor: '#3b3b50',
    opacity: 0.55,
  },
  title: { color: '#ecf0f1', fontSize: 18, fontWeight: 'bold' },
  hint: { color: '#95a5a6', fontSize: 12, marginTop: 8 },
  remove: { color: '#e67e22', fontSize: 12, marginTop: 6 },
});

export default BoardCard;