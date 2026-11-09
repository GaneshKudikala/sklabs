import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import en from '../../src/i18n/en.json';
import nl from '../../src/i18n/nl.json';

const shape = (v: unknown, path = ''): string[] =>
  Array.isArray(v)
    ? [
        `${path}[${v.length}]`,
        ...v.flatMap((x, i) => (typeof x === 'object' ? shape(x, `${path}[${i}]`) : [])),
      ]
    : v && typeof v === 'object'
      ? Object.entries(v).flatMap(([k, x]) => shape(x, path ? `${path}.${k}` : k))
      : [path];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

describe('translations', () => {
  it('UI string keys and list lengths match between EN and NL', () => {
    expect(shape(nl).sort()).toEqual(shape(en).sort());
  });

  for (const collection of ['services', 'products', 'pages', 'blog', 'jobs']) {
    it(`every EN ${collection} file has an NL counterpart and vice versa`, () => {
      const base = join('src/content', collection);
      const files = (lang: string) =>
        walk(join(base, lang))
          .map((p) => relative(join(base, lang), p))
          .sort();
      expect(files('nl')).toEqual(files('en'));
    });
  }

  it('NL content files are flagged draft until reviewed', () => {
    const offenders = ['services', 'products', 'pages', 'blog', 'jobs'].flatMap((c) =>
      walk(join('src/content', c, 'nl')).filter(
        (p) => p.endsWith('.md') && !/^draft:\s*true/m.test(readFileSync(p, 'utf8')),
      ),
    );
    // Remove a file from review by deleting its `draft: true` line; this test then lists it.
    expect(offenders).toEqual([]);
  });
});
