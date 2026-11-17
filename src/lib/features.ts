import site from '../content/site.json';

/**
 * Feature switches live in src/content/site.json ("features"). A disabled feature is not built at all:
 * no pages, nav links, sitemap entries, feeds or OG images. Set FEATURES_ALL=true to build everything
 * (used by the test suite and for local previews).
 */
const all = typeof process !== 'undefined' && process.env.FEATURES_ALL === 'true';

export const features = {
  jobs: all || site.features.jobs,
  hire: all || site.features.hire,
  products: all || site.features.products,
};
export type Feature = keyof typeof features;

/** getStaticPaths helper for [lang] routes that only exist while a feature is on. */
export const langPathsIf = (feature: Feature) => () =>
  features[feature] ? (['en', 'nl'] as const).map((lang) => ({ params: { lang } })) : [];
