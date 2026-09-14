import type { PdfTextLine } from '../../../shared/types/reader';

/** Deduplicate full lines shared by punctuation-split reading segments. */
export function buildParagraphCandidates(lines: readonly PdfTextLine[]): PdfTextLine[][] {
  const unique = new Map<string, PdfTextLine>();
  for (const line of lines) unique.set(`${line.pageNumber}:${line.id}`, line);
  const ordered = [...unique.values()].sort((a, b) =>
    a.pageNumber - b.pageNumber || a.lineY - b.lineY || a.x - b.x,
  );
  const candidates: PdfTextLine[][] = [];
  let current: PdfTextLine[] = [];
  for (const line of ordered) {
    if (!line.text.trim()) {
      current = [];
      continue;
    }
    const previous = current.at(-1);
    const lineHeight = previous
      ? Math.max(previous.height, line.height, previous.fontSize, line.fontSize, 1)
      : 1;
    if (!previous || line.pageNumber !== previous.pageNumber ||
      line.lineY - previous.lineY > lineHeight * 1.8 ||
      line.x - previous.x > lineHeight * 1.5) {
      current = [];
      candidates.push(current);
    }
    current.push(line);
  }
  return candidates;
}
