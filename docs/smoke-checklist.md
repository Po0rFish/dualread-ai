# DualRead AI Smoke Checklist

Run this checklist before a release and after changes to the PDF reader,
translation flow, storage, or DeepL proxy.

## Test run

- Date:
- Tester:
- Commit or deployment:
- Browser and version:
- Environment: local development / Vercel production
- Test PDF:
- DeepL plan: Free / Pro

Use `[x]` only for a passing check. Record failures and unexpected behavior in
the notes section with the relevant check number.

## 1. Application and library

- [ ] 1.1 The home page opens without visible errors.
- [ ] 1.2 A valid PDF can be uploaded and saved to the library.
- [ ] 1.3 The saved document shows its expected name and metadata.
- [ ] 1.4 The document opens from the library in the reader.
- [ ] 1.5 Reloading the browser keeps the saved document available.
- [ ] 1.6 An invalid or unsupported file produces a clear error and does not add a broken document.

## 2. PDF reader

- [ ] 2.1 The first page renders with its text overlay aligned to the PDF canvas.
- [ ] 2.2 Previous, next, and direct page navigation work at the document boundaries.
- [ ] 2.3 Reloading or reopening the document restores the last read page.
- [ ] 2.4 Pages with different dimensions render without shifted or clipped text overlays.
- [ ] 2.5 A long page remains scrollable and usable.
- [ ] 2.6 Selecting a sentence highlights the correct visible text.
- [ ] 2.7 Selecting a word or short phrase resolves to the correct containing sentence.
- [ ] 2.8 Changing the page clears or correctly relocates the active selection and popover.

## 3. Translation happy path

- [ ] 3.1 With no API key, the translation action shows a clear prompt to enter one.
- [ ] 3.2 A valid DeepL key can be entered in translation settings.
- [ ] 3.3 Translating selected text sends a request only to `POST /api/translate/deepl`.
- [ ] 3.4 The popover is anchored near the selected source text and remains readable.
- [ ] 3.5 The translated text matches the selected source and target language.
- [ ] 3.6 Copy places the complete translation on the clipboard.
- [ ] 3.7 Closing the popover clears the visible result without breaking selection.
- [ ] 3.8 Translating the same text and language again reuses the cached translation.
- [ ] 3.9 Changing the target language produces and displays a translation for that language.
- [ ] 3.10 Long source and translated text remain readable and do not overflow the popover.
- [ ] 3.11 DeepL usage refreshes after a successful translation.

## 4. Translation failures

- [ ] 4.1 An invalid or expired API key shows the authentication error.
- [ ] 4.2 A disconnected network or unreachable proxy shows the network/proxy error.
- [ ] 4.3 HTTP 429 shows a retry-later rate-limit error and the UI remains usable.
- [ ] 4.4 An exhausted DeepL character quota shows a quota error and the UI remains usable.
- [ ] 4.5 A malformed successful proxy response shows the unexpected-response error.
- [ ] 4.6 A failed usage refresh does not hide an otherwise successful translation.
- [ ] 4.7 After an error, a later successful request replaces the error normally.
- [ ] 4.8 Repeated clicks while a request is pending do not create duplicate translations or corrupt state.

## 5. Local data and cleanup

- [ ] 5.1 Reloading the page does not retain the DeepL API key.
- [ ] 5.2 Reopening a document can reuse its cached translation.
- [ ] 5.3 Deleting a document removes it from the library.
- [ ] 5.4 Deleting a document also removes its extracted text, translations, and reading progress.
- [ ] 5.5 Starting the app with orphaned document data cleans it up without affecting valid documents.
- [ ] 5.6 Empty-library and empty-reader states render without errors.

## 6. Interaction and layout

- [ ] 6.1 Keyboard focus is visible on all controls used in the tested flow.
- [ ] 6.2 Translation settings open, close with their controls, and close with Escape.
- [ ] 6.3 Focus does not become trapped or lost after closing settings.
- [ ] 6.4 The reader, popover, and settings remain usable at desktop width.
- [ ] 6.5 The home, library, and reader remain usable at a narrow mobile width.
- [ ] 6.6 Touch or pointer selection does not trigger accidental navigation or duplicate actions.

## 7. Build and environment checks

- [ ] 7.1 `npm run lint` completes successfully.
- [ ] 7.2 `npm run build` completes successfully.
- [ ] 7.3 The complete checklist passes with `npm run dev` and the local proxy.
- [ ] 7.4 The critical flow passes on Vercel: open, select, translate, copy, reopen cached translation.
- [ ] 7.5 Vercel uses only its `/api/translate/deepl` proxy; the browser never calls DeepL directly.
- [ ] 7.6 Refreshing a deployed reader URL does not produce a routing error.

## Notes and failures

| Check | Result | Details | Follow-up |
| --- | --- | --- | --- |
|  |  |  |  |

## Result

- [ ] Local development smoke test passed.
- [ ] Vercel production smoke test passed.
- Blocking failures:
- Non-blocking follow-ups:
