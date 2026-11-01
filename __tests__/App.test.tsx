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
    })),
    { MAIN_BUNDLE: '' },
  );
  return { __esModule: true, default: Sound };
});
jest.mock('@sayem314/react-native-keep-awake', () => ({
  useKeepAwake: jest.fn(),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
