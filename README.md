# PDF Shuffle

A privacy-first web app that combines multiple PDF files and shuffles all their
pages into one randomized document — entirely in your browser, with zero file
uploads.

**Live:** [pdfshuffle.de](https://pdfshuffle.de)

## Features

- Drag-and-drop or click/tap to select PDF files
- Shuffle pages from multiple PDFs into one download (uniform random order)
- Page count per file and in total, first-page thumbnails
- 100% local processing — no uploads, no cookies, no tracking, no third-party
  requests
- Duplicate detection, clear errors for corrupt or password-protected files

## Tech stack

- [Next.js](https://nextjs.org/) 16 (static export, App Router)
- [React](https://react.dev/) 19
- [pdf-lib](https://pdf-lib.js.org/) for merging/shuffling,
  [pdf.js](https://mozilla.github.io/pdf.js/) for thumbnails and page counts
- Vitest + Testing Library (unit), Playwright + axe (end-to-end, a11y)
- Hosted on GitHub Pages via GitHub Actions

## Development

Requires Node 22.12 or newer (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:3000
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test             # unit tests
npm run build        # static export to out/
npm run test:e2e     # Playwright against out/ (run `npx playwright install` once)
npm run serve        # serve out/ locally like GitHub Pages
STRESS=1 npm run test:e2e -- e2e/stress   # opt-in load test with ~110 MB of scan PDFs
```

## Deployment

Every push to `main` runs lint, typecheck, unit tests, build, end-to-end tests
and `npm audit`. Only if all pass, the `out/` folder is deployed to GitHub
Pages (`.github/workflows/ci.yml`). The custom domain and HTTPS are configured
in the repository's Pages settings.

## Security

See [SECURITY.md](SECURITY.md). Dependencies are kept current by Dependabot.

## License

Apache 2.0 — see [LICENSE](LICENSE).
