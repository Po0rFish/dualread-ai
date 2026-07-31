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
  provider,
}: GetTranslationParams): string => {
  return `${documentId}:${sourceTextHash}:${targetLanguage}:${provider}`;
};
const createLegacyTranslationId = ({
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
    provider,
    translatedText,
  }: SaveTranslationParams): Promise<TranslationCacheItem> {
    const database = await getTranslationsDatabase();

    const id = createTranslationId({
      documentId,
      sourceTextHash,
      targetLanguage,
      provider,
    });

    const existingItem = await database.get(TRANSLATIONS_STORE, id);
    const now = new Date().toISOString();

    const nextItem: TranslationCacheItem = {
      id,
      documentId,
      sourceText,
      sourceTextHash,
      targetLanguage,
      provider,
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
    provider,
  }: GetTranslationParams): Promise<TranslationCacheItem | null> {
    const database = await getTranslationsDatabase();

    const id = createTranslationId({
      documentId,
      sourceTextHash,
      targetLanguage,
      provider,
    });

    const item = await database.get(TRANSLATIONS_STORE, id);

    if (item) {
      return item;
    }

    const legacyId = createLegacyTranslationId({
      documentId,
      sourceTextHash,
      targetLanguage,
      provider,
    });

    const legacyItem = await database.get(TRANSLATIONS_STORE, legacyId);

    if (!legacyItem) {
      return null;
    }

    if (legacyItem.provider && legacyItem.provider !== provider) {
      return null;
    }

    if (provider !== 'mock') {
      return null;
    }

    const migratedItem: TranslationCacheItem = {
      ...legacyItem,
      id,
      provider,
      updatedAt: new Date().toISOString(),
    };

    await database.put(TRANSLATIONS_STORE, migratedItem);

    return migratedItem;
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