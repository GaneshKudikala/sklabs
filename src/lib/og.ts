import { locales, useT, type Lang } from '../i18n';
import {
  getServices,
  getProducts,
  getPosts,
  getPage,
  getCaseStudies,
  getJobs,
} from '../i18n/content';

export type OgEntry = {
  lang: Lang;
  slug: string;
  title: string;
  description: string;
};

/** URL slug used for an OG image: '/en/services/x/' -> 'services--x', home -> 'home'. */
export function ogSlug(pathname: string): string {
  const rest = pathname.replace(/^\/(en|nl)(?=\/|$)/, '').replace(/^\/+|\/+$/g, '');
  return rest ? rest.replace(/\//g, '--') : 'home';
}

/** Every page that gets a generated OG image. */
export async function ogEntries(): Promise<OgEntry[]> {
  const out: OgEntry[] = [];
  for (const lang of locales) {
    const t = useT(lang);
    out.push(
      { lang, slug: 'home', title: t.home.title, description: t.home.description },
      { lang, slug: 'services', title: t.services.title, description: t.services.description },
      { lang, slug: 'products', title: t.products.title, description: t.products.description },
      { lang, slug: 'careers', title: t.careers.title, description: t.careers.description },
      { lang, slug: 'insights', title: t.insights.title, description: t.insights.description },
      { lang, slug: 'contact', title: t.contact.title, description: t.contact.description },
    );
    for (const key of ['about', 'legal/privacy', 'legal/cookies', 'legal/terms', 'legal/imprint']) {
      const page = await getPage(lang, key);
      if (page)
        out.push({
          lang,
          slug: key.replace('/', '--'),
          title: page.data.title,
          description: page.data.description,
        });
    }
    for (const s of await getServices(lang))
      out.push({
        lang,
        slug: `services--${s.slug}`,
        title: s.data.title,
        description: s.data.summary,
      });
    for (const p of await getProducts(lang))
      out.push({
        lang,
        slug: `products--${p.slug}`,
        title: p.data.name,
        description: p.data.tagline,
      });
    for (const j of await getJobs(lang))
      out.push({
        lang,
        slug: `careers--${j.slug}`,
        title: j.data.title,
        description: j.data.summary,
      });
    const work = await getCaseStudies(lang);
    if (work.length)
      out.push({ lang, slug: 'work', title: t.work.title, description: t.work.description });
    for (const w of work)
      out.push({ lang, slug: `work--${w.slug}`, title: w.data.title, description: w.data.summary });
    for (const p of await getPosts(lang))
      out.push({
        lang,
        slug: `insights--${p.slug}`,
        title: p.data.title,
        description: p.data.description,
      });
  }
  return out;
}
