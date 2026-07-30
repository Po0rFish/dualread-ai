import { useEffect, useState } from 'react';
import type { PdfDocumentTextModel } from '../types/documentText';
import { readDoc } from '../lib/document-text/readDoc';

interface UseTextModelParams {
  readonly documentId?: string;
  readonly file: File;
}

interface UseTextModelResult {
  readonly textModel: PdfDocumentTextModel | null;
  readonly isTextModelLoading: boolean;
  readonly textModelError: string | null;
}

export const useTextModel = ({
  documentId,
  file,
}: UseTextModelParams): UseTextModelResult => {
  const [textModel, setTextModel] =
    useState<PdfDocumentTextModel | null>(null);
  const [isTextModelLoading, setIsTextModelLoading] = useState(false);
  const [textModelError, setTextModelError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isCancelled = false;

    const buildModel = async (): Promise<void> => {
      if (!documentId) {
        setTextModel(null);
        setTextModelError(null);
        return;
      }

      try {
        setIsTextModelLoading(true);
        setTextModelError(null);

        const nextTextModel = await readDoc({
          documentId,
          file,
        });

        if (isCancelled) {
          return;
        }

        setTextModel(nextTextModel);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[useTextModel] Build text model error:', error);

        setTextModel(null);
        setTextModelError('Text model could not be built.');
      } finally {
        if (!isCancelled) {
          setIsTextModelLoading(false);
        }
      }
    };

    void buildModel();

    return () => {
      isCancelled = true;
    };
  }, [documentId, file]);

  return {
    textModel,
    isTextModelLoading,
    textModelError,
  };
};