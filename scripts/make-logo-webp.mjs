// Converts assets/logo.png into a small WebP for the page header using the
// Playwright Chromium (no native image tooling required). Run after changing
// the logo: node scripts/make-logo-webp.mjs
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const WIDTH = 720; // rendered at most ~360 CSS px wide -> 2x for retina
const src = readFileSync(join(root, "assets", "logo.png")).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage();
const dataUrl = await page.evaluate(
  async ([b64, width]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.round((img.height * width) / img.width);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.82);
  },
  [src, WIDTH],
);
await browser.close();
const out = Buffer.from(dataUrl.split(",")[1], "base64");
writeFileSync(join(root, "public", "logo.webp"), out);
console.log(`public/logo.webp: ${out.length} bytes, ${WIDTH}px wide`);
