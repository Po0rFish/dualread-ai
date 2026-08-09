import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';

const DEEPL_PROXY_PATH = '/api/translate/deepl';
const DEEPL_AUTH_HEADER_PREFIX = 'DeepL-Auth-Key';

const DEEPL_FREE_TRANSLATE_URL =
  'https://api-free.deepl.com/v2/translate';
const DEEPL_PRO_TRANSLATE_URL =
  'https://api.deepl.com/v2/translate';
const DEEPL_FREE_USAGE_URL = 'https://api-free.deepl.com/v2/usage';
const DEEPL_PRO_USAGE_URL = 'https://api.deepl.com/v2/usage';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getRequestPath = (request: IncomingMessage): string => {
  return request.url?.split('?')[0] ?? '';
};

const isDeepLProxyRequest = (request: IncomingMessage): boolean => {
  return (
    request.method === 'POST' &&
    getRequestPath(request) === DEEPL_PROXY_PATH
  );
};

const getRequestHeader = (
  request: IncomingMessage,
  headerName: string,
): string | null => {
  const headerValue = request.headers[headerName.toLowerCase()];

  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? null;
  }

  if (typeof headerValue === 'string') {
    return headerValue;
  }

  return null;
};
const isDeepLAuthorizationHeader = (
  authorizationHeader: string,
): boolean => {
  return authorizationHeader
    .trim()
    .startsWith(`${DEEPL_AUTH_HEADER_PREFIX} `);
};
const getDeepLApiKeyFromAuthorizationHeader = (
  authorizationHeader: string,
): string => {
  return authorizationHeader
    .trim()
    .replace(`${DEEPL_AUTH_HEADER_PREFIX} `, '')
    .trim();
};

const getDeepLTranslateUrl = (apiKey: string): string => {
  if (apiKey.endsWith(':fx')) {
    return DEEPL_FREE_TRANSLATE_URL;
  }

  return DEEPL_PRO_TRANSLATE_URL;
};

const getDeepLUsageUrl = (apiKey: string): string => {
  if (apiKey.endsWith(':fx')) {
    return DEEPL_FREE_USAGE_URL;
  }

  return DEEPL_PRO_USAGE_URL;
};

type DeepLProxyOperation = 'translate' | 'usage' | 'invalid';

const getRequestOperation = (
  requestBody: string,
): DeepLProxyOperation => {
  try {
    const parsedBody: unknown = JSON.parse(requestBody);

    if (!isRecord(parsedBody)) {
      return 'invalid';
    }

    if (parsedBody.operation === 'usage') {
      return 'usage';
    }

    if (
      Array.isArray(parsedBody.text) &&
      parsedBody.text.every((item) => typeof item === 'string') &&
      typeof parsedBody.target_lang === 'string' &&
      typeof parsedBody.show_billed_characters === 'boolean'
    ) {
      return 'translate';
    }

    return 'invalid';
  } catch {
    return 'invalid';
  }
};

const readRequestBody = async (
  request: IncomingMessage,
): Promise<string> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    const bufferChunk = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(String(chunk));

    chunks.push(bufferChunk);
  }

  return Buffer.concat(chunks).toString('utf8');
};

const sendJson = (
  response: ServerResponse,
  statusCode: number,
  data: unknown,
): void => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(data));
};

const createDeepLDevProxyPlugin = (): Plugin => {
  return {
    name: 'dualread-deepl-dev-proxy',

    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!isDeepLProxyRequest(request)) {
          next();
          return;
        }

        const authorizationHeader = getRequestHeader(
          request,
          'authorization',
        );

        if (!authorizationHeader) {
          sendJson(response, 401, {
            error: 'DeepL API key is missing.',
          });
          return;
        }

        if (!isDeepLAuthorizationHeader(authorizationHeader)) {
          sendJson(response, 401, {
            error: 'DeepL authorization header is invalid.',
          });
          return;
        }

        try {
          const requestBody = await readRequestBody(request);
          const apiKey = getDeepLApiKeyFromAuthorizationHeader(
            authorizationHeader,
          );
          const requestOperation = getRequestOperation(requestBody);

          if (requestOperation === 'invalid') {
            sendJson(response, 400, {
              error: 'DeepL request body is invalid.',
              status: 400,
            });
            return;
          }

          const isUsageRequest = requestOperation === 'usage';

          const deeplResponse = await fetch(
            isUsageRequest
              ? getDeepLUsageUrl(apiKey)
              : getDeepLTranslateUrl(apiKey),
            {
              method: isUsageRequest ? 'GET' : 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authorizationHeader,
              },
              body: isUsageRequest ? undefined : requestBody,
            },
          );

          const responseBody = await deeplResponse.text();

          response.statusCode = deeplResponse.status;
          response.setHeader(
            'Content-Type',
            deeplResponse.headers.get('content-type') ??
            'application/json',
          );
          response.end(responseBody);
        } catch (error) {
          console.error('[DeepL dev proxy]', error);

          sendJson(response, 502, {
            error: 'DeepL proxy request failed.',
          });
        }
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), createDeepLDevProxyPlugin()],
});
