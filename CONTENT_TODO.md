# Content TODO

Every `[PLACEHOLDER]` that needs real content. Updated each milestone.

| Token                                       | Where                                           | Notes                                                 |
| ------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `[HERO_SUBTEXT]`                            | `src/i18n/en.json`, `nl.json` (`home.heroLead`) | One or two sentences under the hero headline          |
| `[PRODUCT_1]`, `[PRODUCT_2]`, `[PRODUCT_3]` | `src/content/products` (M4)                     | Names pending; all shown as "Coming soon"             |
| `[CAL_LINK]`                                | Contact page, header CTA (M2)                   | Booking URL                                           |
| `[KVK]`, `[VAT]`, `[ADDRESS]`               | Imprint (M4)                                    | Company registration details                          |
| Logo                                        | `src/components/Wordmark.astro`                 | Placeholder SVG wordmark                              |
| NL copy                                     | All `nl` content                                | Machine-drafted, marked `draft: true` for review (M6) |

## Setup tasks (not content)

- Create a Resend account, verify sklabs.nl, create `RESEND_API_KEY`
- Create a Cloudflare Turnstile widget for sklabs.nl: set `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET`
- Set `CONTACT_TO_EMAIL` (and optionally `CONTACT_FROM_EMAIL`) in Cloudflare Pages
- Optional: create a KV namespace bound as `RATE_LIMIT`, and a WAF rate-limit rule on `/api/contact`

## Dutch review (M6)

All NL files carry `draft: true` and show a "draft translation" notice. For each file you approve, delete the `draft: true` line (the unit test `i18n-parity` will then list it as an offender; update the test to an allowlist or remove that check once the review is finished). Files to review: `src/i18n/nl.json`, `src/content/{services,products,pages,blog}/nl/**`.

## Before launch checklist

- Replace every `[PLACEHOLDER]` above (search the repo for `\[[A-Z_0-9]+\]`)
- Replace the wordmark in `src/components/Wordmark.astro` and `public/favicon.svg` (also used as the Organization logo in JSON-LD; consider a PNG logo of at least 112x112 for search engines)
- Have the legal pages reviewed
- Complete the Cloudflare, Resend and Turnstile steps in the README
- Add case studies to `src/content/case-studies/{en,nl}` when you have real ones (the Work nav item stays hidden until then)
