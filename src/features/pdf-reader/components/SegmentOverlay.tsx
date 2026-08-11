import type { CSSProperties } from 'react';
import type {
  ClassifiedPdfTextSegment,
  PdfTextRect,
  PdfTextWord,
} from '../../../shared/types/reader';
import './SegmentOverlay.scss';

interface SegmentOverlayProps {
  readonly segments: ClassifiedPdfTextSegment[];
  readonly selectedSegmentId: string | null;
  readonly selectedText: string | null;
  readonly renderScale: number;
  readonly onSelectSegment: (segment: ClassifiedPdfTextSegment) => void;
}

const getRectStyle = (
  rect: PdfTextRect,
  renderScale: number,
): CSSProperties => {
  return {
    left: rect.x * renderScale,
    top: rect.lineY * renderScale,
    width: rect.width * renderScale,
    height: rect.height * renderScale,
  };
};

const WORD_REGEXP = /\S+/g;

const normalizeWord = (word: string): string => {
  return word
    .toLocaleLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
};

const getSelectedWordIndexes = (
  wordRects: PdfTextWord[],
  selectedText: string | null,
): Set<number> => {
  if (!selectedText) {
    return new Set();
  }

  const segmentWords = wordRects.map((wordRect) => {
    return normalizeWord(wordRect.text);
  });
  const selectedWords = selectedText
    .match(WORD_REGEXP)
    ?.map(normalizeWord)
    .filter(Boolean) ?? [];

  if (selectedWords.length === 0) {
    return new Set();
  }

  for (
    let startIndex = 0;
    startIndex <= segmentWords.length - selectedWords.length;
    startIndex += 1
  ) {
    const isMatch = selectedWords.every((word, selectedWordIndex) => {
      return segmentWords[startIndex + selectedWordIndex] === word;
    });

    if (isMatch) {
      return new Set(
        selectedWords.map((_, selectedWordIndex) => {
          return startIndex + selectedWordIndex;
        }),
      );
    }
  }

  return new Set();
};

const getRectClassName = (
  segment: ClassifiedPdfTextSegment,
  isSelected: boolean,
): string => {
  const classNames = [
    'segment-overlay__rect',
    `segment-overlay__rect--${segment.type}`,
  ];

  if (isSelected) {
    classNames.push('segment-overlay__rect--selected');
  }

  return classNames.join(' ');
};

export default function SegmentOverlay({
  segments,
  selectedSegmentId,
  selectedText,
  renderScale,
  onSelectSegment,
}: SegmentOverlayProps) {
  return (
    <div className="segment-overlay">
      {segments.map((segment) => {
        const isSelectedSegment = selectedSegmentId === segment.id;
        const wordRects = segment.words;
        const selectedWordIndexes = isSelectedSegment
          ? getSelectedWordIndexes(wordRects, selectedText)
          : new Set<number>();

        return wordRects.map((wordRect, wordIndex) => {
          const isSelected = selectedWordIndexes.has(wordIndex);

          return (
            <button
              key={`${segment.id}-word-${wordIndex + 1}`}
              type="button"
              className={getRectClassName(segment, isSelected)}
              title={wordRect.text}
              aria-label={`Select sentence containing ${wordRect.text}`}
              onClick={() => {
                onSelectSegment(segment);
              }}
              style={getRectStyle(wordRect, renderScale)}
            />
          );
        });
      })}
    </div>
  );
}
