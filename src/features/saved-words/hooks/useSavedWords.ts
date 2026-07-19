import { useMemo, useState } from 'react';
import type { SavedWordItem } from '../components/SavedWordsPanel';

const MAX_SAVED_WORDS_PER_DOCUMENT = 300;

interface UseSavedWordsResult {
  readonly savedWords: SavedWordItem[];
  readonly savedWordsMessage: string | null;
  readonly isSavedWordsLoading: boolean;
  readonly isWordSaved: (word: string) => boolean;
  readonly loadSavedWords: () => Promise<void>;
  readonly saveWord: (savedWord: SavedWordItem) => Promise<void>;
  readonly deleteSavedWord: (wordId: string) => Promise<void>;
  readonly clearSavedWordsMessage: () => void;
}

export const useSavedWords = (
  documentId: string,
): UseSavedWordsResult => {
  const [savedWords, setSavedWords] = useState<SavedWordItem[]>([]);
  const [savedWordsMessage, setSavedWordsMessage] = useState<
    string | null
  >(null);
  const [isSavedWordsLoading, setIsSavedWordsLoading] = useState(false);

  const savedWordsSet = useMemo(() => {
    return new Set(
      savedWords.map((savedWord) => {
        return savedWord.word.trim().toLowerCase();
      }),
    );
  }, [savedWords]);

  const isWordSaved = (word: string): boolean => {
    return savedWordsSet.has(word.trim().toLowerCase());
  };

  const loadSavedWords = async (): Promise<void> => {
    setIsSavedWordsLoading(true);

    try {
      setSavedWords([]);
      setSavedWordsMessage(null);
    } finally {
      setIsSavedWordsLoading(false);
    }
  };

  const saveWord = async (
    savedWord: SavedWordItem,
  ): Promise<void> => {
    if (!documentId) {
      return;
    }

    setSavedWords((currentSavedWords) => {
      const normalizedWord = savedWord.word.trim().toLowerCase();

      const alreadyExists = currentSavedWords.some((currentSavedWord) => {
        return (
          currentSavedWord.word.trim().toLowerCase() === normalizedWord
        );
      });

      if (alreadyExists) {
        setSavedWordsMessage('This word is already saved.');
        return currentSavedWords;
      }

      if (currentSavedWords.length >= MAX_SAVED_WORDS_PER_DOCUMENT) {
        setSavedWordsMessage(
          'Saved words limit reached. You can keep up to 300 words per document.',
        );

        return currentSavedWords;
      }

      setSavedWordsMessage(null);

      return [...currentSavedWords, savedWord];
    });
  };

  const deleteSavedWord = async (wordId: string): Promise<void> => {
    setSavedWords((currentSavedWords) => {
      return currentSavedWords.filter((savedWord) => {
        return savedWord.id !== wordId;
      });
    });

    setSavedWordsMessage(null);
  };

  const clearSavedWordsMessage = (): void => {
    setSavedWordsMessage(null);
  };

  return {
    savedWords,
    savedWordsMessage,
    isSavedWordsLoading,
    isWordSaved,
    loadSavedWords,
    saveWord,
    deleteSavedWord,
    clearSavedWordsMessage,
  };
};