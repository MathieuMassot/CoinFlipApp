import React, { useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ITEM_H = 34;
const NUMBERS = [1, 2, 3, 4, 5];
type ScrollViewRef = React.ElementRef<typeof ScrollView>;

type Props = {
  value: number; // de 1 à 5
  onChange: (value: number) => void;
  enabled?: boolean;
};

const SlotReel = ({ value, onChange, enabled = true }: Props) => {
  const ref = useRef<ScrollViewRef>(null);

  // Le chiffre affiché au centre se déduit de la position du rouleau
  const select = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const next = Math.min(NUMBERS.length, Math.max(1, index + 1));
    if (next !== value) {
      onChange(next);
    }
  };

  return (
    <View style={[styles.window, !enabled && styles.disabled]}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
        onLayout={() =>
          ref.current?.scrollTo({ y: (value - 1) * ITEM_H, animated: false })
        }
        onMomentumScrollEnd={select}
        onScrollEndDrag={select}
        nestedScrollEnabled
      >
        {NUMBERS.map(n => (
          <View key={n} style={styles.item}>
            <Text style={styles.number}>{n}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.shadeTop} />
      <View style={styles.band} />
      <View style={styles.shadeBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  window: {
    width: 54,
    height: ITEM_H * 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#b7950b',
    backgroundColor: '#0d0d16',
    overflow: 'hidden',
  },
  disabled: { opacity: 0.35, pointerEvents: 'none' },
  content: { paddingVertical: ITEM_H },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  number: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  shadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: 'rgba(13,13,22,0.65)',
    pointerEvents: 'none',
  },
  band: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#f1c40f',
    pointerEvents: 'none',
  },
  shadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: 'rgba(13,13,22,0.65)',
    pointerEvents: 'none',
  },
});

export default SlotReel;