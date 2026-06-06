import type { ReaderSettings } from '../types/reader';

const STORAGE_KEY = 'dualread-ai:reader-settings';

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 21,
  theme: 'sepia',
};

export const getReaderSettings = (): ReaderSettings => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return DEFAULT_READER_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_READER_SETTINGS,
      ...(JSON.parse(rawValue) as Partial<ReaderSettings>),
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
};

export const setReaderSettings = (settings: ReaderSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};