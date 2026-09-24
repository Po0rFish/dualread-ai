import { Buffer } from 'node:buffer';

const MAX_BODY_BYTES = 64 * 1024;

const isValidRequest = (body) => {
  return typeof body === 'object' && body !== null && !Array.isArray(body) &&
    body.sourceLanguage === 'de' && body.targetLanguage === 'en' &&
    ['word', 'phrase', 'sentence'].includes(body.selectedKind) &&
    ['selectedText', 'sentence', 'paragraph'].every((key) => typeof body[key] === 'string') &&
    ['previousSentence', 'nextSentence'].every((key) => body[key] === null || typeof body[key] === 'string') &&
    Number.isSafeInteger(body.pageNumber) && body.pageNumber > 0;
};

const sendError = (response, status, error) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify({ error, status }));
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendError(response, 405, 'Only POST is supported.');
    return;
  }

  let body;
  try {
    body = request.body;
    if (body === undefined) {
      const chunks = [];
      let size = 0;
      for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > MAX_BODY_BYTES) throw new Error('Body too large');
        chunks.push(buffer);
      }
      body = Buffer.concat(chunks).toString('utf8');
    }
    if (Buffer.isBuffer(body)) body = body.toString('utf8');
    if (typeof body === 'string') {
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw new Error('Body too large');
      body = JSON.parse(body);
    } else if (Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
      throw new Error('Body too large');
    }
  } catch {
    sendError(response, 400, 'AI analyzer request body is invalid.');
    return;
  }

  if (!isValidRequest(body)) {
    sendError(response, 400, 'AI analyzer request body is invalid.');
    return;
  }
  sendError(response, 501, 'AI analyzer proxy is not implemented yet.');
}
