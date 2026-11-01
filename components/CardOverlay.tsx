import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const CardOverlay = ({ visible, onClose, children }: Props) => {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.6);
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scale]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          {/* capte les appuis : toucher la carte ne la ferme pas */}
          <View onStartShouldSetResponder={() => true}>{children}</View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '88%',
    backgroundColor: '#2c3e50',
    borderColor: '#f1c40f',
    borderWidth: 2,
    borderRadius: 18,
    padding: 18,
  },
});

export default CardOverlay;