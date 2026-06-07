import {
  SAVED_WORDS_STORE,
  getDatabase,
} from '../storage/indexedDb';
import type { SavedWord } from '../types/reader';

const MAX_SAVED_WORDS_PER_DOCUMENT = 300;

export class SavedWordsLimitReachedError extends Error {
  constructor() {
    super('Saved words limit reached');
    this.name = 'SavedWordsLimitReachedError';
  }
}

export class SavedWordAlreadyExistsError extends Error {
  constructor() {
    super('Saved word already exists');
    this.name = 'SavedWordAlreadyExistsError';
  }
}

const normalizeWord = (word: string): string => {
  return word.trim().toLowerCase();
};

const sortSavedWordsByCreatedAtDesc = (
  savedWords: SavedWord[],
): SavedWord[] => {
  return [...savedWords].sort((a, b) => {
    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });
};

export const savedWordsRepository = {
  async getByDocumentId(documentId: string): Promise<SavedWord[]> {
    const database = await getDatabase();
    const savedWords = await database.getAllFromIndex(
      SAVED_WORDS_STORE,
      'by-document-id',
      documentId,
    );

    return sortSavedWordsByCreatedAtDesc(savedWords);
  },

  async add(savedWord: SavedWord): Promise<void> {
    const database = await getDatabase();

    const documentSavedWords = await this.getByDocumentId(
      savedWord.documentId,
    );

    const normalizedNewWord = normalizeWord(savedWord.word);

    const alreadyExists = documentSavedWords.some((item) => {
      return normalizeWord(item.word) === normalizedNewWord;
    });

    if (alreadyExists) {
      throw new SavedWordAlreadyExistsError();
    }

    if (documentSavedWords.length >= MAX_SAVED_WORDS_PER_DOCUMENT) {
      throw new SavedWordsLimitReachedError();
    }

    await database.put(SAVED_WORDS_STORE, savedWord);
  },

  async delete(wordId: string): Promise<void> {
    const database = await getDatabase();

    await database.delete(SAVED_WORDS_STORE, wordId);
  },

  async deleteByDocumentId(documentId: string): Promise<void> {
    const database = await getDatabase();
    const savedWords = await this.getByDocumentId(documentId);

    await Promise.all(
      savedWords.map((savedWord) =>
        database.delete(SAVED_WORDS_STORE, savedWord.id),
      ),
    );
  },

  async clear(): Promise<void> {
    const database = await getDatabase();

    await database.clear(SAVED_WORDS_STORE);
  },
};