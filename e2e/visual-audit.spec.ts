import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makePdf } from "./fixtures";
import { mkdirSync } from "node:fs";

/**
 * Visual/UX audit: screenshots of every UI state on six viewports plus
 * automated checks for horizontal overflow, text below 12px, interactive
 * targets below 24px and axe WCAG 2.2 AA. Findings are printed, not asserted,
 * so a designer can judge them. Opt-in:  VISUAL=1 npx playwright test e2e/visual-audit
 */
test.skip(!process.env.VISUAL, "set VISUAL=1 to run the visual audit");
const DIR = process.env.VISUAL_DIR ?? "test-results/visual-audit";
const VIEWPORTS = [
  { name: "phone-320", width: 320, height: 568 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-landscape", width: 844, height: 390 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

for (const vp of VIEWPORTS) {
  test(`visual ${vp.name}`, async ({ page }) => {
    mkdirSync(DIR, { recursive: true });
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const report: string[] = [];
    const check = async (label: string) => {
      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const small = [...document.querySelectorAll("body *")]
          .filter((el) => el.textContent?.trim() && getComputedStyle(el).display !== "none")
          .map((el) => ({ tag: el.tagName, fs: parseFloat(getComputedStyle(el).fontSize), txt: (el.textContent || "").trim().slice(0, 30) }))
          .filter((x) => x.fs < 12 && !["DIV","MAIN","BODY","HTML"].includes(x.tag));
        const targets = [...document.querySelectorAll("button, a, input:not([hidden])")]
          .filter((el) => getComputedStyle(el).display !== "none" && (el as HTMLElement).offsetParent !== null)
          .map((el) => { const r = el.getBoundingClientRect(); return { txt: (el.textContent || (el as HTMLElement).ariaLabel || "").trim().slice(0, 25), w: Math.round(r.width), h: Math.round(r.height) }; })
          .filter((t) => t.w < 24 || t.h < 24);
        return { overflow: de.scrollWidth > de.clientWidth ? `${de.scrollWidth}>${de.clientWidth}` : null, small, targets };
      });
      if (m.overflow) report.push(`${label}: HORIZONTAL OVERFLOW ${m.overflow}`);
      for (const s of m.small) report.push(`${label}: small text ${s.fs}px <${s.tag}> "${s.txt}"`);
      for (const t of m.targets) report.push(`${label}: small target ${t.w}x${t.h} "${t.txt}"`);
      await page.screenshot({ path: `${DIR}/${vp.name}--${label}.png`, fullPage: true });
    };

    await page.goto("/");
    await check("1-empty");
    await page.locator('input[type="file"]').setInputFiles([
      { name: "quarterly-report-final-v3.pdf", mimeType: "application/pdf", buffer: await makePdf(1, 3) },
      { name: "b.pdf", mimeType: "application/pdf", buffer: await makePdf(2, 12) },
      { name: "c.pdf", mimeType: "application/pdf", buffer: await makePdf(3, 1) },
      { name: "d.pdf", mimeType: "application/pdf", buffer: await makePdf(4, 2) },
      { name: "e.pdf", mimeType: "application/pdf", buffer: await makePdf(5, 2) },
      { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("x") },
    ]);
    await expect(page.getByRole("status")).toHaveText(/20 pages/);
    await check("2-files");
    // keyboard focus state on the primary button
    await page.getByRole("button", { name: /shuffle/i }).focus();
    await page.screenshot({ path: `${DIR}/${vp.name}--3-focus.png` });
    const dl = page.waitForEvent("download");
    await page.getByRole("button", { name: /shuffle/i }).click();
    await dl;
    await expect(page.getByText(/check your downloads/i)).toBeVisible();
    await check("4-success");
    // error state
    await page.locator('input[type="file"]').setInputFiles([
      { name: "broken.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7 nope") },
    ]);
    await page.getByRole("button", { name: /shuffle/i }).click();
    await expect(page.getByText(/could not be read/i)).toBeVisible();
    await check("5-error");
    // drag highlight
    const dt = await page.evaluateHandle(() => new DataTransfer());
    await page.locator("div[class*='droparea_']").first().dispatchEvent("dragenter", { dataTransfer: dt });
    await page.screenshot({ path: `${DIR}/${vp.name}--6-dragover.png`, fullPage: true });
    await page.goto("/datenschutz");
    await check("7-datenschutz");
    await page.goto("/does-not-exist");
    await check("8-404");
    // WCAG 2.2 target size + contrast on the busiest state
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles([{ name: "a.pdf", mimeType: "application/pdf", buffer: await makePdf(1, 3) }]);
    await expect(page.getByRole("status")).toHaveText(/3 pages/);
    const axe = await new AxeBuilder({ page }).withTags(["wcag22aa", "best-practice"]).analyze();
    for (const v of axe.violations) report.push(`${vp.name} axe ${v.id} (${v.impact}): ${v.nodes.map((n) => n.html.slice(0, 60)).join(" | ")}`);
    console.log(`=== ${vp.name}\n${report.join("\n") || "no findings"}`);
  });
}
