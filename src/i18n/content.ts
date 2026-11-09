import { getCollection, getEntry } from 'astro:content';
import type { Lang } from './index';

/** Services for a language, ordered. Slug is the file name shared across languages. */
export async function getServices(lang: Lang) {
  const all = await getCollection('services', (e) => e.id.startsWith(`${lang}/`));
  return all
    .map((e) => ({ slug: e.id.split('/')[1], ...e }))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getProducts(lang: Lang) {
  const all = await getCollection('products', (e) => e.id.startsWith(`${lang}/`));
  return all
    .map((e) => ({ slug: e.id.split('/')[1], ...e }))
    .sort((a, b) => a.data.order - b.data.order);
}

/** A page from src/content/pages, e.g. getPage('en', 'about') or getPage('nl', 'legal/privacy'). */
export async function getPage(lang: Lang, key: string) {
  return getEntry('pages', `${lang}/${key}`);
}

/** Posts for a language, newest first. Posts with draft: true (NL review drafts) stay visible and show a notice. */
export async function getPosts(lang: Lang) {
  const all = await getCollection('blog', (e) => e.id.startsWith(`${lang}/`));
  return all
    .map((e) => ({ slug: e.id.split('/')[1], ...e }))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const tagSlug = (tag: string) =>
  tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// import.meta.glob lets us skip getCollection (which warns on every call) while the folder is empty.
const caseStudyFiles = Object.keys(import.meta.glob('/src/content/case-studies/**/*.md'));

export async function getCaseStudies(lang: Lang) {
  if (caseStudyFiles.length === 0) return [];
  const all = await getCollection('case-studies', (e) => e.id.startsWith(`${lang}/`));
  return all
    .map((e) => ({ slug: e.id.split('/')[1], ...e }))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

const jobFiles = Object.keys(import.meta.glob('/src/content/jobs/**/*.md'));

/** Sample roles show in dev and when INCLUDE_SAMPLE_JOBS=true (previews, tests); never in production. */
export const showSampleJobs = () =>
  import.meta.env.DEV ||
  (typeof process !== 'undefined' && process.env.INCLUDE_SAMPLE_JOBS === 'true');

export const isJobClosed = (d: { status: string; validThrough?: Date }, now = new Date()) =>
  d.status === 'closed' || (!!d.validThrough && d.validThrough < now);

/** Jobs for a language, newest first. Each has `closed`. Closed roles are excluded unless includeClosed. */
export async function getJobs(lang: Lang, opts: { includeClosed?: boolean; now?: Date } = {}) {
  if (jobFiles.length === 0) return [];
  const now = opts.now ?? new Date();
  const all = await getCollection('jobs', (e) => e.id.startsWith(`${lang}/`));
  return all
    .filter((e) => showSampleJobs() || !e.data.sample)
    .map((e) => ({ slug: e.id.split('/')[1], closed: isJobClosed(e.data, now), ...e }))
    .filter((e) => opts.includeClosed || !e.closed)
    .sort((a, b) => b.data.datePosted.valueOf() - a.data.datePosted.valueOf());
}

export function formatSalary(
  d: { salaryMin: number; salaryMax: number; currency: string; salaryPeriod: string },
  lang: Lang,
  per: Record<string, string>,
) {
  const f = new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    style: 'currency',
    currency: d.currency,
    maximumFractionDigits: 0,
  });
  return `${f.format(d.salaryMin)} - ${f.format(d.salaryMax)} ${per[d.salaryPeriod]}`;
}
