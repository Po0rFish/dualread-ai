import type {
  PdfDocumentTextModel,
  PdfSentence,
} from '../../types/documentText';

interface FindSentenceParams {
  readonly textModel: PdfDocumentTextModel | null;
  readonly segmentId: string | null;
  readonly pageNumber?: number;
}

export const findSentence = ({
  textModel,
  segmentId,
  pageNumber,
}: FindSentenceParams): PdfSentence | null => {
  if (!textModel || !segmentId) {
    return null;
  }

  const sentence = textModel.sentences.find((currentSentence) => {
    return currentSentence.parts.some((part) => {
      const hasSameSegment = part.segmentId === segmentId;
      const hasSamePage =
        pageNumber === undefined || part.pageNumber === pageNumber;

      return hasSameSegment && hasSamePage;
    });
  });

  return sentence ?? null;
};