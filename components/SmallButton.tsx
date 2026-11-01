import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
};

const SmallButton = ({ title, onPress, onLongPress, disabled = false }: Props) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled]}
    onPress={onPress}
    onLongPress={onLongPress}
    disabled={disabled}
  >
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2980b9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { backgroundColor: '#4b5563' },
  text: { color: 'white', fontSize: 15, fontWeight: 'bold' },
});

export default SmallButton;