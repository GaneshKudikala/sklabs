import en from './en.json';
import nl from './nl.json';

export const locales = ['en', 'nl'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

const dictionaries = { en, nl } satisfies Record<Lang, typeof en>;

export function isLang(value: string | undefined): value is Lang {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Returns the UI dictionary for a language. */
export function useT(lang: Lang) {
  return dictionaries[lang];
}

/** Builds a localized, trailing-slash path: localePath('nl', '/about') -> /nl/about/ */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

/** Strips a leading locale segment from a pathname: /nl/about/ -> /about/ */
export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|nl)(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

export function getStaticLangPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}
