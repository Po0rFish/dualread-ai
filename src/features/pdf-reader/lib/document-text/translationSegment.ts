import type { ClassifiedPdfTextSegment } from '../../../../shared/types/reader';
import type { PdfSentence } from '../../types/documentText';

interface CreateTranslationSegmentParams {
  readonly selectedSegment: ClassifiedPdfTextSegment | null;
  readonly selectedSentence: PdfSentence | null;
}

export const createTranslationSegment = ({
  selectedSegment,
  selectedSentence,
}: CreateTranslationSegmentParams): ClassifiedPdfTextSegment | null => {
  if (!selectedSegment) {
    return null;
  }

  if (!selectedSentence) {
    return selectedSegment;
  }

  return {
    ...selectedSegment,
    id: selectedSentence.id,
    text: selectedSentence.text,
    charactersCount: selectedSentence.text.length,
  };
};