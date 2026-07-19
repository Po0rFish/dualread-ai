const DEFAULT_MAX_CONTEXT_LENGTH = 240;

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const splitIntoSentences = (text: string): string[] => {
  return text
    .split(/(?<=[.!?…。！？])\s+/)
    .map((sentence) => {
      return sentence.trim();
    })
    .filter((sentence) => {
      return sentence.length > 0;
    });
};

const trimLongContext = (
  context: string,
  maxLength = DEFAULT_MAX_CONTEXT_LENGTH,
): string => {
  if (context.length <= maxLength) {
    return context;
  }

  return `${context.slice(0, maxLength).trim()}…`;
};

export const getSentenceWithWord = (
  text: string,
  word: string,
): string => {
  const normalizedText = text.trim();
  const normalizedWord = word.trim();

  if (!normalizedWord) {
    return trimLongContext(normalizedText);
  }

  const sentences = splitIntoSentences(normalizedText);

const wordRegex = new RegExp(
  String.raw`(^|[^\p{L}\p{N}_])${escapeRegExp(normalizedWord)}(?=$|[^\p{L}\p{N}_])`,
  'iu',
);

  const sentenceWithWord = sentences.find((sentence) => {
    return wordRegex.test(sentence);
  });

  if (sentenceWithWord) {
    return trimLongContext(sentenceWithWord);
  }

  return trimLongContext(normalizedText);
};