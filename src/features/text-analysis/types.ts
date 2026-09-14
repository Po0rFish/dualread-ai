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

/** UTF-16 offsets into reconstructed page text; endIndex is exclusive. */
interface TextEntity extends TextSpan {
  readonly id: string;
  readonly pageNumber: number;
}

export interface TextWord extends TextEntity {
  readonly paragraphId: string;
  readonly sentenceId: string;
}

export interface TextSentence extends TextEntity {
  readonly paragraphId: string;
  readonly words: readonly TextWord[];
}

/** A layout-based paragraph candidate, not a guaranteed semantic paragraph. */
export interface TextParagraph extends TextEntity {
  readonly lineIds: readonly string[];
  readonly sentences: readonly TextSentence[];
}

export interface TextAnalysisPage extends TextEntity {
  readonly paragraphs: readonly TextParagraph[];
}

export interface TextWordContext {
  readonly word: TextWord;
  readonly sentence: TextSentence;
  readonly paragraph: TextParagraph;
  readonly previousSentence: TextSentence | null;
  readonly nextSentence: TextSentence | null;
  readonly pageNumber: number;
  /** Zero-based index within the paragraph. */
  readonly sentenceIndex: number;
  /** Zero-based index within the sentence. */
  readonly wordIndex: number;
}
