/** Public text-analysis API for other features. */
export { analyzeText } from './lib/analyzeText';
export { buildTextAnalysis } from './lib/build';
export { getWordContextByWordId, getWordContextByOffset } from './lib/ctx';
export type { TextWordContext } from './types';
export type { TextAnalysisPage, TextParagraph, TextSentence, TextWord } from './types';
// Shared continuation rules used when building the document text model.
export { isSentenceContinuation } from './lib/mergeEllipsisContinuations';
// Source chunk boundaries used by translation By parts.
export { splitSourceChunks } from './lib/splitSourceChunks';
export type { AnalyzedSentence, AnalyzedWord, TextAnalysis, TextSpan } from './types';
