import type { ClassifiedPdfTextSegment, PdfTextWord } from '../../../shared/types/reader';
import type { TextAnalysisPage, TextSentence } from '../../text-analysis';
import { splitTokenIntoParts } from './reading-segments/segmentTokenParts';

export interface PdfTextSelection {
  readonly segment: ClassifiedPdfTextSegment;
  readonly sentence: TextSentence | null;
}

/** Map the actual overlay word to reconstructed text; ambiguous matches fail closed. */
export function resolveAnalysisSentence(
  pages: readonly TextAnalysisPage[],
  segments: readonly ClassifiedPdfTextSegment[],
  segment: ClassifiedPdfTextSegment,
  word: PdfTextWord,
): TextSentence | null {
  const page = pages.find((entry) => entry.pageNumber === segment.pageNumber);
  if (!page) return null;
  const lines = new Map(segments.flatMap((entry) => entry.lines)
    .filter((line) => line.pageNumber === segment.pageNumber)
    .map((line) => [line.id, line]));
  const matches: TextSentence[] = [];
  for (const paragraph of page.paragraphs) {
    let offset = paragraph.startIndex;
    for (const lineId of paragraph.lineIds) {
      const line = lines.get(lineId);
      if (!line) return null;
      const parts = line.tokens.flatMap((token) => splitTokenIntoParts(token, line));
      if (parts.map((part) => part.text).join(' ') !== line.text) return null;
      for (const part of parts) {
        if (segment.lines.includes(line) && part.text === word.text &&
          part.x === word.x && part.lineY === word.lineY &&
          part.width === word.width && part.height === word.height) {
          const candidates = paragraph.sentences.filter((sentence) =>
            sentence.startIndex < offset + part.text.length && sentence.endIndex > offset);
          if (candidates.length !== 1) return null;
          matches.push(candidates[0]);
        }
        offset += part.text.length + 1;
      }
    }
  }
  return matches.length === 1 && matches[0].text.trim() ? matches[0] : null;
}
