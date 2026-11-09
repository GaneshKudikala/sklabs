import { test, expect } from '@playwright/test';

// Sample roles are included in the test build (INCLUDE_SAMPLE_JOBS=true); production hides them.
test('en: listing shows 3 open sample roles and hides the closed one', async ({ page }) => {
  await page.goto('/en/jobs/');
  await expect(page.locator('[data-job]:visible')).toHaveCount(3);
  await expect(page.locator('main')).not.toContainText('Platform Engineer (closed)');
  await expect(page.locator('#job-count')).toContainText('3 roles shown');
});

test('nl: listing shows the empty state with an open application link', async ({ page }) => {
  await page.goto('/nl/jobs/');
  await expect(page.locator('[data-job]')).toHaveCount(0);
  await expect(page.locator('#positions')).toContainText('Er zijn nu geen open vacatures');
  await expect(page.locator('main a[href*="job=open-application"]').first()).toBeVisible();
});

test('filters narrow results and are reflected in the URL', async ({ page }) => {
  await page.goto('/en/jobs/');
  await page.selectOption('#f-type', 'CONTRACTOR');
  await expect(page.locator('[data-job]:visible')).toHaveCount(2);
  await expect(page).toHaveURL(/type=CONTRACTOR/);
  await page.fill('#f-q', 'bedrock');
  await expect(page.locator('[data-job]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/q=bedrock/);
  await page.selectOption('#f-work', 'onsite');
  await expect(page.locator('[data-job]:visible')).toHaveCount(0);
  await expect(page.locator('#job-none')).toBeVisible();
  await page.click('button[type="reset"]');
  await expect(page.locator('[data-job]:visible')).toHaveCount(3);
  await expect(page).not.toHaveURL(/\?/);
});

test('filters are restored from the query string', async ({ page }) => {
  await page.goto('/en/jobs/?specialism=security&seniority=medior');
  await expect(page.locator('[data-job]:visible')).toHaveCount(1);
  await expect(page.locator('#f-specialism')).toHaveValue('security');
});

test('job detail shows salary, facts, similar roles, share links and is noindex while sample', async ({
  page,
}) => {
  await page.goto('/en/jobs/senior-aws-devops-engineer/');
  await expect(page.locator('h1')).toHaveText('Senior AWS DevOps Engineer');
  await expect(page.locator('main')).toContainText('€75,000 - €95,000 per year');
  await expect(page.locator('main')).toContainText('Fintech scale-up');
  await expect(page.locator('main')).toContainText('Sample role');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('main a[href*="linkedin.com/sharing"]')).toBeVisible();
  await expect(page.locator('main [data-job], main li a[href*="/jobs/"]').first()).toBeVisible();
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
  expect(types).toContain('JobPosting');
});

test('closed role shows a banner and no JobPosting data', async ({ page }) => {
  await page.goto('/en/jobs/closed-platform-engineer/');
  await expect(page.getByRole('alert')).toContainText('This role is closed');
  await expect(page.getByRole('link', { name: 'View open roles' }).first()).toBeVisible();
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
  expect(types).not.toContain('JobPosting');
});

test('apply link prefills the contact form with the job', async ({ page }) => {
  await page.goto('/en/jobs/ai-llm-engineer/');
  await page.getByRole('link', { name: 'Apply for this role' }).last().click();
  await expect(page.locator('#interest')).toHaveValue('job-application');
  await expect(page.locator('#message')).toHaveValue(
    /Application for: AI \/ LLM Engineer \(ai-llm-engineer\)/,
  );
});

test('feeds exclude sample roles and are well formed', async ({ request }) => {
  const json = await (await request.get('/en/jobs.json')).json();
  expect(json.organization).toBe('SK LABS');
  expect(json.jobs).toEqual([]);
  const rss = await (await request.get('/en/jobs/rss.xml')).text();
  expect(rss).toContain('<rss');
  expect(rss).not.toContain('SKL-SAMPLE');
});

test('home links to jobs and hire in the split CTA band and lists latest roles', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('main a[href="/en/hire/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/en/jobs/"]').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Latest roles' })).toBeVisible();
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

test('hire page renders', async ({ page }) => {
  await page.goto('/en/hire/');
  await expect(page.locator('h1')).toHaveText('Hire Talent');
});
