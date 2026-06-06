import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type {
  DocumentInfo,
  ReadingBlock,
} from '../types/reader';

export const DATABASE_NAME = 'dualread-ai';
export const DATABASE_VERSION = 1;

export const DOCUMENTS_STORE = 'documents';

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
    },
  });
};