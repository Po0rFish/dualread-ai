import type { TextAnalysisPage, TextWord, TextWordContext } from '../types';

function findWordContext(
  model: readonly TextAnalysisPage[],
  matches: (word: TextWord) => boolean,
): TextWordContext | null {
  for (const page of model) {
    for (const paragraph of page.paragraphs) {
      for (const [sentenceIndex, sentence] of paragraph.sentences.entries()) {
        const wordIndex = sentence.words.findIndex(matches);
        if (wordIndex < 0) continue;
        return {
          word: sentence.words[wordIndex],
          sentence,
          paragraph,
          previousSentence: paragraph.sentences[sentenceIndex - 1] ?? null,
          nextSentence: paragraph.sentences[sentenceIndex + 1] ?? null,
          pageNumber: page.pageNumber,
          sentenceIndex,
          wordIndex,
        };
      }
    }
  }
  return null;
}

export function getWordContextByWordId(
  model: readonly TextAnalysisPage[],
  wordId: string,
): TextWordContext | null {
  return findWordContext(model, (word) => word.id === wordId);
}

/** Offset is a UTF-16 index into reconstructed page text, end exclusive. */
export function getWordContextByOffset(
  model: readonly TextAnalysisPage[],
  pageNumber: number,
  offset: number,
): TextWordContext | null {
  if (!Number.isInteger(offset) || offset < 0) return null;
  return findWordContext(
    model.filter((page) => page.pageNumber === pageNumber),
    (word) => word.startIndex <= offset && offset < word.endIndex,
  );
}
