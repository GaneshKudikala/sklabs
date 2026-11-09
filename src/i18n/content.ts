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
