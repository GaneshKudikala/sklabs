import { test, expect } from '@playwright/test';

const slugs = [
  'cloud-infrastructure',
  'managed-services',
  'devops-platform-engineering',
  'cloud-security-compliance',
  'ai-agentic-consulting',
];

for (const lang of ['en', 'nl'] as const) {
  test(`${lang}: services overview lists all five services`, async ({ page }) => {
    await page.goto(`/${lang}/services/`);
    await expect(page.locator('main a[href*="/services/"]')).toHaveCount(5);
  });

  for (const slug of slugs) {
    test(`${lang}: service page ${slug} renders`, async ({ page }) => {
      await page.goto(`/${lang}/services/${slug}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('main details').first()).toBeVisible();
    });
  }

  test(`${lang}: contact form has required fields and honeypot`, async ({ page }) => {
    await page.goto(`/${lang}/contact/`);
    for (const name of ['name', 'email', 'message']) {
      await expect(page.locator(`[name="${name}"]`)).toHaveAttribute('required', '');
    }
    await expect(page.locator('select[name="interest"] option')).toHaveCount(7);
    await expect(page.locator('input[name="website"]')).toBeHidden();
  });
}
