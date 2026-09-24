# AI analyzer proxy contract

Status: frontend proxy provider and backend validation stub available. No real AI
provider or API key is implemented. The async analyzer service defaults to the local mock.
Only explicit `provider: 'proxy'` calls POST to the internal endpoint. The Inspector
does not select proxy. Requests use same-origin mode and reject redirects.
The provider validates response shape and selectedText, and reports safe errors for
network failures, HTTP failures, and malformed responses without exposing server bodies.

## Endpoint

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
fields. It is not a runtime validator. The stub validates incoming JSON and accepts bodies up to 64 KiB.
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

Errors use a string `error` and numeric `status` matching the HTTP status:

```json
{"error":"AI analyzer proxy is not implemented yet.","status":501}
```

- 405: non-POST method; includes `Allow: POST`.
- 400: malformed JSON, invalid required fields, or body exceeding 64 KiB.
- 501: valid request; analysis is not implemented.

`isAiAnalyzerErrorResponse` validates this shape (also reserves 500 for future
internal errors). Success above describes the future response; the stub never
returns analysis. Extra request fields are ignored. Text fields must be strings;
neighboring sentences must be strings or null; pageNumber must be a positive safe
integer. All required fields must be present.

The same handler in `api/analyze/word.js` serves production and Vite development
requests. Vite preview does not serve this API. Responses use JSON and `no-store`.
The handler makes no external calls, requires no key, logs no text, and persists
nothing. The Inspector still uses mock by default.
