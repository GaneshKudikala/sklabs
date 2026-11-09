import { test, expect } from '@playwright/test';

for (const lang of ['en', 'nl'] as const) {
  test(`${lang}: careers page, nav link and spontaneous application`, async ({ page }) => {
    await page.goto(`/${lang}/careers/`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header nav a[href$="/careers/"]').first()).toBeVisible();
    // No jobs ship in the repo, so the empty state is shown until postings are added.
    await expect(page.locator('#positions')).toBeVisible();
    await page.locator('main a[href*="/contact/?job=open-application"]').click();
    await expect(page.locator('#interest')).toHaveValue('careers');
    await expect(page.locator('#message')).not.toHaveValue('');
  });
}

test('job apply links prefill the contact form', async ({ page }) => {
  await page.goto(
    '/en/contact/?job=cloud-engineer&title=Cloud%20Engineer&prefix=Application%20for',
  );
  await expect(page.locator('#interest')).toHaveValue('careers');
  await expect(page.locator('#message')).toHaveValue(
    /Application for: Cloud Engineer \(cloud-engineer\)/,
  );
});

for (const [lang, ok] of [
  ['en', 'message has been sent'],
  ['nl', 'bericht is verzonden'],
] as const) {
  test(`${lang}: contact form submits via fetch and shows feedback`, async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ json: { ok: true }, contentType: 'application/json' }),
    );
    await page.goto(`/${lang}/contact/`);
    await page.fill('#name', 'Ada');
    await page.fill('#email', 'ada@example.com');
    await page.fill('#message', 'A long enough message for validation.');
    await page.click('button[type="submit"]');
    await expect(page.locator('#form-status')).toContainText(ok);
  });
}

test('contact form shows an error message when the API fails', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 502, json: { ok: false, error: 'send_failed' } }),
  );
  await page.goto('/en/contact/');
  await page.fill('#name', 'Ada');
  await page.fill('#email', 'ada@example.com');
  await page.fill('#message', 'A long enough message for validation.');
  await page.click('button[type="submit"]');
  await expect(page.locator('#form-status')).toContainText('Something went wrong');
});
