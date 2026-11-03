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
      <View style={styles.backdrop}>
        {/* Le fond qui ferme la carte est un voisin placé derrière le contenu, et non
            son parent : rien n'enveloppe le contenu, donc ses gestes (comme le
            glissement de Yusri) ne sont pas volés. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.content,
            landscape && styles.contentL,
            { transform: [{ scale }] },
          ]}
        >
          {children}
        </Animated.View>
      </View>
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