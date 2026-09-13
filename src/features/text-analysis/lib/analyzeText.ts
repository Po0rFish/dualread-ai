import type { TextAnalysis } from '../types';
import { mergeEllipsisContinuations } from './mergeEllipsisContinuations';

export function analyzeText(text: string, locale = 'de'): TextAnalysis {
  const sentenceSegmenter = new Intl.Segmenter(locale, { granularity: 'sentence' });
  const wordSegmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  const sentences = mergeEllipsisContinuations(
    Array.from(sentenceSegmenter.segment(text), ({ segment, index }) => ({
      text: segment,
      startIndex: index,
      endIndex: index + segment.length,
    })),
  );

  return {
    sentences: sentences.map((sentence) => ({
      ...sentence,
      words: Array.from(wordSegmenter.segment(sentence.text))
        .filter((word) => word.isWordLike)
        .map(({ segment, index }) => ({
          text: segment,
          startIndex: sentence.startIndex + index,
          endIndex: sentence.startIndex + index + segment.length,
        })),
    })),
  };
}
