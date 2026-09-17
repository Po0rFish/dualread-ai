/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PdfTextLine } from '../../../shared/types/reader';
import { buildTextAnalysis, getWordContextByOffset, getWordContextByWordId } from '../index';

function line(id: string, text: string, lineY = 0, pageNumber = 2): PdfTextLine {
  return { id, text, pageNumber, lineY, x: 0, width: 400, height: 10, fontSize: 10, tokens: [] };
}

test('resolves Mond with its sentence, paragraph, page and neighboring sentences', () => {
  const before = 'Lino wartete.';
  const speech = '„Hast du den Mond gesehen?“, fragte Lino.';
  const after = 'Der Igel schüttelte den Kopf.';
  const model = buildTextAnalysis([line('speech', `${before} ${speech} ${after}`)]);
  const page = model[0];
  const paragraph = page.paragraphs[0];
  const sentence = paragraph.sentences[1];
  const word = sentence.words.find((entry) => entry.text === 'Mond');
  assert.ok(word);
  const context = getWordContextByWordId(model, word.id);
  assert.ok(context);
  assert.equal(context.word.text, 'Mond');
  assert.equal(context.sentence.text.trim(), speech);
  assert.equal(context.sentence, sentence);
  assert.equal(context.paragraph, paragraph);
  assert.equal(context.pageNumber, 2);
  assert.equal(context.previousSentence?.text.trim(), before);
  assert.equal(context.nextSentence?.text.trim(), after);
  assert.equal(context.sentenceIndex, 1);
  assert.equal(context.wordIndex, 3);
  assert.equal(page.text.slice(word.startIndex, word.endIndex), 'Mond');
  assert.deepEqual(getWordContextByOffset(model, 2, word.startIndex), context);
  assert.deepEqual(getWordContextByOffset(model, 2, word.endIndex - 1), context);
  assert.equal(getWordContextByOffset(model, 2, word.endIndex), null);
  const first = paragraph.sentences[0].words[0];
  const last = paragraph.sentences[2].words[0];
  assert.equal(getWordContextByWordId(model, first.id)?.previousSentence, null);
  assert.equal(getWordContextByWordId(model, last.id)?.nextSentence, null);
});

test('joins adjacent lines, deduplicates shared lines and separates paragraphs and pages', () => {
  const first = line('first', 'Lino sah');
  const second = line('second', 'den Mond.', 12);
  const third = line('third', 'Der Igel wartete.', 60);
  const model = buildTextAnalysis([third, second, first, first, line('other', 'Neue Seite.', 0, 3)]);
  assert.equal(model.length, 2);
  assert.equal(model[0].text, 'Lino sah den Mond.\n\nDer Igel wartete.');
  assert.deepEqual(model[0].paragraphs.map((paragraph) => paragraph.text), [
    'Lino sah den Mond.', 'Der Igel wartete.',
  ]);
  assert.equal(model[1].pageNumber, 3);
  assert.equal(model[1].text, 'Neue Seite.');
  for (const page of model) for (const paragraph of page.paragraphs) {
    assert.equal(page.text.slice(paragraph.startIndex, paragraph.endIndex), paragraph.text);
    const context = getWordContextByWordId(model, paragraph.sentences[0].words[0].id);
    assert.ok(context);
    assert.equal(context.previousSentence, null);
    assert.equal(context.nextSentence, null);
    for (const sentence of paragraph.sentences) for (const word of sentence.words) {
      assert.equal(page.text.slice(word.startIndex, word.endIndex), word.text);
    }
  }
});

test('uses UTF-16 offsets and returns null for missing or invalid lookups', () => {
  const model = buildTextAnalysis([line('unicode', '🌙 Mond.')]);
  assert.equal(getWordContextByOffset(model, 2, 3)?.word.text, 'Mond');
  for (const offset of [-1, 0, 2, 7, 99, 3.5, NaN]) {
    assert.equal(getWordContextByOffset(model, 2, offset), null);
  }
  assert.equal(getWordContextByOffset(model, 99, 3), null);
  assert.equal(getWordContextByWordId(model, 'missing'), null);
  assert.equal(getWordContextByWordId([], 'missing'), null);
  assert.deepEqual(buildTextAnalysis([]), []);
});
