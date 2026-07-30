import type { PdfSentencePart } from '../../types/documentText';

const SENTENCE_END_REGEXP = /[.!?…][»“”")\]]*$/;
const SENTENCE_FRAGMENT_REGEXP =
  /[^.!?…]+[.!?…][»“”")\]]*|[^.!?…]+$/g;

const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

const hasSentenceEnd = (text: string): boolean => {
  return SENTENCE_END_REGEXP.test(normalizeText(text));
};

const splitTextIntoFragments = (text: string): string[] => {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const fragments = normalizedText.match(SENTENCE_FRAGMENT_REGEXP);

  if (!fragments) {
    return [normalizedText];
  }

  return fragments
    .map((fragment) => {
      return normalizeText(fragment);
    })
    .filter((fragment) => {
      return fragment.length > 0;
    });
};

export const splitTextIntoSentenceParts = (
  parts: PdfSentencePart[],
): PdfSentencePart[][] => {
  const sentenceParts: PdfSentencePart[][] = [];
  let currentSentenceParts: PdfSentencePart[] = [];

  parts.forEach((part) => {
    const fragments = splitTextIntoFragments(part.text);

    fragments.forEach((fragment) => {
      const nextPart: PdfSentencePart = {
        ...part,
        text: fragment,
      };

      currentSentenceParts.push(nextPart);

      if (hasSentenceEnd(fragment)) {
        sentenceParts.push(currentSentenceParts);
        currentSentenceParts = [];
      }
    });
  });

  if (currentSentenceParts.length > 0) {
    sentenceParts.push(currentSentenceParts);
  }

  return sentenceParts;
};