import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/impressum", "/datenschutz"];

for (const route of ROUTES) {
  test(`${route} renders and has no accessibility violations`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("legal pages are current: DDG instead of TMG, DPF notice, date", async ({
  page,
}) => {
  await page.goto("/impressum");
  await expect(page.getByText(/§ 5 DDG/)).toBeVisible();
  await expect(page.getByText(/TMG/)).toHaveCount(0);
  await page.goto("/datenschutz");
  await expect(page.getByText(/Data Privacy Framework/)).toBeVisible();
  await expect(page.getByText(/^Stand: /)).toBeVisible();
});

test("legal pages link back home and home links to them", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Impressum" }).click();
  await expect(page).toHaveURL(/\/impressum$/);
  await page.getByRole("link", { name: /zurück/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Datenschutz" }).click();
  await expect(page).toHaveURL(/\/datenschutz$/);
});

test("unknown routes return the 404 page", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/404|not found/i).first()).toBeVisible();
});

test("loads no third-party resources", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.hostname !== "127.0.0.1") external.push(req.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});

test("has basic SEO metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/PDF Shuffle/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /.{50,}/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://pdfshuffle.de",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://pdfshuffle.de/og-image.png",
  );
  await expect(
    page.locator('meta[http-equiv="Content-Security-Policy"]'),
  ).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});

test("serves robots.txt, sitemap.xml and the web manifest", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://pdfshuffle.de/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://pdfshuffle.de/impressum");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  expect((await manifest.json()).name).toBe("PDF Shuffle");
});
