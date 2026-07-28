import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { LibraryDocument } from '../types/library';

const DATABASE_NAME = 'dualread-ai-library';
const DATABASE_VERSION = 1;

export const LIBRARY_DOCUMENTS_STORE = 'documents';

interface LibraryDatabase extends DBSchema {
  documents: {
    key: string;
    value: LibraryDocument;
    indexes: {
      'by-created-at': string;
      'by-last-opened-at': string;
    };
  };
}

let databasePromise: Promise<IDBPDatabase<LibraryDatabase>> | null = null;

export const getLibraryDatabase = (): Promise<
  IDBPDatabase<LibraryDatabase>
> => {
  if (!databasePromise) {
    databasePromise = openDB<LibraryDatabase>(
      DATABASE_NAME,
      DATABASE_VERSION,
      {
        upgrade(database) {
          if (!database.objectStoreNames.contains(LIBRARY_DOCUMENTS_STORE)) {
            const documentsStore = database.createObjectStore(
              LIBRARY_DOCUMENTS_STORE,
              {
                keyPath: 'id',
              },
            );

            documentsStore.createIndex('by-created-at', 'createdAt');
            documentsStore.createIndex(
              'by-last-opened-at',
              'lastOpenedAt',
            );
          }
        },
      },
    );
  }

  return databasePromise;
};