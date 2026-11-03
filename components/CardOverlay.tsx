import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useLandscape } from '../useLandscape';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const CardOverlay = ({ visible, onClose, children }: Props) => {
  const scale = useRef(new Animated.Value(0.6)).current;
  const landscape = useLandscape();

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
        <Animated.View
          style={[
            styles.content,
            landscape && styles.contentL,
            { transform: [{ scale }] },
          ]}
        >
          {/* capte les appuis : toucher le contenu ne le ferme pas */}
          <View onStartShouldSetResponder={() => true}>{children}</View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { width: '88%' },
  contentL: { width: '80%' },
});

export default CardOverlay;