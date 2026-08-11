import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import type { TranslationSourceSegment } from '../../translation/types/segment';
import { findSentence } from '../lib/document-text/findSentence';
import { createTranslationSegment } from '../lib/document-text/translationSegment';
import {
  getTextModelStatus,
  type TextModelStatus,
} from '../lib/readerState';
import type { PdfSentence } from '../types/documentText';
import { useTextModel } from './useTextModel';

interface UseTextSelectionParams {
  readonly documentId?: string;
  readonly file: File;
  readonly selectedSegment: ClassifiedPdfTextSegment | null;
}

interface UseTextSelectionResult {
  readonly selectedSentence: PdfSentence | null;
  readonly translationSegment: TranslationSourceSegment | null;
  readonly textModelStatus: TextModelStatus;
  readonly sentencesCount: number;
  readonly isTextModelLoading: boolean;
}

export const useTextSelection = ({
  documentId,
  file,
  selectedSegment,
}: UseTextSelectionParams): UseTextSelectionResult => {
  const { textModel, isTextModelLoading, textModelError } = useTextModel({
    documentId,
    file,
  });

  const selectedSentence = findSentence({
    textModel,
    segmentId: selectedSegment?.id ?? null,
    segmentText: selectedSegment?.text,
    pageNumber: selectedSegment?.pageNumber,
  });

  const translationSegment = createTranslationSegment({
    selectedSegment,
    selectedSentence,
  });

  const textModelStatus = getTextModelStatus({
    textModel,
    isTextModelLoading,
    textModelError,
  });

  return {
    selectedSentence,
    translationSegment,
    textModelStatus,
    sentencesCount: textModel?.sentences.length ?? 0,
    isTextModelLoading,
  };
};
