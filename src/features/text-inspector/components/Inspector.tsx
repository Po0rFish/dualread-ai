import { useMemo, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import { analyzeText } from '../../text-analysis';

interface TextInspectorProps {
  readonly pageNumber: number;
  readonly segments: ClassifiedPdfTextSegment[];
}

function InspectorContent({ pageNumber, segments }: TextInspectorProps) {
  const [selection, setSelection] = useState<{
    segment: ClassifiedPdfTextSegment;
    sentence: string;
    word: string;
    offset: number;
    endIndex: number;
  } | null>(null);
  const entries = useMemo(() => {
    if (typeof Intl.Segmenter !== 'function') return null;
    return segments.map((segment) => ({
      segment,
      sentences: analyzeText(segment.text, 'de').sentences,
    }));
  }, [segments]);
  const selected = selection && segments.includes(selection.segment)
    ? selection
    : null;
  const lines = segments.flatMap((segment) => segment.lines);

  return (
    <div style={{ maxHeight: 480, overflow: 'auto', overflowWrap: 'anywhere' }}>
      <p>Page {pageNumber} · {lines.length} lines · {segments.length} reading segments</p>
      <details>
        <summary>Page text (reading order)</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {segments.map((segment) => segment.text).join('\n\n')}
        </pre>
      </details>
      <details>
        <summary>Lines</summary>
        <ol>{lines.map((line) => <li key={line.id}>{line.text}</li>)}</ol>
      </details>
      <p>Selected word context</p>
      {selected ? (
        <dl>
          <dt>Word</dt><dd>{selected.word}</dd>
          <dt>Page / segment / UTF-16 range in segment</dt>
          <dd>{selected.segment.pageNumber} / {selected.segment.id} / [{selected.offset}, {selected.endIndex})</dd>
          <dt>Sentence</dt><dd>{selected.sentence}</dd>
          <dt>Reading segment / paragraph</dt><dd>{selected.segment.text}</dd>
        </dl>
      ) : <p>Select a word below to inspect its context.</p>}
      {!entries && <p>Intl.Segmenter is unavailable in this browser.</p>}
      {segments.length === 0 && <p>No extracted text available for this page.</p>}
      <p>Offsets: UTF-16 within each reading segment, end exclusive.</p>
      {entries?.map(({ segment, sentences }) => (
        <details key={segment.id}>
          <summary>Segment {segment.id} · {segment.type} · {sentences.length} sentences</summary>
          <p>{segment.text}</p>
          <ol>
            {sentences.map((sentence) => (
              <li key={sentence.startIndex}>
                <p>{sentence.text} <small>[{sentence.startIndex}, {sentence.endIndex})</small></p>
                <p>Words ({sentence.words.length})</p>
                {sentence.words.map((word) => {
                  const offset = word.startIndex;
                  return (
                    <button
                      key={word.startIndex}
                      type="button"
                      style={{ margin: 2 }}
                      aria-pressed={selected?.segment === segment && selected.offset === offset}
                      onClick={() => setSelection({
                        segment, sentence: sentence.text, word: word.text, offset,
                        endIndex: word.endIndex,
                      })}
                    >
                      {word.text} <small>[{word.startIndex}, {word.endIndex})</small>
                    </button>
                  );
                })}
              </li>
            ))}
          </ol>
        </details>
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
