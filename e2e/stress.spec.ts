import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";

/**
 * Load test with scan-like PDFs (one incompressible JPEG per page). Not part
 * of the regular suite: run with  STRESS=1 npx playwright test e2e/stress
 */
test.skip(!process.env.STRESS, "set STRESS=1 to run the large-file test");
test.setTimeout(10 * 60 * 1000);

const PAGES_PER_FILE = Number(process.env.STRESS_PAGES ?? 40);

async function makeScanPdf(page: import("@playwright/test").Page, pages: number) {
  // Noise JPEGs do not compress: ~1.4 MB each at 1200x1600.
  const jpegs: string[] = await page.evaluate(async (n) => {
    const out: string[] = [];
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 1600;
    const ctx = c.getContext("2d")!;
    for (let i = 0; i < n; i++) {
      const img = ctx.createImageData(c.width, c.height);
      // getRandomValues is capped at 64 KiB per call; a cheap LCG is enough noise.
      let seed = (i + 1) * 2654435761;
      for (let j = 0; j < img.data.length; j++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        img.data[j] = seed >>> 24;
      }
      ctx.putImageData(img, 0, 0);
      out.push(c.toDataURL("image/jpeg", 0.9).split(",")[1]);
    }
    return out;
  }, pages);
  const doc = await PDFDocument.create();
  for (const b64 of jpegs) {
    const img = await doc.embedJpg(Buffer.from(b64, "base64"));
    doc.addPage([595, 842]).drawImage(img, { x: 0, y: 0, width: 595, height: 842 });
  }
  return Buffer.from(await doc.save());
}

test("shuffles two scan-like PDFs of ~55 MB each", async ({ page }, info) => {
  await page.goto("/");
  const t0 = Date.now();
  const a = await makeScanPdf(page, PAGES_PER_FILE);
  const b = await makeScanPdf(page, PAGES_PER_FILE);
  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
  console.log(`fixtures: ${mb(a.length)} MB + ${mb(b.length)} MB in ${Date.now() - t0} ms`);
  // Playwright caps inline buffers at 50 MB; hand over file paths instead.
  const pathA = info.outputPath("scan-a.pdf");
  const pathB = info.outputPath("scan-b.pdf");
  await writeFile(pathA, a);
  await writeFile(pathB, b);

  const t1 = Date.now();
  await page.locator('input[type="file"]').setInputFiles([pathA, pathB]);
  await expect(page.getByRole("status")).toHaveText(
    `2 files · ${2 * PAGES_PER_FILE} pages`,
    { timeout: 120_000 },
  );
  await expect(page.locator("canvas:visible")).toHaveCount(2, { timeout: 120_000 });
  console.log(`thumbnails + page counts: ${Date.now() - t1} ms`);

  const t2 = Date.now();
  const dl = page.waitForEvent("download", { timeout: 300_000 });
  await page.getByRole("button", { name: /shuffle/i }).click();
  const download = await dl;
  const bytes = await readFile((await download.path())!);
  console.log(`shuffle + download: ${Date.now() - t2} ms, output ${mb(bytes.length)} MB`);

  const out = await PDFDocument.load(bytes);
  expect(out.getPageCount()).toBe(2 * PAGES_PER_FILE);
  expect(bytes.length).toBeGreaterThan(0.9 * (a.length + b.length));
  await expect(page.getByText(/check your downloads/i)).toBeVisible();
});
