import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { locales, localePath, useT, type Lang } from '../../../i18n';
import { getJobs } from '../../../i18n/content';

export const getStaticPaths = () => locales.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const t = useT(lang);
  const jobs = (await getJobs(lang)).filter((x) => !x.data.sample);
  return rss({
    title: `SK LABS - ${t.jobs.title}`,
    description: t.jobs.description,
    site: context.site!,
    customData: `<language>${lang}</language>`,
    items: jobs.map((x) => ({
      title: x.data.title,
      description: x.data.summary,
      pubDate: x.data.datePosted,
      link: localePath(lang, `jobs/${x.slug}`),
      categories: x.data.specialism,
    })),
  });
}
