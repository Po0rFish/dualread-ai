import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TranslationCacheItem } from '../types/cache';

const DATABASE_NAME = 'dualread-ai-translations';
const DATABASE_VERSION = 1;

export const TRANSLATIONS_STORE = 'translations';

interface TranslationsDatabase extends DBSchema {
  translations: {
    key: string;
    value: TranslationCacheItem;
    indexes: {
      'by-document-id': string;
      'by-updated-at': string;
    };
  };
}

let databasePromise: Promise<IDBPDatabase<TranslationsDatabase>> | null =
  null;

export const getTranslationsDatabase = (): Promise<
  IDBPDatabase<TranslationsDatabase>
> => {
  if (!databasePromise) {
    databasePromise = openDB<TranslationsDatabase>(
      DATABASE_NAME,
      DATABASE_VERSION,
      {
        upgrade(database) {
          if (!database.objectStoreNames.contains(TRANSLATIONS_STORE)) {
            const translationsStore = database.createObjectStore(
              TRANSLATIONS_STORE,
              {
                keyPath: 'id',
              },
            );

            translationsStore.createIndex(
              'by-document-id',
              'documentId',
            );

            translationsStore.createIndex(
              'by-updated-at',
              'updatedAt',
            );
          }
        },
      },
    );
  }

  return databasePromise;
};