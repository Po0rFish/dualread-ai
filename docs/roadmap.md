# DualRead AI Roadmap

## Before v0.20.0

- Delete translation cache and other related local data when a PDF is deleted.
- Remove orphaned local data left by missing documents.
- Finish responsive layouts for the home, library, and reader pages.
- Finish the visual pass for the home and library pages so they match the dark reader workspace.
- Add PDF zoom controls with synchronized canvas and segment-overlay scaling.
- Verify the complete PDF-to-translation flow and error states.
  - Upload, save, reopen, navigate, select, translate, copy, clear the panel, and reuse a cached translation.
  - Check missing, invalid, and expired DeepL keys.
  - Check network failures, quota errors, malformed proxy responses, and usage-refresh failures.
  - Check page changes, different PDF page sizes, long text, and empty states.
- Add local data management for documents, extracted text, translations, and reading progress.
- Make the `Enter API key` button open the translation settings and focus the DeepL API key input.
- Review keyboard navigation, focus states, dialog behavior, resize controls, and touch interaction.
- Review the large production bundle warning and decide whether PDF-related code should be loaded dynamically.
- Run local and Vercel production smoke tests.
- Update the README with project setup, architecture, local-data behavior, DeepL proxy usage, and privacy notes.
- Release version `0.20.0`.

## Translation follow-ups

- Add contextual word translation from source sentences.
  - Let the user select a word or short phrase in the source text.
  - Translate the selection using the complete sentence as context.
  - Show the contextual meaning in a compact word card.
  - Consider integration with the existing saved-words feature.

## Later

- Add a local storage usage panel.
  - Read approximate browser `usage` and `quota` with `navigator.storage.estimate()`.
  - Show used and available storage in bytes with human-readable units.
  - Count source and translated characters stored in the translation cache.
  - Keep byte capacity and character counts separate because PDF files and IndexedDB metadata share the same browser quota.
  - Treat the browser quota and any estimated remaining character capacity as approximate values.
- Allow clearing translation cache, extracted text cache, reading progress, documents, or all local data separately.
- Restore saved translation history when reopening a document.
- Add a visible local-data and privacy explanation: PDFs, extracted text, reading progress, and translations stay in the browser.
- Add confirmation dialogs for destructive storage actions and explain what can or cannot be recovered.
- Add focused automated tests for translation, storage cleanup, and proxy contracts.
