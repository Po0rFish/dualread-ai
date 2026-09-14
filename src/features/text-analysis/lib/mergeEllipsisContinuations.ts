import type { TextSpan } from '../types';

export function isSentenceContinuation(previous: string, next: string): boolean {
  return (
    /(?:\.{3}|\u2026)\s*$/u.test(previous) &&
    /^[\s"'\u00ab\u00bb\u2018-\u201f\u2039\u203a]*\p{Ll}/u.test(next)
  ) || (
    /[?!.][\u201c"\u00bb]\s*,?\s*$/u.test(previous) &&
    /^\s*,?\s*(?:fragte|sagte|antwortete|rief|flüsterte|meinte|erwiderte)(?!\p{L})/u.test(next)
  );
}

export function mergeEllipsisContinuations(
  sentences: readonly TextSpan[],
): TextSpan[] {
  const merged: TextSpan[] = [];
  for (const sentence of sentences) {
    const previous = merged.at(-1);
    if (
      previous && isSentenceContinuation(previous.text, sentence.text)
    ) {
      merged[merged.length - 1] = {
        text: previous.text + sentence.text,
        startIndex: previous.startIndex,
        endIndex: sentence.endIndex,
      };
    } else {
      merged.push(sentence);
    }
  }
  return merged;
}
