// Run after a default `pnpm build` (no FEATURES_ALL). Verifies disabled features leave no trace in dist/
// and that the KVK number is on the site. Exits 1 on any failure.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const site = JSON.parse(readFileSync('src/content/site.json', 'utf8'));
const errors = [];
const walk = (d) =>
  readdirSync(d).flatMap((f) =>
    statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)],
  );
const dist = 'dist';
if (!existsSync(dist)) {
  console.error('dist/ not found. Run pnpm build first.');
  process.exit(1);
}

const off = Object.entries(site.features)
  .filter(([, on]) => !on)
  .map(([k]) => k);
for (const feature of off) {
  for (const lang of ['en', 'nl']) {
    const dir = feature === 'hire' ? join(dist, lang, 'hire') : join(dist, lang, feature);
    if (existsSync(dir)) errors.push(`${feature} is off but ${dir} exists`);
  }
  if (feature === 'jobs')
    for (const f of ['en/jobs.json', 'nl/jobs.json'])
      if (existsSync(join(dist, f))) errors.push(`${f} exists`);
  if (
    feature === 'hire' &&
    walk(dist).some(
      (f) => /services[\\/](en|nl)?.*talent-recruitment/.test(f) || /talent-recruitment/.test(f),
    )
  )
    errors.push('talent-recruitment service page exists while hire is off');
}

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const hrefRe = (feature) => new RegExp(`href="/(en|nl)/${feature === 'hire' ? 'hire' : feature}/`);
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  for (const feature of off)
    if (hrefRe(feature).test(html)) errors.push(`${f} links to /${feature}/`);
}
const sitemap = walk(dist)
  .filter((f) => /sitemap.*\.xml$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
for (const feature of off)
  if (new RegExp(`/(en|nl)/${feature}/`).test(sitemap)) errors.push(`sitemap lists /${feature}/`);
if (off.includes('hire') && /talent-recruitment/.test(sitemap))
  errors.push('sitemap lists the talent-recruitment service');
for (const feature of off) {
  const ogDir = join(dist, 'og', 'en');
  if (
    existsSync(ogDir) &&
    readdirSync(ogDir).some((f) => f.startsWith(`${feature}--`) || f === `${feature}.png`)
  )
    errors.push(`OG images exist for ${feature}`);
}

for (const lang of ['en', 'nl']) {
  const home = join(dist, lang, 'index.html');
  const html = existsSync(home) ? readFileSync(home, 'utf8') : '';
  if (!html.includes(`KVK ${site.kvk}`))
    errors.push(`${lang} home footer is missing "KVK ${site.kvk}"`);
}
const imprint = join(dist, 'en', 'legal', 'imprint', 'index.html');
if (!existsSync(imprint) || !readFileSync(imprint, 'utf8').includes(site.kvk))
  errors.push('imprint is missing the KVK number');

if (errors.length) {
  console.error(`check-hidden failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`check-hidden ok: ${off.join(', ') || 'nothing'} hidden; KVK ${site.kvk} present.`);
