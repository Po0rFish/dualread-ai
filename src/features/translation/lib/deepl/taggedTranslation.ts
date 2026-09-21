import { splitSourceChunks } from '../../../text-analysis';
import type { TranslationPart } from '../../types/translation';

const xmlEscapes = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
]);

const escapeXml = (text: string): string =>
  text.replaceAll(/[&<>]/g, (char) => xmlEscapes.get(char) ?? char);

export function createTaggedTranslation(sourceText: string) {
  const chunks = splitSourceChunks(sourceText);
  let cursor = 0;
  const tagged = chunks.map((source, index) => {
    const start = sourceText.indexOf(source, cursor);
    const gap = sourceText.slice(cursor, start);
    cursor = start + source.length;
    return `${escapeXml(gap)}<c${index + 1}>${escapeXml(source)}</c${index + 1}>`;
  }).join('');
  return {
    chunks,
    text: `<r>${tagged}${escapeXml(sourceText.slice(cursor))}</r>`,
    tags: ['r', ...chunks.map((_, index) => `c${index + 1}`)],
  };
}

// Text-only recovery for malformed XML; never infer phrase mappings here.
const recoverText = (xml: string): string => xml.replaceAll(/<[^>]*>/g, '')
  .replaceAll(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code: string) => {
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (code[0] !== '#') return named[code] ?? entity;
    const point = code[1].toLowerCase() === 'x'
      ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  }).trim();

export function parseTaggedTranslation(xml: string, chunks: readonly string[]): {
  translatedText: string;
  byParts?: readonly TranslationPart[];
} {
  const fallback = { translatedText: recoverText(xml) };
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) return fallback;
  const document = new DOMParser().parseFromString(`<response>${xml}</response>`, 'application/xml');
  if (document.getElementsByTagName('parsererror').length) return fallback;
  const wrapper = document.documentElement;
  const translatedText = wrapper.textContent?.trim() ?? fallback.translatedText;
  const unavailable = { translatedText };
  const root = wrapper.firstElementChild;
  if (!root || root.tagName !== 'r' || wrapper.children.length !== 1 ||
    root.attributes.length || !chunks.length) return unavailable;
  const hasUnmappedText = (element: Element) => Array.from(element.childNodes).some(
    (node) => node.nodeType !== 1 && (node.nodeType !== 3 || Boolean(node.textContent?.trim())),
  );
  if (hasUnmappedText(wrapper) || hasUnmappedText(root) || root.children.length !== chunks.length) return unavailable;
  const meanings = new Map<string, string>();
  for (const element of Array.from(root.children)) {
    const id = element.tagName;
    const index = Number(id.slice(1)) - 1;
    const meaning = element.textContent?.trim();
    if (id !== `c${index + 1}` || index < 0 || index >= chunks.length ||
      !Number.isInteger(index) || meanings.has(id) || element.attributes.length ||
      Array.from(element.childNodes).some((node) => node.nodeType !== 3) || !meaning) return unavailable;
    meanings.set(id, meaning);
  }
  return {
    translatedText,
    byParts: chunks.map((source, index) => ({ source, meaning: meanings.get(`c${index + 1}`)! })),
  };
}
