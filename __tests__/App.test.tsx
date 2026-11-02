/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-sound', () => {
  const Sound = Object.assign(
    jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      release: jest.fn(),
      stop: jest.fn(),
    })),
    { MAIN_BUNDLE: '' },
  );
  return { __esModule: true, default: Sound };
});
jest.mock('@sayem314/react-native-keep-awake', () => ({
  useKeepAwake: jest.fn(),
}));
jest.mock('../storage', () => ({
  loadSaved: jest.fn(() => new Promise(() => {})),
  writeSaved: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
