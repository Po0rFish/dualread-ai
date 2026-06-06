import {
  DOCUMENTS_STORE,
  getDatabase,
  type StoredProcessedDocument,
} from '../storage/indexedDb';

export const MAX_STORED_DOCUMENTS = 3;

export class DocumentsLimitReachedError extends Error {
  constructor() {
    super('Documents limit reached');
    this.name = 'DocumentsLimitReachedError';
  }
}

export type ProcessedDocument = StoredProcessedDocument;

const sortDocumentsByCreatedAtDesc = (
  documents: ProcessedDocument[],
): ProcessedDocument[] => {
  return [...documents].sort((a, b) => {
    return (
      new Date(b.documentInfo.createdAt).getTime() -
      new Date(a.documentInfo.createdAt).getTime()
    );
  });
};

export const documentsRepository = {
  async set(document: ProcessedDocument): Promise<void> {
    const database = await getDatabase();
    const existingDocument = await database.get(
      DOCUMENTS_STORE,
      document.documentInfo.id,
    );

    if (!existingDocument) {
      const documents = await database.getAll(DOCUMENTS_STORE);

      if (documents.length >= MAX_STORED_DOCUMENTS) {
        throw new DocumentsLimitReachedError();
      }
    }

    await database.put(DOCUMENTS_STORE, document);
  },

  async get(documentId: string): Promise<ProcessedDocument | null> {
    const database = await getDatabase();
    const document = await database.get(DOCUMENTS_STORE, documentId);

    return document ?? null;
  },

  async getAll(): Promise<ProcessedDocument[]> {
    const database = await getDatabase();
    const documents = await database.getAll(DOCUMENTS_STORE);

    return sortDocumentsByCreatedAtDesc(documents);
  },

  async delete(documentId: string): Promise<void> {
    const database = await getDatabase();

    await database.delete(DOCUMENTS_STORE, documentId);
  },

  async clear(): Promise<void> {
    const database = await getDatabase();

    await database.clear(DOCUMENTS_STORE);
  },
};