import {
  getTranslationsDatabase,
  TRANSLATIONS_STORE,
} from '../storage/cacheDb';
import type {
  DeleteTranslationsByDocumentParams,
  GetTranslationParams,
  SaveTranslationParams,
  TranslationCacheItem,
} from '../types/cache';

const createTranslationId = ({
  documentId,
  sourceTextHash,
  targetLanguage,
}: GetTranslationParams): string => {
  return `${documentId}:${sourceTextHash}:${targetLanguage}`;
};

export const cacheRepo = {
  async save({
    documentId,
    sourceText,
    sourceTextHash,
    targetLanguage,
    translatedText,
  }: SaveTranslationParams): Promise<TranslationCacheItem> {
    const database = await getTranslationsDatabase();

    const id = createTranslationId({
      documentId,
      sourceTextHash,
      targetLanguage,
    });

    const existingItem = await database.get(TRANSLATIONS_STORE, id);
    const now = new Date().toISOString();

    const nextItem: TranslationCacheItem = {
      id,
      documentId,
      sourceText,
      sourceTextHash,
      targetLanguage,
      translatedText,
      createdAt: existingItem?.createdAt ?? now,
      updatedAt: now,
    };

    await database.put(TRANSLATIONS_STORE, nextItem);

    return nextItem;
  },

  async get({
    documentId,
    sourceTextHash,
    targetLanguage,
  }: GetTranslationParams): Promise<TranslationCacheItem | null> {
    const database = await getTranslationsDatabase();

    const id = createTranslationId({
      documentId,
      sourceTextHash,
      targetLanguage,
    });

    const item = await database.get(TRANSLATIONS_STORE, id);

    return item ?? null;
  },

  async getByDocumentId(
    documentId: string,
  ): Promise<TranslationCacheItem[]> {
    const database = await getTranslationsDatabase();

    const items = await database.getAllFromIndex(
      TRANSLATIONS_STORE,
      'by-document-id',
      documentId,
    );

    return items.sort((firstItem, secondItem) => {
      return (
        new Date(secondItem.updatedAt).getTime() -
        new Date(firstItem.updatedAt).getTime()
      );
    });
  },

  async delete(id: string): Promise<void> {
    const database = await getTranslationsDatabase();

    await database.delete(TRANSLATIONS_STORE, id);
  },

  async deleteByDocumentId({
    documentId,
  }: DeleteTranslationsByDocumentParams): Promise<void> {
    const database = await getTranslationsDatabase();

    const items = await database.getAll(TRANSLATIONS_STORE);

    const itemsToDelete = items.filter((item) => {
      return item.documentId === documentId;
    });

    const transaction = database.transaction(
      TRANSLATIONS_STORE,
      'readwrite',
    );

    itemsToDelete.forEach((item) => {
      transaction.store.delete(item.id);
    });

    await transaction.done;
  },

  async clear(): Promise<void> {
    const database = await getTranslationsDatabase();

    await database.clear(TRANSLATIONS_STORE);
  },
};