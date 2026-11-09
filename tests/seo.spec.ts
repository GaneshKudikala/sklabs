import { test, expect } from '@playwright/test';

const ldTypes = async (page: import('@playwright/test').Page) =>
  (
    await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']))
  ).sort();

for (const lang of ['en', 'nl'] as const) {
  test(`${lang}: insights list, post and tag page`, async ({ page }) => {
    await page.goto(`/${lang}/insights/`);
    await expect(page.locator('main article')).toHaveCount(1);
    await page.locator('main article a').first().click();
    await expect(page.locator('h1')).toBeVisible();
    await page.goto(`/${lang}/insights/tags/cloud/`);
    await expect(page.locator('main article')).toHaveCount(1);
  });

  test(`${lang}: rss feed is valid XML with an item`, async ({ request }) => {
    const res = await request.get(`/${lang}/rss.xml`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<rss');
    expect(body).toContain('<item>');
  });
}

test('service page has Service, FAQPage and BreadcrumbList JSON-LD', async ({ page }) => {
  await page.goto('/en/services/managed-services/');
  const types = await ldTypes(page);
  expect(types).toEqual(
    expect.arrayContaining(['Organization', 'Service', 'FAQPage', 'BreadcrumbList']),
  );
});

test('home has ProfessionalService JSON-LD', async ({ page }) => {
  await page.goto('/en/');
  expect(await ldTypes(page)).toContain('ProfessionalService');
});

test('placeholder products do not emit SoftwareApplication', async ({ page }) => {
  await page.goto('/en/products/product-1/');
  expect(await ldTypes(page)).not.toContain('SoftwareApplication');
});

test('blog post has BlogPosting JSON-LD and article OG type', async ({ page }) => {
  await page.goto('/en/insights/what-is-a-landing-zone/');
  expect(await ldTypes(page)).toContain('BlogPosting');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
});

test('OG and Twitter image tags point to a real PNG', async ({ page, request }) => {
  await page.goto('/en/services/cloud-infrastructure/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toBe('https://sklabs.nl/og/en/services--cloud-infrastructure.png');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', og!);
  const res = await request.get(new URL(og!).pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
});

test('sitemap lists localized pages', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain('sitemap-0.xml');
  const map = await (await request.get('/sitemap-0.xml')).text();
  expect(map).toContain('https://sklabs.nl/en/services/managed-services/');
  expect(map).toContain('https://sklabs.nl/nl/insights/');
});

test('sitemap excludes sample and closed job pages but includes the jobs listing', async ({
  request,
}) => {
  const map = await (await request.get('/sitemap-0.xml')).text();
  expect(map).toContain('https://sklabs.nl/en/jobs/');
  expect(map).not.toContain('/jobs/senior-aws-devops-engineer/');
  expect(map).not.toContain('/jobs/closed-platform-engineer/');
});
