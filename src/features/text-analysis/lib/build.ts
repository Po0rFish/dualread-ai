import type { PdfTextLine } from '../../../shared/types/reader';
import type { TextAnalysisPage, TextParagraph } from '../types';
import { analyzeText } from './analyzeText';
import { buildParagraphCandidates } from './para';

/** Reconstruct page text with spaces between lines and blank lines between candidates.
 * PDF lines have no source character offsets; all model offsets index this text.
 */
export function buildTextAnalysis(lines: readonly PdfTextLine[]): TextAnalysisPage[] {
  const pages = new Map<number, { text: string; paragraphs: TextParagraph[] }>();
  for (const candidate of buildParagraphCandidates(lines)) {
    const pageNumber = candidate[0].pageNumber;
    const page = pages.get(pageNumber) ?? { text: '', paragraphs: [] };
    const text = candidate.map((line) => line.text).join(' ');
    const startIndex = page.text.length + (page.paragraphs.length ? 2 : 0);
    const id = `page-${pageNumber}-paragraph-${page.paragraphs.length + 1}`;
    const sentences = analyzeText(text, 'de').sentences.map((sentence, index) => {
      const sentenceId = `${id}-sentence-${index + 1}`;
      return {
        id: sentenceId,
        paragraphId: id,
        pageNumber,
        text: sentence.text,
        startIndex: startIndex + sentence.startIndex,
        endIndex: startIndex + sentence.endIndex,
        words: sentence.words.map((word, wordIndex) => ({
          ...word,
          id: `${sentenceId}-word-${wordIndex + 1}`,
          paragraphId: id,
          sentenceId,
          pageNumber,
          startIndex: startIndex + word.startIndex,
          endIndex: startIndex + word.endIndex,
        })),
      };
    });
    page.text += (page.paragraphs.length ? '\n\n' : '') + text;
    page.paragraphs.push({
      id, text, pageNumber, startIndex, endIndex: startIndex + text.length,
      lineIds: candidate.map((line) => line.id),
      sentences,
    });
    pages.set(pageNumber, page);
  }
  return [...pages].map(([pageNumber, page]) => ({
    ...page,
    id: `page-${pageNumber}`,
    pageNumber,
    startIndex: 0,
    endIndex: page.text.length,
  }));
}
