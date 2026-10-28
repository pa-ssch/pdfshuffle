import { test, expect, type Page } from "@playwright/test";
import { makePdf, pageWidthsOf, expectedWidths } from "./fixtures";

async function addFiles(
  page: Page,
  files: { name: string; buffer: Buffer; mimeType?: string }[],
) {
  await page.locator('input[type="file"]').setInputFiles(
    files.map((f) => ({
      name: f.name,
      mimeType: f.mimeType ?? "application/pdf",
      buffer: f.buffer,
    })),
  );
}

test.describe("shuffle flow", () => {
  test("merges and shuffles all pages of several PDFs into one download", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const button = page.getByRole("button", { name: /shuffle & download/i });
    await expect(button).toBeDisabled();

    await addFiles(page, [
      { name: "alpha.pdf", buffer: await makePdf(1, 3) },
      { name: "beta.pdf", buffer: await makePdf(2, 4) },
    ]);

    // Thumbnails are rendered by the real pdf.js worker.
    await expect(page.getByText("alpha.pdf")).toBeVisible();
    await expect(page.getByText(/3 pages/)).toBeVisible();
    await expect(page.getByText(/4 pages/)).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("2 files · 7 pages");
    await expect(page.locator("canvas:visible")).toHaveCount(2);

    await expect(button).toBeEnabled();
    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("shuffle.pdf");

    const path = await download.path();
    const { readFile } = await import("node:fs/promises");
    const widths = await pageWidthsOf(await readFile(path!));

    const expected = [...expectedWidths(1, 3), ...expectedWidths(2, 4)];
    expect(widths).toHaveLength(7);
    expect([...widths].sort()).toEqual([...expected].sort());

    await expect(page.getByText(/check your downloads/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /shuffle again/i }),
    ).toBeEnabled();
  });

  test("produces different orders on repeated shuffles", async ({ page }) => {
    await page.goto("/");
    await addFiles(page, [{ name: "big.pdf", buffer: await makePdf(3, 12) }]);
    await expect(page.getByRole("status")).toHaveText("1 file · 12 pages");

    const { readFile } = await import("node:fs/promises");
    const orders: string[] = [];
    for (let i = 0; i < 3; i++) {
      const dl = page.waitForEvent("download");
      await page.getByRole("button", { name: /shuffle/i }).click();
      const path = await (await dl).path();
      orders.push((await pageWidthsOf(await readFile(path!))).join(","));
    }
    // 12! orders; three identical draws would be astronomically unlikely.
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  test("removing a file excludes its pages", async ({ page }) => {
    await page.goto("/");
    await addFiles(page, [
      { name: "keep.pdf", buffer: await makePdf(1, 2) },
      { name: "drop.pdf", buffer: await makePdf(2, 5) },
    ]);
    await expect(page.getByRole("status")).toHaveText("2 files · 7 pages");
    await page.getByRole("button", { name: "Remove drop.pdf" }).click();
    await expect(page.getByRole("status")).toHaveText("1 file · 2 pages");

    const dl = page.waitForEvent("download");
    await page.getByRole("button", { name: /shuffle/i }).click();
    const { readFile } = await import("node:fs/promises");
    const widths = await pageWidthsOf(await readFile((await (await dl).path())!));
    expect([...widths].sort()).toEqual(expectedWidths(1, 2));
  });

});

test.describe("error handling", () => {
  test("rejects non-PDF files with a notice", async ({ page }) => {
    await page.goto("/");
    await addFiles(page, [
      { name: "notes.txt", buffer: Buffer.from("hello"), mimeType: "text/plain" },
      { name: "ok.pdf", buffer: await makePdf(1, 1) },
    ]);
    await expect(page.getByText(/skipped \(not a pdf\)/i)).toContainText(
      "notes.txt",
    );
    await expect(page.getByRole("status")).toHaveText("1 file · 1 page");
  });

  test("reports a corrupt PDF instead of silently producing output", async ({
    page,
  }) => {
    await page.goto("/");
    await addFiles(page, [
      { name: "broken.pdf", buffer: Buffer.from("%PDF-1.7 this is not a pdf") },
    ]);
    await expect(page.getByText("broken.pdf")).toBeVisible();
    await page.getByRole("button", { name: /shuffle/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /could not be read/i })).toContainText(
      "broken.pdf",
    );
    await expect(page.getByRole("button", { name: /shuffle/i })).toBeEnabled();
  });
});
