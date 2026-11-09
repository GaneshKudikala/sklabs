# Job posting template

Copy to `src/content/jobs/en/<slug>.md` (or `nl/`). The file name is the URL slug. All fields below are checked at build time; **`salaryMin` and `salaryMax` are required** (EU pay transparency), so the build fails without them.

```md
---
title: Senior AWS DevOps Engineer
summary: One or two sentences shown in listings and search results.
reference: SKL-2026-014 # your internal reference
status: open # open | closed
datePosted: 2026-11-01
validThrough: 2027-01-31 # optional; after this date the role is shown as closed on the next build
employmentType: FULL_TIME # FULL_TIME | CONTRACTOR | PART_TIME
seniority: senior # junior | medior | senior | lead
specialism: [devops, cloud] # cloud | devops | sre | security | data-ai | other
location: Amsterdam
country: NL # ISO 3166-1 alpha-2
workModel: hybrid # onsite | hybrid | remote
salaryMin: 75000
salaryMax: 95000
currency: EUR
salaryPeriod: YEAR # YEAR | MONTH | DAY | HOUR
clientDescriptor: Fintech scale-up # anonymised; never name a client without approval
recruiter:
  name: Recruiter Name
  email: recruiter@sklabs.nl
tags: [AWS, Terraform]
responsibilities:
  - ...
requirements:
  - ...
niceToHave:
  - ...
offered:
  - ...
sample: false # true = hidden in production builds
---
```

Writing guidelines: use gender-neutral wording (run `pnpm lint:jobs`), state a real salary or rate range, never ask candidates for their current or previous salary, and do not invent client details.

To close a role, set `status: closed` (or let `validThrough` pass). It then disappears from the listing, feeds and sitemap, and its page shows a "This role is closed" banner. Because the site is static, a rebuild applies the change.
