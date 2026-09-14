export { analyzeText } from './lib/analyzeText';
export { buildTextAnalysis } from './lib/build';
export { getWordContextByWordId, getWordContextByOffset } from './lib/ctx';
export type { TextWordContext } from './types';
export type { TextAnalysisPage, TextParagraph, TextSentence, TextWord } from './types';
export { mergeEllipsisContinuations } from './lib/mergeEllipsisContinuations';
export type { AnalyzedSentence, AnalyzedWord, TextAnalysis, TextSpan } from './types';
