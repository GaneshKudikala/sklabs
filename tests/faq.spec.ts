import { test, expect } from '@playwright/test';

for (const lang of ['en', 'nl'] as const) {
  test(`${lang}: FAQ page has grouped, expandable questions`, async ({ page }) => {
    await page.goto(`/${lang}/faq/`);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.locator('main h2').count()).toBeGreaterThanOrEqual(4);
    const first = page.locator('main details').first();
    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('p')).toBeVisible();
  });

  test(`${lang}: FAQ is in header and footer navigation`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    await expect(page.locator('header nav a[href$="/faq/"]').first()).toBeVisible();
    await expect(page.locator('footer a[href$="/faq/"]')).toBeVisible();
  });
}

test('FAQ page has FAQPage JSON-LD covering every question', async ({ page }) => {
  await page.goto('/en/faq/');
  const total = await page.locator('main details').count();
  const ld = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')));
  const faq = ld.find((x) => x['@type'] === 'FAQPage');
  expect(faq.mainEntity).toHaveLength(total);
});

test('FAQ is in the sitemap and has an OG image', async ({ page, request }) => {
  const map = await (await request.get('/sitemap-0.xml')).text();
  expect(map).toContain('https://sklabs.nl/en/faq/');
  await page.goto('/en/faq/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect((await request.get(new URL(og!).pathname)).status()).toBe(200);
});
