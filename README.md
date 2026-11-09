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

## Environment variables

See `.env.example`. Set them in Cloudflare Pages (never commit real values). Used from M3 onward.

## Deploy (Cloudflare Pages)

Build command `pnpm build`, output directory `dist`, env var `NODE_VERSION` = contents of `.nvmrc`. DNS and apex/www redirect steps are documented in M6.

## Milestones

M1 scaffold (this branch) → M2 home/services/contact → M3 contact function → M4 products/about/legal → M5 blog/SEO → M6 NL review, a11y, deploy docs.
