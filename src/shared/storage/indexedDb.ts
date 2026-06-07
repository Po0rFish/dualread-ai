import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type {
  DocumentInfo,
  ReadingBlock,
  SavedWord,
} from '../types/reader';

export const DATABASE_NAME = 'dualread-ai';
export const DATABASE_VERSION = 2;

export const DOCUMENTS_STORE = 'documents';
export const SAVED_WORDS_STORE = 'savedWords';

export interface StoredProcessedDocument {
  documentInfo: DocumentInfo;
  blocks: ReadingBlock[];
}

interface DualReadDatabase extends DBSchema {
  documents: {
    key: string;
    value: StoredProcessedDocument;
    indexes: {
      'by-created-at': string;
    };
  };

  savedWords: {
    key: string;
    value: SavedWord;
    indexes: {
      'by-document-id': string;
      'by-created-at': string;
    };
  };
}

export const getDatabase = () => {
  return openDB<DualReadDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(DOCUMENTS_STORE)) {
        const documentsStore = database.createObjectStore(DOCUMENTS_STORE, {
          keyPath: 'documentInfo.id',
        });

        documentsStore.createIndex(
          'by-created-at',
          'documentInfo.createdAt',
        );
      }

      if (!database.objectStoreNames.contains(SAVED_WORDS_STORE)) {
        const savedWordsStore = database.createObjectStore(SAVED_WORDS_STORE, {
          keyPath: 'id',
        });

        savedWordsStore.createIndex(
          'by-document-id',
          'documentId',
        );

        savedWordsStore.createIndex(
          'by-created-at',
          'createdAt',
        );
      }
    },
  });
};