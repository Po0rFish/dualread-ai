/** UTF-16 offsets into the original input; endIndex is exclusive. */
export interface TextSpan {
  readonly text: string;
  readonly startIndex: number;
  readonly endIndex: number;
}

export type AnalyzedWord = TextSpan;

export interface AnalyzedSentence extends TextSpan {
  readonly words: readonly AnalyzedWord[];
}

export interface TextAnalysis {
  readonly sentences: readonly AnalyzedSentence[];
}
