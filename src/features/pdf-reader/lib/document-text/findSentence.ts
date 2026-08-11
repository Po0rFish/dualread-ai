import type {
  PdfDocumentTextModel,
  PdfSentence,
} from '../../types/documentText';

interface FindSentenceParams {
  readonly textModel: PdfDocumentTextModel | null;
  readonly segmentId: string | null;
  readonly segmentText?: string;
  readonly pageNumber?: number;
}

const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
};

export const findSentence = ({
  textModel,
  segmentId,
  segmentText,
  pageNumber,
}: FindSentenceParams): PdfSentence | null => {
  if (!textModel || !segmentId) {
    return null;
  }

  const normalizedSegmentText = segmentText
    ? normalizeText(segmentText)
    : '';
  const sentencesOnPage = textModel.sentences.filter((currentSentence) => {
    return currentSentence.parts.some((part) => {
      return pageNumber === undefined || part.pageNumber === pageNumber;
    });
  });

  if (normalizedSegmentText) {
    const sentenceByText = sentencesOnPage.find((currentSentence) => {
      const normalizedSentenceText = normalizeText(currentSentence.text);

      return (
        normalizedSentenceText === normalizedSegmentText ||
        normalizedSentenceText.includes(normalizedSegmentText) ||
        normalizedSegmentText.includes(normalizedSentenceText)
      );
    });

    if (sentenceByText) {
      return sentenceByText;
    }
  }

  const sentence = sentencesOnPage.find((currentSentence) => {
    return currentSentence.parts.some((part) => {
      return part.segmentId === segmentId;
    });
  });

  return sentence ?? null;
};
