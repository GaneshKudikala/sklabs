# SK LABS website (sklabs.nl)

Static, bilingual (EN default, NL) marketing site. Astro + TypeScript + Tailwind CSS 4, deployed to Cloudflare Pages. No database; all content is file-based.

## Local development

```bash
nvm use            # Node version from .nvmrc
pnpm install
pnpm dev           # http://localhost:4321/en/
pnpm lint && pnpm format:check && pnpm check
pnpm build         # static output in dist/
pnpm test          # Playwright smoke tests (builds + previews first)
```

First run of the tests needs `pnpm exec playwright install chromium`.

## Structure

- `src/pages/[lang]/` routes for `/en/...` and `/nl/...`
- `src/i18n/` UI strings (`en.json`, `nl.json`) and helpers (`localePath`, `useT`)
- `src/layouts`, `src/components` shared layout, header, footer, SEO head, wordmark
- `src/content/` content collections (added in M2+)
- `public/_headers`, `public/_redirects` Cloudflare security headers and root redirect

## Adding content

- **Service:** add `src/content/services/en/<slug>.md` and the same filename under `nl/`. Frontmatter fields are defined in `src/content.config.ts` (problem, whatWeDo, deliverables, engagement, faq). Service JSON-LD and FAQPage are generated automatically.
- **Product:** add `src/content/products/{en,nl}/<slug>.md` (`status`: `live`, `beta`, `coming-soon`). SoftwareApplication JSON-LD is emitted only when the name is not a `[PLACEHOLDER]`.
- **Blog post:** add `src/content/blog/{en,nl}/<slug>.md` with `title`, `description`, `date`, `tags`. Tag pages, RSS (`/en/rss.xml`) and the sitemap update on build.
- **Case study:** add `src/content/case-studies/{en,nl}/<slug>.md` (see schema in `src/content.config.ts`; use `client: "[CLIENT]"` until the client approves being named). The Work nav item, pages and OG images appear automatically for a language once it has at least one case study. Never publish invented clients or metrics.
- **Job posting:** copy `docs/JOB_TEMPLATE.md` to `src/content/jobs/en/<slug>.md`. The page appears on `/jobs/`, gets filters, its own page, an OG image, `JobPosting` JSON-LD and a place in `/en/jobs/rss.xml` and `/en/jobs.json`. **`salaryMin`/`salaryMax` are required; the build fails without them.** To close a role set `status: closed` (or let `validThrough` pass): it leaves the listing, feeds and sitemap and its page shows a "This role is closed" banner (rebuild to apply, since the site is static). Run `pnpm lint:jobs` for gendered-wording warnings (also runs in CI). "Apply" currently opens the contact form prefilled; the dedicated apply function with CV upload comes next.
- **Sample roles** (`sample: true`) show in dev and when `INCLUDE_SAMPLE_JOBS=true` (set it in Cloudflare **Preview** only, and in tests); production builds hide them and keep them out of the sitemap and feeds. Delete the `SKL-SAMPLE-*` files once you have real roles.
- **Page / legal text:** `src/content/pages/{en,nl}/...`.
- `draft: true` on NL files shows a "draft translation" notice until you review and remove it.
- **OG images** are generated at build time for every page (`/og/<lang>/<slug>.png`); nothing to maintain. The build takes ~35 s because of them.

## Contact form

`functions/api/contact.ts` (Cloudflare Pages Function) validates input with zod, checks a honeypot, verifies Cloudflare Turnstile, rate-limits per IP (5 per 10 min; uses the optional `RATE_LIMIT` KV binding when present, otherwise per-isolate memory, so also add a Cloudflare WAF rate-limiting rule on `/api/contact`) and emails the message via Resend. Nothing is stored.

Test the function locally:

```bash
cp .dev.vars.example .dev.vars   # Turnstile test secret always passes
pnpm dev:functions               # builds, then wrangler pages dev on :8788
```

Unit tests: `pnpm test:unit`. Type-check functions: `pnpm check:functions`.

## Environment variables

See `.env.example`. Set them in Cloudflare Pages (never commit real values): `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO_EMAIL`, optional `CONTACT_FROM_EMAIL` (must be a Resend-verified sender), and the build-time `PUBLIC_TURNSTILE_SITE_KEY`.

## Deploy (Cloudflare Pages)

**1. Create the project.** Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → select this repo.

| Setting                             | Value                   |
| ----------------------------------- | ----------------------- |
| Production branch                   | `main`                  |
| Build command                       | `pnpm build`            |
| Build output directory              | `dist`                  |
| Environment variable `NODE_VERSION` | the version in `.nvmrc` |

Pages detects `functions/` and deploys the contact form function automatically.

**2. Environment variables** (Settings → Environment variables, Production and Preview): `RESEND_API_KEY`, `TURNSTILE_SECRET` (encrypted), `CONTACT_TO_EMAIL`, optional `CONTACT_FROM_EMAIL`, and `PUBLIC_TURNSTILE_SITE_KEY` (build-time, so redeploy after changing it).

**3. Email.** In Resend, add and verify `sklabs.nl` (add the DNS records Resend shows, including SPF and DKIM), then create the API key.

**4. Turnstile.** Cloudflare dashboard → Turnstile → add a widget for `sklabs.nl` (and `*.pages.dev` for previews if wanted). Managed mode is fine.

**5. Custom domain and DNS (sklabs.nl is already on Cloudflare DNS).**

1. Pages project → Custom domains → add `sklabs.nl`. Cloudflare creates the apex `CNAME` (flattened) to `<project>.pages.dev` automatically.
2. Add `www.sklabs.nl` as a custom domain too, so it resolves and has a certificate. Then add a redirect so `www` always lands on the apex:
   - Rules → Redirect Rules → Create: _If_ hostname equals `www.sklabs.nl` → _Dynamic_ redirect to `concat("https://sklabs.nl", http.request.uri.path)` with status 301 and "preserve query string".
3. SSL/TLS → Overview: mode **Full (strict)**. Edge Certificates: turn on **Always Use HTTPS**. HSTS is already sent by `_headers`; only submit to the preload list once you are sure every subdomain is HTTPS.

**6. Analytics.** Pages project → Metrics → enable Web Analytics (cookieless). The CSP already allows the Cloudflare beacon.

**7. Rate limiting.** Security → WAF → Rate limiting rules: limit `POST /api/contact` (for example 5 requests per 10 minutes per IP). Optionally bind a KV namespace named `RATE_LIMIT` for the in-function limit.

**8. Verify after the first deploy.** Submit the contact form end to end, check `https://sklabs.nl/` redirects to `/en/`, `https://www.sklabs.nl/` redirects to the apex, `/sitemap-index.xml`, `/en/rss.xml`, and re-run Lighthouse on the live URL.

Pull requests get preview deployments automatically. Local function test: `pnpm dev:functions`.

## Security headers

`public/_headers` sets a strict CSP (no inline scripts or styles), HSTS, COOP, Referrer-Policy and Permissions-Policy. `astro preview` ignores `_headers`; use `pnpm dev:functions` (wrangler) to test them locally.

## Milestones

M1 scaffold → M2 home/services/contact → M3 contact function → M4 products/about/legal → M5 blog/SEO → M6 a11y, Lighthouse, tests, deploy docs (done). Remaining work is content: see `CONTENT_TODO.md`.

## Quality checks

`pnpm lint`, `pnpm format:check`, `pnpm check`, `pnpm check:functions`, `pnpm test:unit`, `pnpm test` (Playwright incl. axe WCAG 2.1 AA scans of every page type in both languages).
