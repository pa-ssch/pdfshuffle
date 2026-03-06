# PDF Shuffle

A privacy-first web app that lets you combine multiple PDF files and instantly shuffle all their pages into a single randomized document — entirely in your browser, with zero file uploads.

**Live:** [pdfshuffle.de](https://pdfshuffle.de)

## Features

- Drag-and-drop or click-to-select PDF files
- Shuffle pages from multiple PDFs into one document
- 100% local processing — no uploads, no tracking, no server
- Duplicate file detection

## Tech Stack

- [Next.js](https://nextjs.org/) (static export)
- [React](https://react.dev/)
- [pdf-lib](https://pdf-lib.js.org/)
- Hosted on GitHub Pages

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

```bash
# Local production build
npm run build

# GitHub Pages build (triggered automatically via GitHub Actions on push to main)
npm run build:gh-pages
```

## License

Apache 2.0 — see [LICENSE](LICENSE).
