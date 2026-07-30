import type {
  ClassifiedPdfTextSegment,
  PdfTextSegmentType,
} from '../../../../shared/types/reader';
import type {
  PdfDocumentTextModel,
  PdfDocumentTextPage,
  PdfSentence,
  PdfSentencePart,
} from '../../types/documentText';
import { buildSentences } from './buildSentences';

interface BuildTextModelPage {
  readonly pageNumber: number;
  readonly segments: ClassifiedPdfTextSegment[];
}

interface BuildTextModelParams {
  readonly documentId: string;
  readonly pages: BuildTextModelPage[];
}

const isReadableSegmentType = (type: PdfTextSegmentType): boolean => {
  return (
    type === 'title' ||
    type === 'subtitle' ||
    type === 'body' ||
    type === 'note'
  );
};

const sortPages = (
  pages: BuildTextModelPage[],
): BuildTextModelPage[] => {
  return [...pages].sort((firstPage, secondPage) => {
    return firstPage.pageNumber - secondPage.pageNumber;
  });
};

const sortSegments = (
  segments: ClassifiedPdfTextSegment[],
): ClassifiedPdfTextSegment[] => {
  return [...segments].sort((firstSegment, secondSegment) => {
    return firstSegment.lineY - secondSegment.lineY;
  });
};

const createSentenceParts = (
  pages: BuildTextModelPage[],
): PdfSentencePart[] => {
  return sortPages(pages).flatMap((page) => {
    return sortSegments(page.segments)
      .filter((segment) => {
        return isReadableSegmentType(segment.type);
      })
      .map((segment) => {
        return {
          pageNumber: page.pageNumber,
          segmentId: segment.id,
          text: segment.text,
        };
      });
  });
};

const groupSentencesByPage = (
  pages: BuildTextModelPage[],
  sentences: PdfSentence[],
): PdfDocumentTextPage[] => {
  return sortPages(pages).map((page) => {
    return {
      pageNumber: page.pageNumber,
      sentences: sentences.filter((sentence) => {
        return sentence.parts.some((part) => {
          return part.pageNumber === page.pageNumber;
        });
      }),
    };
  });
};

export const buildTextModel = async ({
  documentId,
  pages,
}: BuildTextModelParams): Promise<PdfDocumentTextModel> => {
  const sentenceParts = createSentenceParts(pages);
  const sentences = await buildSentences({
    documentId,
    parts: sentenceParts,
  });

  return {
    documentId,
    pages: groupSentencesByPage(pages, sentences),
    sentences,
    createdAt: new Date().toISOString(),
  };
};