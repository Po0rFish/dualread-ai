import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PdfDocumentTextModel } from '../types/documentText';

const DATABASE_NAME = 'dualread-ai-text-models';
const DATABASE_VERSION = 1;

export const TEXT_MODELS_STORE = 'textModels';

interface TextModelsDatabase extends DBSchema {
  textModels: {
    key: string;
    value: PdfDocumentTextModel;
    indexes: {
      'by-created-at': string;
    };
  };
}

let databasePromise: Promise<IDBPDatabase<TextModelsDatabase>> | null =
  null;

export const getTextModelsDatabase = (): Promise<
  IDBPDatabase<TextModelsDatabase>
> => {
  if (!databasePromise) {
    databasePromise = openDB<TextModelsDatabase>(
      DATABASE_NAME,
      DATABASE_VERSION,
      {
        upgrade(database) {
          if (!database.objectStoreNames.contains(TEXT_MODELS_STORE)) {
            const textModelsStore = database.createObjectStore(
              TEXT_MODELS_STORE,
              {
                keyPath: 'documentId',
              },
            );

            textModelsStore.createIndex('by-created-at', 'createdAt');
          }
        },
      },
    );
  }

  return databasePromise;
};