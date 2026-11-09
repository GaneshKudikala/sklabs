// Used by astro.config.mjs: job pages that must not be in the sitemap (closed, expired or sample roles).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function excludedJobPaths(now = new Date()) {
  const out = new Set();
  for (const lang of ['en', 'nl']) {
    const dir = join('src/content/jobs', lang);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
      const fm = (readFileSync(join(dir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/) ?? [])[1] ?? '';
      const get = (k) => (fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) ?? [])[1]?.trim();
      const until = get('validThrough');
      const closed = get('status') === 'closed' || (until && new Date(until) < now);
      const sample = get('sample') === 'true';
      if (closed || sample) out.add(`/${lang}/jobs/${f.replace(/\.md$/, '')}/`);
    }
  }
  return out;
}
