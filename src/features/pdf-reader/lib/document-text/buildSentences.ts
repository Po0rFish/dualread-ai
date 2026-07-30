import type {
  PdfSentence,
  PdfSentencePart,
} from '../../types/documentText';
import { createSourceTextHash } from './createSourceTextHash';
import { splitTextIntoSentenceParts } from './splitTextIntoSentenceParts';

interface BuildSentencesParams {
  readonly documentId: string;
  readonly parts: PdfSentencePart[];
}

const normalizeSentenceText = (parts: PdfSentencePart[]): string => {
  return parts
    .map((part) => {
      return part.text;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const buildSentences = async ({
  documentId,
  parts,
}: BuildSentencesParams): Promise<PdfSentence[]> => {
  const sentenceParts = splitTextIntoSentenceParts(parts);

  const sentences = await Promise.all(
    sentenceParts.map(async (partsGroup, sentenceIndex) => {
      const text = normalizeSentenceText(partsGroup);
      const sourceTextHash = await createSourceTextHash(text);

      const sentence: PdfSentence = {
        id: `sentence-${sentenceIndex + 1}`,
        documentId,
        text,
        sourceTextHash,
        parts: partsGroup,
      };

      return sentence;
    }),
  );

  return sentences;
};