export interface PdfSentencePart {
  readonly pageNumber: number;
  readonly segmentId: string;
  readonly text: string;
}

export interface PdfSentence {
  readonly id: string;
  readonly documentId: string;
  readonly text: string;
  readonly sourceTextHash: string;
  readonly parts: PdfSentencePart[];
}

export interface PdfDocumentTextPage {
  readonly pageNumber: number;
  readonly sentences: PdfSentence[];
}

export interface PdfDocumentTextModel {
  readonly documentId: string;
  readonly pages: PdfDocumentTextPage[];
  readonly sentences: PdfSentence[];
  readonly createdAt: string;
}