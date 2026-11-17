import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import site from '../../src/content/site.json';

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) =>
    statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)],
  );

describe('company details', () => {
  it('KVK is an 8-digit number', () => {
    expect(site.kvk).toMatch(/^\d{8}$/);
  });

  it('every KVK number written in content matches site.json', () => {
    const found = walk('src/content')
      .filter((f) => f.endsWith('.md') || f.endsWith('.json'))
      .flatMap((f) =>
        [...readFileSync(f, 'utf8').matchAll(/KVK[^0-9\n]{0,30}(\d{8})/g)].map((m) => [f, m[1]]),
      );
    expect(found.length).toBeGreaterThan(0);
    for (const [file, number] of found) expect(number, file).toBe(site.kvk);
  });

  it('no [LEGAL_NAME] or [KVK] placeholders remain', () => {
    const offenders = walk('src/content')
      .filter((f) => f.endsWith('.md'))
      .filter((f) => /\[(LEGAL_NAME|KVK)\]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('feature flags', () => {
  it('jobs, hire and products are off by default', async () => {
    const saved = process.env.FEATURES_ALL;
    delete process.env.FEATURES_ALL;
    const { features, langPathsIf } = await import('../../src/lib/features?default');
    expect(features).toEqual({ jobs: false, hire: false, products: false });
    expect(langPathsIf('jobs')()).toEqual([]);
    if (saved) process.env.FEATURES_ALL = saved;
  });
});
