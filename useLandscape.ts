import { useWindowDimensions } from 'react-native';

// Vrai quand l'écran est en paysage
export const useLandscape = () => {
  const { width, height } = useWindowDimensions();
  return width > height;
};