import { useCallback, useMemo, useState } from 'react';
import {
  savedWordsRepository,
  SavedWordAlreadyExistsError,
  SavedWordsLimitReachedError,
} from '../../../shared/repositories/savedWordsRepository';
import type { SavedWord } from '../../../shared/types/reader';

export const useSavedWords = (documentId: string) => {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [savedWordsMessage, setSavedWordsMessage] = useState<string | null>(
    null,
  );
  const [isSavedWordsLoading, setIsSavedWordsLoading] = useState(false);

  const savedWordsSet = useMemo(() => {
    return new Set(
      savedWords.map((savedWord) => savedWord.word.trim().toLowerCase()),
    );
  }, [savedWords]);

  const isWordSaved = (word: string): boolean => {
    return savedWordsSet.has(word.trim().toLowerCase());
  };

  const loadSavedWords = useCallback(async (): Promise<void> => {
    if (!documentId) {
      setSavedWords([]);
      return;
    }

    setIsSavedWordsLoading(true);

    try {
      const documentSavedWords =
        await savedWordsRepository.getByDocumentId(documentId);

      setSavedWords(documentSavedWords);
    } finally {
      setIsSavedWordsLoading(false);
    }
  }, [documentId]);

  const saveWord = async (savedWord: SavedWord): Promise<void> => {
    try {
      await savedWordsRepository.add(savedWord);

      const documentSavedWords =
        await savedWordsRepository.getByDocumentId(savedWord.documentId);

      setSavedWords(documentSavedWords);
      setSavedWordsMessage(null);
    } catch (error) {
      if (error instanceof SavedWordAlreadyExistsError) {
        setSavedWordsMessage('This word is already saved.');
        return;
      }

      if (error instanceof SavedWordsLimitReachedError) {
        setSavedWordsMessage(
          'Saved words limit reached. You can keep up to 300 words per document.',
        );
        return;
      }

      throw error;
    }
  };

  const deleteSavedWord = async (wordId: string): Promise<void> => {
    await savedWordsRepository.delete(wordId);

    const documentSavedWords =
      await savedWordsRepository.getByDocumentId(documentId);

    setSavedWords(documentSavedWords);
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
  };
};