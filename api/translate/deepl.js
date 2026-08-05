const DEEPL_AUTH_HEADER_PREFIX = 'DeepL-Auth-Key';

const DEEPL_FREE_TRANSLATE_URL =
  'https://api-free.deepl.com/v2/translate';
const DEEPL_PRO_TRANSLATE_URL =
  'https://api.deepl.com/v2/translate';

const isRecord = (value) => {
  return typeof value === 'object' && value !== null;
};

const getRequestHeader = (request, headerName) => {
  const headerValue = request.headers[headerName.toLowerCase()];

  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? null;
  }

  if (typeof headerValue === 'string') {
    return headerValue;
  }

  return null;
};

const isDeepLAuthorizationHeader = (authorizationHeader) => {
  return authorizationHeader
    .trim()
    .startsWith(`${DEEPL_AUTH_HEADER_PREFIX} `);
};

const getDeepLApiKeyFromAuthorizationHeader = (
  authorizationHeader,
) => {
  return authorizationHeader
    .trim()
    .slice(DEEPL_AUTH_HEADER_PREFIX.length)
    .trim();
};

const getDeepLTranslateUrl = (apiKey) => {
  if (apiKey.endsWith(':fx')) {
    return DEEPL_FREE_TRANSLATE_URL;
  }

  return DEEPL_PRO_TRANSLATE_URL;
};

const parseRequestBody = (body) => {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const isDeepLProxyTranslateRequestBody = (value) => {
  if (!isRecord(value)) {
    return false;
  }

  if (!Array.isArray(value.text)) {
    return false;
  }

  if (
    !value.text.every((textItem) => {
      return typeof textItem === 'string';
    })
  ) {
    return false;
  }

  if (typeof value.target_lang !== 'string') {
    return false;
  }

  if (typeof value.show_billed_characters !== 'boolean') {
    return false;
  }

  return true;
};

const getDeepLProxyRequestBody = (request) => {
  const requestBody = parseRequestBody(request.body);

  if (!isDeepLProxyTranslateRequestBody(requestBody)) {
    return null;
  }

  return requestBody;
};

const sendJson = (response, statusCode, data) => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(data));
};

const sendMethodNotAllowed = (response) => {
  response.setHeader('Allow', 'POST');

  sendJson(response, 405, {
    error: 'Method not allowed.',
    status: 405,
  });
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    sendMethodNotAllowed(response);
    return;
  }

  const authorizationHeader = getRequestHeader(request, 'authorization');

  if (!authorizationHeader) {
    sendJson(response, 401, {
      error: 'DeepL API key is missing.',
      status: 401,
    });
    return;
  }

  if (!isDeepLAuthorizationHeader(authorizationHeader)) {
    sendJson(response, 401, {
      error: 'DeepL authorization header is invalid.',
      status: 401,
    });
    return;
  }

  const requestBody = getDeepLProxyRequestBody(request);

  if (!requestBody) {
    sendJson(response, 400, {
      error: 'DeepL request body is invalid.',
      status: 400,
    });
    return;
  }

  try {
    const apiKey = getDeepLApiKeyFromAuthorizationHeader(
      authorizationHeader,
    );

    const deeplResponse = await fetch(getDeepLTranslateUrl(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorizationHeader,
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await deeplResponse.text();

    if (!deeplResponse.ok) {
      sendJson(response, deeplResponse.status, {
        error: 'DeepL request failed.',
        status: deeplResponse.status,
        details: responseBody,
      });
      return;
    }

    response.statusCode = deeplResponse.status;
    response.setHeader(
      'Content-Type',
      deeplResponse.headers.get('content-type') ??
      'application/json',
    );
    response.end(responseBody);
  } catch (error) {
    console.error('[Vercel DeepL proxy]', error);

    sendJson(response, 502, {
      error: 'DeepL proxy request failed.',
      status: 502,
    });
  }
}