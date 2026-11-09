import { test, expect } from '@playwright/test';

for (const lang of ['en', 'nl'] as const) {
  test(`home renders in ${lang} with correct lang, hreflang and nav`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="nl"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });
}

test('language switcher keeps the current page', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('link', { name: 'nl', exact: true }).click();
  await expect(page).toHaveURL(/\/nl\/$/);
});

test('root redirects to /en/', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/$/);
});
