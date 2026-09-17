import type { ClassifiedPdfTextSegment } from '../../../../shared/types/reader';
import type { TranslationSourceSegment } from '../../../translation/types/segment';
import type { PdfSentence } from '../../types/documentText';

interface CreateTranslationSegmentParams {
  readonly selectedSegment: ClassifiedPdfTextSegment | null;
  readonly selectedSentence: PdfSentence | null;
}

export const createTranslationSegment = ({
  selectedSegment,
  selectedSentence,
}: CreateTranslationSegmentParams): TranslationSourceSegment | null => {
  if (!selectedSegment || !selectedSentence?.text.trim()) {
    return null;
  }

  return {
    ...selectedSegment,
    id: selectedSentence.id,
    text: selectedSentence.text,
    charactersCount: selectedSentence.text.length,
    documentId: selectedSentence.documentId,
    sourceTextHash: selectedSentence.sourceTextHash,
  };
};
