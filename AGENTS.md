# DualRead AI — AI assistant instructions

## Project
React + Vite + TypeScript SPA for PDF reading, text translation, and document library management.

## Commands
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Architecture
- `src/features/` — feature modules
- `src/pages/` — app pages
- `src/shared/` — shared components, utilities, and styles

## Key rules
- frontend must use only `POST /api/translate/deepl`
- do not call `https://api-free.deepl.com/v2/translate` or `https://api.deepl.com/v2/translate` directly
- DeepL API key is stored only in React state, not in localStorage or files

## Important files
- `vite.config.ts`
- `api/translate/deepl.js`
- `docs/deepl-proxy-contract.md`
- `src/features/translation/`
- `src/features/pdf-reader/`

## Notes
- `package.json` has no test command
- DeepL proxy works for both local development and production
