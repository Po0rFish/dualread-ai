import { useMemo, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';

interface TextInspectorProps {
  readonly pageNumber: number;
  readonly segments: ClassifiedPdfTextSegment[];
}

function mergeEllipsisContinuations(sentences: Intl.Segments) {
  const merged: { segment: string; index: number }[] = [];
  for (const sentence of sentences) {
    const previous = merged.at(-1);
    if (
      previous && /(?:\.{3}|\u2026)\s*$/u.test(previous.segment) &&
      /^[\s"'\u00ab\u00bb\u2018-\u201f\u2039\u203a]*\p{Ll}/u.test(sentence.segment)
    ) {
      previous.segment += sentence.segment;
    } else {
      merged.push({ segment: sentence.segment, index: sentence.index });
    }
  }
  return merged;
}

function InspectorContent({ pageNumber, segments }: TextInspectorProps) {
  const [selection, setSelection] = useState<{
    segment: ClassifiedPdfTextSegment;
    sentence: string;
    word: string;
    offset: number;
  } | null>(null);
  const entries = useMemo(() => {
    if (typeof Intl.Segmenter !== 'function') return null;
    const sentences = new Intl.Segmenter('de', { granularity: 'sentence' });
    const words = new Intl.Segmenter('de', { granularity: 'word' });
    return segments.map((segment) => ({
      segment,
      sentences: mergeEllipsisContinuations(sentences.segment(segment.text)).map((sentence) => ({
        text: sentence.segment,
        index: sentence.index,
        words: Array.from(words.segment(sentence.segment)).filter(
          (word) => word.isWordLike,
        ),
      })),
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
          <dt>Page / segment / UTF-16 offset in segment</dt>
          <dd>{selected.segment.pageNumber} / {selected.segment.id} / {selected.offset}</dd>
          <dt>Sentence</dt><dd>{selected.sentence}</dd>
          <dt>Reading segment / paragraph</dt><dd>{selected.segment.text}</dd>
        </dl>
      ) : <p>Select a word below to inspect its context.</p>}
      {!entries && <p>Intl.Segmenter is unavailable in this browser.</p>}
      {segments.length === 0 && <p>No extracted text available for this page.</p>}
      {entries?.map(({ segment, sentences }) => (
        <details key={segment.id}>
          <summary>Segment {segment.id} · {segment.type} · {sentences.length} sentences</summary>
          <p>{segment.text}</p>
          <ol>
            {sentences.map((sentence) => (
              <li key={sentence.index}>
                <p>{sentence.text}</p>
                <p>Words ({sentence.words.length})</p>
                {sentence.words.map((word) => {
                  const offset = sentence.index + word.index;
                  return (
                    <button
                      key={word.index}
                      type="button"
                      style={{ margin: 2 }}
                      aria-pressed={selected?.segment === segment && selected.offset === offset}
                      onClick={() => setSelection({
                        segment, sentence: sentence.text, word: word.segment, offset,
                      })}
                    >
                      {word.segment}
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
