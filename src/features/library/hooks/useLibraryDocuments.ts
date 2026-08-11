import { useCallback, useState } from 'react';
import {
  deleteOrphanReadingProgress,
  deleteReadingProgress,
} from '../../../shared/storage/readingProgressStorage';
import {
  documentsRepository,
  LibraryDocumentsLimitReachedError,
  MAX_LIBRARY_DOCUMENTS,
} from '../repositories/documentRepository';
import { textModelRepo } from '../../pdf-reader/repositories/textModelRepo';
import { cacheRepo } from '../../translation/repositories/cacheRepo';
import type {
  CreateLibraryDocumentParams,
  LibraryDocument,
  LibraryDocumentInfo,
} from '../types/library';
interface UseLibraryDocumentsResult {
  readonly documents: LibraryDocumentInfo[];
  readonly selectedDocument: LibraryDocument | null;
  readonly libraryMessage: string | null;
  readonly isLibraryLoading: boolean;
  readonly loadDocuments: () => Promise<void>;
  readonly saveDocument: (
    params: CreateLibraryDocumentParams,
  ) => Promise<LibraryDocumentInfo | null>;
  readonly openDocument: (
    documentId: string,
  ) => Promise<LibraryDocument | null>;
  readonly deleteDocument: (documentId: string) => Promise<void>;
  readonly clearLibraryMessage: () => void;
}

const cleanupOrphanDocumentData = async (
  documents: LibraryDocumentInfo[],
): Promise<void> => {
  const documentIds = documents.map((document) => {
    return document.id;
  });

  await Promise.all([
    textModelRepo.deleteOrphans(documentIds),
    cacheRepo.deleteOrphans(documentIds),
  ]);
  deleteOrphanReadingProgress(documentIds);
};

export const useLibraryDocuments = (): UseLibraryDocumentsResult => {
  const [documents, setDocuments] = useState<LibraryDocumentInfo[]>([]);
  const [selectedDocument, setSelectedDocument] =
    useState<LibraryDocument | null>(null);
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  const loadDocuments = useCallback(async (): Promise<void> => {
    setIsLibraryLoading(true);

    try {
      const nextDocuments = await documentsRepository.getAllInfo();

      await cleanupOrphanDocumentData(nextDocuments);

      setDocuments(nextDocuments);
      setLibraryMessage(null);
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  const saveDocument = useCallback(
    async ({
      file,
      pagesCount,
    }: CreateLibraryDocumentParams): Promise<LibraryDocumentInfo | null> => {
      setIsLibraryLoading(true);

      try {
        const savedDocument = await documentsRepository.save({
          file,
          pagesCount,
        });

        const nextDocuments = await documentsRepository.getAllInfo();

        await cleanupOrphanDocumentData(nextDocuments);

        setDocuments(nextDocuments);
        setLibraryMessage(null);

        return savedDocument;
      } catch (error) {
        if (error instanceof LibraryDocumentsLimitReachedError) {
          setLibraryMessage(
            `Library limit reached. You can keep up to ${MAX_LIBRARY_DOCUMENTS} documents.`,
          );

          return null;
        }

        throw error;
      } finally {
        setIsLibraryLoading(false);
      }
    },
    [],
  );

  const openDocument = useCallback(
    async (documentId: string): Promise<LibraryDocument | null> => {
      setIsLibraryLoading(true);

      try {
        const document = await documentsRepository.updateLastOpenedAt(
          documentId,
        );

        if (!document) {
          setSelectedDocument(null);
          setLibraryMessage('Document was not found.');

          return null;
        }

        const nextDocuments = await documentsRepository.getAllInfo();

        await cleanupOrphanDocumentData(nextDocuments);

        setDocuments(nextDocuments);
        setSelectedDocument(document);
        setLibraryMessage(null);

        return document;
      } finally {
        setIsLibraryLoading(false);
      }
    },
    [],
  );

  const deleteDocument = useCallback(
    async (documentId: string): Promise<void> => {
      setIsLibraryLoading(true);

      try {
        await documentsRepository.delete(documentId);
        await textModelRepo.delete(documentId);
        await cacheRepo.deleteByDocumentId({ documentId });
        deleteReadingProgress(documentId);

        const nextDocuments = await documentsRepository.getAllInfo();

        await cleanupOrphanDocumentData(nextDocuments);

        setDocuments(nextDocuments);

        setSelectedDocument((currentDocument) => {
          if (currentDocument?.id === documentId) {
            return null;
          }

          return currentDocument;
        });

        setLibraryMessage(null);
      } finally {
        setIsLibraryLoading(false);
      }
    },
    [],
  );

  const clearLibraryMessage = useCallback((): void => {
    setLibraryMessage(null);
  }, []);

  return {
    documents,
    selectedDocument,
    libraryMessage,
    isLibraryLoading,
    loadDocuments,
    saveDocument,
    openDocument,
    deleteDocument,
    clearLibraryMessage,
  };
};
