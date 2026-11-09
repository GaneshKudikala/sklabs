import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '',
  'services/',
  'services/managed-services/',
  'products/',
  'products/product-1/',
  'about/',
  'contact/',
  'insights/',
  'insights/what-is-a-landing-zone/',
  'legal/privacy/',
  'legal/imprint/',
];

for (const lang of ['en', 'nl']) {
  for (const path of pages) {
    test(`a11y (WCAG 2.1 AA) ${lang}/${path}`, async ({ page }) => {
      await page.goto(`/${lang}/${path}`);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(
        results.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
        ),
      ).toEqual([]);
    });
  }
}

test('mobile menu is keyboard operable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/en/');
  const summary = page.locator('header details summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('header details')).toHaveAttribute('open', '');
});
