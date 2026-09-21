import type { AiAnalyzerErrorResponse, AiAnalyzerRequest, AiAnalyzerResponse } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');

export function isAiAnalyzerResponse(value: unknown): value is AiAnalyzerResponse {
  return isRecord(value) &&
    typeof value.selectedText === 'string' &&
    typeof value.baseMeaning === 'string' &&
    typeof value.meaningInContext === 'string' &&
    isStringArray(value.grammarNotes) &&
    isStringArray(value.examples) &&
    isStringArray(value.warnings);
}

export function isAiAnalyzerErrorResponse(value: unknown): value is AiAnalyzerErrorResponse {
  if (!isRecord(value) || !isRecord(value.error)) return false;
  return typeof value.error.message === 'string' &&
    (value.error.code === 'INVALID_REQUEST' ||
      value.error.code === 'NOT_IMPLEMENTED' || value.error.code === 'INTERNAL_ERROR');
}

/** Copy only contract fields; does not validate input or send a request. */
export function createAiAnalyzerProxyRequestBody(request: AiAnalyzerRequest): AiAnalyzerRequest {
  return {
    sourceLanguage: request.sourceLanguage,
    targetLanguage: request.targetLanguage,
    selectedText: request.selectedText,
    selectedKind: request.selectedKind,
    sentence: request.sentence,
    paragraph: request.paragraph,
    previousSentence: request.previousSentence,
    nextSentence: request.nextSentence,
    pageNumber: request.pageNumber,
  };
}
