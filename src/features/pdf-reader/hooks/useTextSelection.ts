import { useEffect, useState } from 'react';
import type { PdfTextSelection } from '../lib/resolveAnalysisSentence';
import { createSourceTextHash } from '../lib/document-text/createSourceTextHash';
import type { TranslationSourceSegment } from '../../translation/types/segment';
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
  readonly selection: PdfTextSelection | null;
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
  selection,
}: UseTextSelectionParams): UseTextSelectionResult => {
  const { textModel, isTextModelLoading, textModelError } = useTextModel({
    documentId,
    file,
  });

  const selectedSegment = selection?.segment ?? null;
  const [resolved, setResolved] = useState<{
    selection: PdfTextSelection;
    file: File;
    documentId?: string;
    sentence: PdfSentence | null;
  } | null>(null);

  useEffect(() => {
    if (!selection?.sentence?.text.trim()) return;
    let cancelled = false;
    const sentence = selection.sentence;
    void createSourceTextHash(sentence.text).then((sourceTextHash) => {
      if (!cancelled) setResolved({ selection, file, documentId, sentence: {
        id: sentence.id,
        documentId: documentId ?? '',
        text: sentence.text,
        sourceTextHash,
        parts: [],
      } });
    }).catch(() => {
      if (!cancelled) setResolved({ selection, file, documentId, sentence: null });
    });
    return () => { cancelled = true; };
  }, [selection, file, documentId]);

  const currentResolution = resolved?.selection === selection &&
    resolved?.file === file && resolved?.documentId === documentId ? resolved : null;
  const selectedSentence = currentResolution?.sentence ?? null;
  const translationSegment = selectedSentence?.text.trim()
    ? createTranslationSegment({ selectedSegment, selectedSentence })
    : null;

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
