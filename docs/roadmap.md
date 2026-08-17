# DualRead AI Roadmap

## Before v0.20.0

- [x] Delete translation cache and other related local data when a PDF is deleted.
- [x] Remove orphaned local data left by missing documents.
- Finish responsive layouts for the home, library, and reader pages.
- Finish the visual pass for the home and library pages so they match the dark reader workspace.
- Add PDF zoom controls with synchronized canvas and segment-overlay scaling.
- Verify the complete PDF-to-translation flow and error states using the
  [smoke checklist](./smoke-checklist.md).
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
- Before the first product release, decide whether to reset `TEXT_MODEL_VERSION` to `1`.
  - Reset it only together with a new text-model database namespace or an explicit cache migration/clear, so old version `1` records cannot be treated as current.
  - Otherwise keep the version monotonic and document the existing model-version history.
- Release version `0.20.0`.

## Translation follow-ups

- Add contextual word translation from source sentences.
  - Let the user select a word or short phrase in the source text.
  - Translate the selection using the complete sentence as context.
  - Show the contextual meaning in a compact word card.
  - Save words with their contextual translation, source sentence, page, and document.
  - Add a vocabulary view for searching, reviewing, and deleting saved words.
- Replace the permanent translation sidebar with a popover anchored to the selected PDF sentence.
  - Translate and show cached results directly beside the source text.
  - Move translation history, vocabulary, and settings into on-demand drawers or dialogs.
- Add persistent bookmarks.
  - Bookmark a page or a selected sentence.
  - Store the document, page, segment, text preview, optional note, and creation date.
  - Open the saved page and highlight its segment from the bookmarks view.
  - Delete document bookmarks together with other document-related local data.

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
- Finish the responsive pass after the desktop interaction model is stable.
  - Verify phone, tablet, and desktop layouts.
  - Add PDF `Fit width` and keep the canvas and segment overlay scaled together.
  - Use mobile bottom sheets for history, vocabulary, bookmarks, and settings.
