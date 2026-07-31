import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';

export interface TranslationSourceSegment
  extends ClassifiedPdfTextSegment {
  readonly documentId?: string;
  readonly sourceTextHash?: string;
}