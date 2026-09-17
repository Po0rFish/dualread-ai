import { useMemo, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import { buildTextAnalysis, getWordContextByWordId, type TextWord, type TextWordContext } from '../../text-analysis';

interface TextInspectorProps {
  readonly pageNumber: number;
  readonly segments: ClassifiedPdfTextSegment[];
}

interface InspectorWordProps {
  readonly word: TextWord;
  readonly selected: boolean;
  readonly onSelect: (wordId: string) => void;
}

function InspectorWord({ word, selected, onSelect }: InspectorWordProps) {
  return (
    <button
      type="button"
      style={{ margin: 2 }}
      aria-pressed={selected}
      onClick={() => onSelect(word.id)}
    >
      {word.text} <small>[{word.startIndex}, {word.endIndex})</small>
    </button>
  );
}

function InspectorContent({ pageNumber, segments }: TextInspectorProps) {
  const [selection, setSelection] = useState<TextWordContext | null>(null);
  const entries = useMemo(() => {
    if (typeof Intl.Segmenter !== 'function') return null;
    return buildTextAnalysis(segments.flatMap((segment) => segment.lines));
  }, [segments]);
  const handleSelectWord = (wordId: string): void => {
    setSelection(entries ? getWordContextByWordId(entries, wordId) : null);
  };
  const selected = selection && entries?.some((page) =>
    page.paragraphs.includes(selection.paragraph),
  ) ? selection : null;
  const lines = [...new Map(segments.flatMap((segment) => segment.lines)
    .map((line) => [`${line.pageNumber}:${line.id}`, line])).values()];

  return (
    <div style={{ maxHeight: 480, overflow: 'auto', overflowWrap: 'anywhere' }}>
      <p>Page {pageNumber} · {lines.length} lines · {segments.length} reading segments</p>
      <details>
        <summary>Page text (reading order)</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {entries?.map((page) => page.text).join('\n\n')}
        </pre>
      </details>
      <details>
        <summary>Lines</summary>
        <ol>{lines.map((line) => <li key={line.id}>{line.text}</li>)}</ol>
      </details>
      <p>Selected word context</p>
      {selected ? (
        <dl>
          <dt>Word</dt><dd>{selected.word.text}</dd>
          <dt>Page / paragraph / UTF-16 range in page</dt>
          <dd>{selected.pageNumber} / {selected.paragraph.id} / [{selected.word.startIndex}, {selected.word.endIndex})</dd>
          <dt>Sentence</dt><dd>{selected.sentence.text}</dd>
          <dt>Paragraph candidate</dt><dd>{selected.paragraph.text}</dd>
          <dt>Previous sentence</dt><dd>{selected.previousSentence?.text ?? 'None'}</dd>
          <dt>Next sentence</dt><dd>{selected.nextSentence?.text ?? 'None'}</dd>
        </dl>
      ) : <p>Select a word below to inspect its context.</p>}
      {!entries && <p>Intl.Segmenter is unavailable in this browser.</p>}
      {segments.length === 0 && <p>No extracted text available for this page.</p>}
      <p>Paragraphs are layout-based candidates. Offsets: UTF-16 within reconstructed page text, end exclusive.</p>
      {entries?.map((page) => (<details key={page.id} open>
        <summary>Page {page.pageNumber} · {page.paragraphs.length} paragraphs</summary>
        {page.paragraphs.map((paragraph) => (
        <details key={paragraph.id}>
          <summary>Paragraph {paragraph.id} · {paragraph.sentences.length} sentences</summary>
          <p>{paragraph.text}</p>
          <ol>
            {paragraph.sentences.map((sentence) => (
              <li key={sentence.id}>
                <p>{sentence.text} <small>[{sentence.startIndex}, {sentence.endIndex})</small></p>
                <p>Words ({sentence.words.length})</p>
                {sentence.words.map((word) => (
                  <InspectorWord
                    key={word.id}
                    word={word}
                    selected={selected?.word === word}
                    onSelect={handleSelectWord}
                  />
                ))}
              </li>
            ))}
          </ol>
        </details>
        ))}</details>
      ))}
    </div>
  );
}

export default function TextInspector(props: TextInspectorProps) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Text Inspector · Intl.Segmenter (de)</summary>
      {open && <InspectorContent {...props} />}
    </details>
  );
}
