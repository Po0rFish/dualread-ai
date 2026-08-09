# DeepL Proxy Contract

DualRead AI must not call the DeepL API directly from browser code.

Frontend calls only the internal proxy endpoint:

```txt
/api/translate/deepl
```

## Implementations

```txt
vite.config.ts          local development proxy
api/translate/deepl.js  Vercel production proxy
```

Both implementations must follow the same request and response contract.

## Translation request

```txt
POST /api/translate/deepl
Content-Type: application/json
Authorization: DeepL-Auth-Key <api-key>
```

```json
{
  "text": ["Text to translate"],
  "target_lang": "EN",
  "show_billed_characters": true
}
```

The API key is entered by the user in the app UI and is kept only in React memory state.

## Usage request

After a successful DeepL translation, the frontend uses the same proxy
route and method:

```txt
POST /api/translate/deepl
Content-Type: application/json
Authorization: DeepL-Auth-Key <api-key>
```

```json
{
  "operation": "usage"
}
```

The proxy converts this request to `GET /v2/usage` on the matching
DeepL Free or Pro host. It returns the DeepL usage response unchanged:

```json
{
  "character_count": 147,
  "character_limit": 1000000
}
```

## Translation success response

The proxy returns the DeepL response without changing its structure:

```json
{
  "translations": [
    {
      "detected_source_language": "DE",
      "text": "Translated text"
    }
  ]
}
```

## Error response

```json
{
  "error": "DeepL request failed.",
  "status": 403,
  "details": "Optional error details"
}
```

The `details` field is optional.

## DeepL endpoint selection

```txt
Free key ending with :fx → https://api-free.deepl.com/v2/translate
Other key               → https://api.deepl.com/v2/translate
```

Usage requests select the same Free or Pro host with the `/v2/usage`
path.

## Rule

Allowed in frontend:

```ts
fetch('/api/translate/deepl')
```

Not allowed in frontend:

```ts
fetch('https://api-free.deepl.com/v2/translate')
fetch('https://api.deepl.com/v2/translate')
```
