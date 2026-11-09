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

Build command `pnpm build`, output directory `dist`, env var `NODE_VERSION` = contents of `.nvmrc`. DNS and apex/www redirect steps are documented in M6.

## Milestones

M1 scaffold (this branch) → M2 home/services/contact → M3 contact function → M4 products/about/legal → M5 blog/SEO → M6 NL review, a11y, deploy docs.
