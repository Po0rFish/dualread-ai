# AI analyzer proxy contract

Status: frontend proxy provider available; no backend endpoint, real AI provider,
or API key is implemented. The async analyzer service defaults to the local mock.
Only explicit `provider: 'proxy'` calls POST to the internal endpoint. The Inspector
does not select proxy. Requests use same-origin mode and reject redirects.
The provider validates response shape and selectedText, and reports safe errors for
network failures, HTTP failures, and malformed responses without exposing server bodies.

## Future endpoint

`POST /api/analyze/word`, same origin, with `Content-Type: application/json`.
Future browser integration must use this internal endpoint, never a provider URL.
Despite the route name, the contract supports word, phrase, and sentence selections.

## Request: AiAnalyzerRequest

All fields are required. Text is copied verbatim from text-analysis, without trimming
or reconstructing sentences. Missing neighboring sentences are JSON `null`.

| Field | Type |
| --- | --- |
| sourceLanguage | `"de"` |
| targetLanguage | `"en"` |
| selectedText | string |
| selectedKind | `"word"`, `"phrase"`, or `"sentence"` |
| sentence | string |
| paragraph | string |
| previousSentence | string or null |
| nextSentence | string or null |
| pageNumber | positive integer, one-based |

`createAiAnalyzerProxyRequestBody` creates a fresh object containing only these
fields. It is not a runtime validator. A future server must validate incoming JSON.
Paragraph context belongs to this analyzer contract only; it is not sent to DeepL.
No full document, credentials, provider settings, or translation cache fields belong
in this request.

## Success: HTTP 200, AiAnalyzerResponse

JSON object with required fields:

```json
{
  "selectedText": "Mond",
  "baseMeaning": "moon",
  "meaningInContext": "the moon",
  "grammarNotes": ["der Mond is masculine", "den Mond is accusative"],
  "examples": ["Ich sehe den Mond. — I see the moon."],
  "warnings": []
}
```

This illustrates the sentence `„Hast du den Mond gesehen?“, fragte Lino.`
The first three fields are strings; the remaining fields are arrays of strings.
Use empty arrays for absent notes, examples, or warnings. `selectedText` must echo
the request. `isAiAnalyzerResponse` validates the shape, not linguistic correctness
or equality with the request. Guards tolerate additional fields.

## Errors: AiAnalyzerErrorResponse

Errors use JSON with a nested `error` containing a code and a human-readable message:

```json
{"error":{"code":"NOT_IMPLEMENTED","message":"AI analyzer proxy is not implemented."}}
```

| HTTP status | error.code |
| --- | --- |
| 400 | `INVALID_REQUEST` |
| 501 | `NOT_IMPLEMENTED` |
| 500 | `INTERNAL_ERROR` |

`isAiAnalyzerErrorResponse` checks this shape and the listed codes. Messages must
not expose credentials or provider internals. These statuses describe the future
endpoint; the currently absent route does not promise a JSON 501 response.
