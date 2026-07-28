import { createDocumentFingerprint } from '../lib/createDocumentFingerprint';
import {
  getLibraryDatabase,
  LIBRARY_DOCUMENTS_STORE,
} from '../storage/libraryDb';
import type {
  CreateLibraryDocumentParams,
  LibraryDocument,
  LibraryDocumentInfo,
} from '../types/library';

export const MAX_LIBRARY_DOCUMENTS = 3;

export class LibraryDocumentsLimitReachedError extends Error {
  constructor() {
    super('Library documents limit reached');
    this.name = 'LibraryDocumentsLimitReachedError';
  }
}

const mapDocumentToInfo = (
  document: LibraryDocument,
): LibraryDocumentInfo => {
  return {
    id: document.id,
    fileName: document.fileName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    pagesCount: document.pagesCount,
    createdAt: document.createdAt,
    lastOpenedAt: document.lastOpenedAt,
  };
};

const sortDocumentsByLastOpenedAtDesc = (
  documents: LibraryDocument[],
): LibraryDocument[] => {
  return [...documents].sort((firstDocument, secondDocument) => {
    return (
      new Date(secondDocument.lastOpenedAt).getTime() -
      new Date(firstDocument.lastOpenedAt).getTime()
    );
  });
};

const createPdfBlob = (file: File): Blob => {
  return file.slice(0, file.size, file.type || 'application/pdf');
};

export const documentsRepository = {
  async save({
    file,
    pagesCount,
  }: CreateLibraryDocumentParams): Promise<LibraryDocumentInfo> {
    const database = await getLibraryDatabase();
    const documentId = await createDocumentFingerprint(file);

    const existingDocument = await database.get(
      LIBRARY_DOCUMENTS_STORE,
      documentId,
    );

    if (!existingDocument) {
      const documentsCount = await database.count(
        LIBRARY_DOCUMENTS_STORE,
      );

      if (documentsCount >= MAX_LIBRARY_DOCUMENTS) {
        throw new LibraryDocumentsLimitReachedError();
      }
    }

    const now = new Date().toISOString();

    const nextDocument: LibraryDocument = {
      id: documentId,
      fileName: file.name,
      fileType: file.type || 'application/pdf',
      fileSize: file.size,
      fileBlob: createPdfBlob(file),
      pagesCount,
      createdAt: existingDocument?.createdAt ?? now,
      lastOpenedAt: now,
    };

    await database.put(LIBRARY_DOCUMENTS_STORE, nextDocument);

    return mapDocumentToInfo(nextDocument);
  },

  async get(documentId: string): Promise<LibraryDocument | null> {
    const database = await getLibraryDatabase();

    const document = await database.get(
      LIBRARY_DOCUMENTS_STORE,
      documentId,
    );

    return document ?? null;
  },

  async getInfo(
    documentId: string,
  ): Promise<LibraryDocumentInfo | null> {
    const document = await this.get(documentId);

    if (!document) {
      return null;
    }

    return mapDocumentToInfo(document);
  },

  async getAllInfo(): Promise<LibraryDocumentInfo[]> {
    const database = await getLibraryDatabase();
    const documents = await database.getAll(LIBRARY_DOCUMENTS_STORE);

    return sortDocumentsByLastOpenedAtDesc(documents).map(
      mapDocumentToInfo,
    );
  },

  async updateLastOpenedAt(
    documentId: string,
  ): Promise<LibraryDocument | null> {
    const database = await getLibraryDatabase();

    const document = await database.get(
      LIBRARY_DOCUMENTS_STORE,
      documentId,
    );

    if (!document) {
      return null;
    }

    const updatedDocument: LibraryDocument = {
      ...document,
      lastOpenedAt: new Date().toISOString(),
    };

    await database.put(LIBRARY_DOCUMENTS_STORE, updatedDocument);

    return updatedDocument;
  },

  async delete(documentId: string): Promise<void> {
    const database = await getLibraryDatabase();

    await database.delete(LIBRARY_DOCUMENTS_STORE, documentId);
  },

  async clear(): Promise<void> {
    const database = await getLibraryDatabase();

    await database.clear(LIBRARY_DOCUMENTS_STORE);
  },

  async count(): Promise<number> {
    const database = await getLibraryDatabase();

    return database.count(LIBRARY_DOCUMENTS_STORE);
  },
};