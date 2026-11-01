import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
};

const SmallButton = ({
  title,
  onPress,
  onLongPress,
  disabled = false,
  selected = false,
}: Props) => (
  <TouchableOpacity
    style={[
      styles.button,
      selected && styles.selected,
      disabled && styles.disabled,
    ]}
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
  selected: { backgroundColor: '#27ae60' },
  disabled: { backgroundColor: '#4b5563' },
  text: { color: 'white', fontSize: 15, fontWeight: 'bold' },
});

export default SmallButton;