export interface PdfTextToken {
  readonly text: string;
  readonly pageNumber: number;
  readonly orderIndex: number;

  readonly x: number;
  readonly lineY: number;
  readonly width: number;
  readonly height: number;

  readonly fontSize: number;
  readonly fontFamily?: string;
  readonly hasEOL: boolean;
}

export interface PdfTextLine {
  readonly id: string;
  readonly pageNumber: number;
  readonly text: string;
  readonly tokens: PdfTextToken[];

  readonly x: number;
  readonly lineY: number;
  readonly width: number;
  readonly height: number;

  readonly fontSize: number;
}

export interface PdfTextRect {
  readonly x: number;
  readonly lineY: number;
  readonly width: number;
  readonly height: number;
}

export interface PdfTextWord extends PdfTextRect {
  readonly text: string;
}

export interface PdfReadingSegment {
  readonly id: string;
  readonly pageNumber: number;
  readonly text: string;

  readonly lines: PdfTextLine[];
  readonly tokens: PdfTextToken[];
  readonly rects: PdfTextRect[];
  readonly words: PdfTextWord[];

  readonly x: number;
  readonly lineY: number;
  readonly width: number;
  readonly height: number;

  readonly charactersCount: number;
}

export type PdfTextSegmentType =
  | 'title'
  | 'subtitle'
  | 'body'
  | 'note'
  | 'pageNumber'
  | 'unknown';

export interface ClassifiedPdfTextSegment extends PdfReadingSegment {
  readonly type: PdfTextSegmentType;
}
