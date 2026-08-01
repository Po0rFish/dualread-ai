import { useEffect, useState } from 'react';
import { readDoc } from '../lib/document-text/readDoc';
import { textModelRepo } from '../repositories/textModelRepo';
import type { PdfDocumentTextModel } from '../types/documentText';

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

    const loadTextModel = async (): Promise<void> => {
      if (!documentId) {
        setTextModel(null);
        setTextModelError(null);
        setIsTextModelLoading(false);
        return;
      }

      try {
        setIsTextModelLoading(true);
        setTextModel(null);
        setTextModelError(null);

        const cachedTextModel = await textModelRepo.get(documentId);

        if (isCancelled) {
          return;
        }

        if (cachedTextModel) {
          setTextModel(cachedTextModel);
          return;
        }

        const nextTextModel = await readDoc({
          documentId,
          file,
        });

        await textModelRepo.save(nextTextModel);

        if (isCancelled) {
          return;
        }

        setTextModel(nextTextModel);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[useTextModel] Load text model error:', error);

        setTextModel(null);
        setTextModelError('Text model could not be loaded.');
      } finally {
        if (!isCancelled) {
          setIsTextModelLoading(false);
        }
      }
    };

    void loadTextModel();

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