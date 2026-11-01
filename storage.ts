import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { Saved, defaultSaved, parseSaved, serializeSaved } from './saved';

const storage = createAsyncStorage('coinflip');
const KEY = 'save';

export const loadSaved = async (): Promise<Saved> => {
  try {
    return parseSaved(await storage.getItem(KEY));
  } catch {
    return defaultSaved();
  }
};

export const writeSaved = async (saved: Saved): Promise<void> => {
  try {
    await storage.setItem(KEY, serializeSaved(saved));
  } catch {
    // échec d'écriture : on ne bloque jamais la partie pour ça
  }
};