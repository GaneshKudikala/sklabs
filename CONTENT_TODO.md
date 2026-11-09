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
