import type { TextWordContext } from '../../text-analysis';
import type { AiAnalyzerRequest } from '../types';

/** Copy the analyzed context verbatim without mutating it or sending a request. */
export function createAiAnalyzerRequestFromWordContext(
  context: TextWordContext,
): AiAnalyzerRequest {
  return {
    sourceLanguage: 'de',
    targetLanguage: 'en',
    selectedText: context.word.text,
    selectedKind: 'word',
    sentence: context.sentence.text,
    paragraph: context.paragraph.text,
    previousSentence: context.previousSentence?.text ?? null,
    nextSentence: context.nextSentence?.text ?? null,
    pageNumber: context.pageNumber,
  };
}
