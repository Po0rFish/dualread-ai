import { analyzeText } from './analyzeText';

const PREPOSITIONS = new Set('am an auf aus bei beim durch für gegen im in mit nach ohne seit über um unter vom von vor zum zur zu zwischen'.split(' '));
const STARTERS = new Set('aber als dass denn doch ein eine einen einem einer der die das den dem dieser diese dieses und oder weil wenn namens'.split(' '));

/** Lightweight German phrase hints, not a grammatical parser. */
export function splitSourceChunks(text: string): string[] {
  return analyzeText(text, 'de').sentences.flatMap((sentence) => {
    const chunks: string[] = [];
    let start = sentence.startIndex;
    sentence.words.forEach((word, index, words) => {
      const previous = words[index - 1];
      if (!previous) return;
      const currentText = word.text.toLocaleLowerCase('de');
      const previousText = previous.text.toLocaleLowerCase('de');
      const gap = text.slice(previous.endIndex, word.startIndex);
      const boundary = /[,;:]/u.test(gap) || PREPOSITIONS.has(currentText) ||
        (STARTERS.has(currentText) && !PREPOSITIONS.has(previousText) && !STARTERS.has(previousText)) ||
        (/^\p{Lu}/u.test(previous.text) && /^\p{Ll}/u.test(word.text) &&
          !PREPOSITIONS.has(previousText) && !STARTERS.has(previousText) &&
          !/^(eines|einer|des|dessen|deren)$/u.test(currentText));
      if (boundary) {
        chunks.push(text.slice(start, word.startIndex).trim());
        start = word.startIndex;
      }
    });
    chunks.push(text.slice(start, sentence.endIndex).trim());
    return chunks.filter(Boolean);
  });
}
