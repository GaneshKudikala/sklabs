import { test, expect } from '@playwright/test';

for (const lang of ['en', 'nl'] as const) {
  test(`${lang}: products list shows three coming-soon products`, async ({ page }) => {
    await page.goto(`/${lang}/products/`);
    await expect(page.locator('main a[href*="/products/product-"]')).toHaveCount(3);
  });

  test(`${lang}: product detail renders`, async ({ page }) => {
    await page.goto(`/${lang}/products/product-1/`);
    await expect(page.locator('h1')).toBeVisible();
  });

  test(`${lang}: about renders with headings`, async ({ page }) => {
    await page.goto(`/${lang}/about/`);
    await expect(page.locator('main h2').first()).toBeVisible();
  });

  for (const slug of ['privacy', 'cookies', 'terms', 'imprint']) {
    test(`${lang}: legal page ${slug} renders`, async ({ page }) => {
      await page.goto(`/${lang}/legal/${slug}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('main h2').first()).toBeVisible();
    });
  }

  test(`${lang}: footer legal links resolve`, async ({ page, request }) => {
    await page.goto(`/${lang}/`);
    const hrefs = await page
      .locator('footer a[href*="/legal/"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));
    expect(hrefs).toHaveLength(4);
    for (const href of hrefs) expect((await request.get(href!)).status()).toBe(200);
  });
}
