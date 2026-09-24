export type AiAnalyzerProvider = 'mock' | 'proxy';

export interface AiAnalyzerErrorResponse {
  readonly error: string;
  readonly status: 400 | 405 | 500 | 501;
}

export interface AiAnalyzerProviderAnalyzeParams {
  readonly request: AiAnalyzerRequest;
  readonly provider?: AiAnalyzerProvider;
}

/** Context for a future German-learning analyzer; no provider-specific fields. */
export interface AiAnalyzerRequest {
  readonly sourceLanguage: 'de';
  readonly targetLanguage: 'en';
  readonly selectedText: string;
  readonly selectedKind: 'word' | 'phrase' | 'sentence';
  readonly sentence: string;
  readonly paragraph: string;
  readonly previousSentence: string | null;
  readonly nextSentence: string | null;
  readonly pageNumber: number;
}

/** Use empty arrays when there are no notes, examples, or warnings. */
export interface AiAnalyzerResponse {
  readonly selectedText: string;
  readonly baseMeaning: string;
  readonly meaningInContext: string;
  readonly grammarNotes: readonly string[];
  readonly examples: readonly string[];
  readonly warnings: readonly string[];
}
