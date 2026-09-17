/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeText } from '../index';

const cases = [
  {
    name: 'splits normal sentences',
    sentences: [
      'Am Rand eines großen Waldes lebte ein kleiner Fuchs namens Lino.',
      'Jeden Abend sah er den Mond.',
    ],
  },
  {
    name: 'keeps the German direct speech reporting clause',
    sentences: ['„Hast du den Mond gesehen?“, fragte Lino.', 'Der Igel schüttelte den Kopf.'],
  },
  {
    name: 'does not merge a separate sentence after a quotation',
    sentences: [
      '„Manchmal sehen wir etwas nicht, obwohl es trotzdem da ist.“',
      'Lino verstand diese Antwort nicht ganz.',
    ],
  },
  {
    name: 'keeps lowercase ellipsis continuation',
    sentences: ['Ich wollte gehen ... aber es war zu spät.', 'Dann blieb ich.'],
  },
  {
    name: 'does not merge an uppercase sentence after ellipsis',
    sentences: ['Er schwieg ...', 'Dann ging er weg.'],
  },
];

for (const { name, sentences } of cases) {
  test(name, () => {
    const text = sentences.join(' ');
    const result = analyzeText(text);
    // Intl.Segmenter retains separating whitespace in its source spans.
    assert.deepEqual(result.sentences.map((sentence) => sentence.text.trim()), sentences);
    for (const sentence of result.sentences) {
      assert.equal(text.slice(sentence.startIndex, sentence.endIndex), sentence.text);
    }
  });
}

test('extracts words without whitespace or punctuation', () => {
  const text = '„Hast du den Mond gesehen?“, fragte Lino.';
  const words = analyzeText(text).sentences.flatMap((sentence) => sentence.words);
  assert.deepEqual(words.map((word) => word.text), [
    'Hast', 'du', 'den', 'Mond', 'gesehen', 'fragte', 'Lino',
  ]);
  for (const word of words) {
    assert.equal(text.slice(word.startIndex, word.endIndex), word.text);
  }
});
