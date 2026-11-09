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
