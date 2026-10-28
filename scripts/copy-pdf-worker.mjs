// Copies the pdf.js worker that matches the installed pdfjs-dist version into
// public/ so it is served from the same origin as the app (no CDN, CSP-friendly).
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = join(root, "public", "pdf.worker.min.mjs");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`Copied pdf.js worker to ${dest}`);
