import type { APIContext } from 'astro';
import { locales, localePath, type Lang } from '../../i18n';
import { getJobs } from '../../i18n/content';

export const getStaticPaths = () => locales.map((lang) => ({ params: { lang } }));

/** Open roles as JSON for job boards and LinkedIn sharing. Closed and sample roles are excluded. */
export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const site = context.site!.origin;
  const jobs = (await getJobs(lang)).filter((x) => !x.data.sample);
  const body = {
    organization: 'SK LABS',
    language: lang,
    jobs: jobs.map((x) => ({
      reference: x.data.reference,
      title: x.data.title,
      url: `${site}${localePath(lang, `jobs/${x.slug}`)}`,
      summary: x.data.summary,
      client: x.data.clientDescriptor,
      location: x.data.location,
      country: x.data.country,
      workModel: x.data.workModel,
      employmentType: x.data.employmentType,
      seniority: x.data.seniority,
      specialism: x.data.specialism,
      datePosted: x.data.datePosted.toISOString().slice(0, 10),
      validThrough: x.data.validThrough?.toISOString().slice(0, 10) ?? null,
      salary: {
        min: x.data.salaryMin,
        max: x.data.salaryMax,
        currency: x.data.currency,
        period: x.data.salaryPeriod,
      },
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
