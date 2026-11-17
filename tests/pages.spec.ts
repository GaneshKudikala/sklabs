import { test, expect } from '@playwright/test';

const slugs = [
  'cloud-infrastructure',
  'managed-services',
  'devops-platform-engineering',
  'cloud-security-compliance',
  'ai-agentic-consulting',
  'talent-recruitment',
];

for (const lang of ['en', 'nl'] as const) {
  test(`${lang}: services overview lists all six services`, async ({ page }) => {
    await page.goto(`/${lang}/services/`);
    await expect(page.locator('main a[href*="/services/"]')).toHaveCount(6);
  });

  for (const slug of slugs) {
    test(`${lang}: service page ${slug} renders`, async ({ page }) => {
      await page.goto(`/${lang}/services/${slug}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('main details').first()).toBeVisible();
      // New layout: grouped achievements and numbered outcomes
      await expect(page.locator('main h2', { hasText: /achieve|bereikt/i })).toBeVisible();
      await expect(page.locator('main ol > li').first()).toContainText('01');
      expect(await page.locator('main ol > li').count()).toBeGreaterThanOrEqual(3);
    });
  }

  test(`${lang}: contact form has required fields and honeypot`, async ({ page }) => {
    await page.goto(`/${lang}/contact/`);
    for (const name of ['name', 'email', 'message']) {
      await expect(page.locator(`[name="${name}"]`)).toHaveAttribute('required', '');
    }
    await expect(page.locator('select[name="interest"] option')).toHaveCount(9);
    await expect(page.locator('input[name="website"]')).toBeHidden();
  });
}
