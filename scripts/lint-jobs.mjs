// Warns about gendered or coded wording in job postings. Warnings only; it never fails the build.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const words = JSON.parse(readFileSync(new URL('./gendered-words.json', import.meta.url), 'utf8'));
const walk = (d) =>
  readdirSync(d).flatMap((f) =>
    statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)],
  );
let warnings = 0;
for (const lang of ['en', 'nl']) {
  const dir = join('src/content/jobs', lang);
  for (const file of walk(dir).filter((f) => f.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8').replace(/^---[\s\S]*?\n---\n?/, (fm) => fm); // lint whole file, front matter included
    const lines = text.split('\n');
    for (const w of words[lang]) {
      const re = new RegExp(
        `(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`,
        'iu',
      );
      lines.forEach((line, i) => {
        if (re.test(line)) {
          warnings++;
          console.log(
            `::warning file=${file},line=${i + 1}::Gendered or coded wording: "${w}". Prefer neutral wording.`,
          );
        }
      });
    }
  }
}
console.log(`lint:jobs finished with ${warnings} warning(s).`);
