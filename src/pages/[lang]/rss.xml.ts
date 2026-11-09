import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { locales, localePath, useT, type Lang } from '../../i18n';
import { getPosts } from '../../i18n/content';

export const getStaticPaths = () => locales.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const t = useT(lang);
  const posts = await getPosts(lang);
  return rss({
    title: `SK LABS - ${t.insights.title}`,
    description: t.insights.description,
    site: context.site!,
    customData: `<language>${lang}</language>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: localePath(lang, `insights/${p.slug}`),
      categories: p.data.tags,
    })),
  });
}
