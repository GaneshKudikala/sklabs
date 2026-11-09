/** JSON-LD builders. Never emit invented data: skip fields we do not have. */
const SITE = 'https://sklabs.nl';
const ORG_ID = `${SITE}/#organization`;

export const isPlaceholder = (v?: string) => !v || v.trim().startsWith('[');

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'SK LABS',
  url: SITE,
  logo: `${SITE}/favicon.svg`,
  address: { '@type': 'PostalAddress', addressCountry: 'NL' },
});

export const professionalService = (description: string, lang: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE}/#professionalservice`,
  name: 'SK LABS',
  url: `${SITE}/${lang}/`,
  description,
  parentOrganization: { '@id': ORG_ID },
  areaServed: [
    { '@type': 'Country', name: 'Netherlands' },
    { '@type': 'Place', name: 'European Union' },
  ],
  address: { '@type': 'PostalAddress', addressCountry: 'NL' },
});

export const service = (name: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url,
  serviceType: name,
  provider: { '@id': ORG_ID },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
});

export const faqPage = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.q,
    acceptedAnswer: { '@type': 'Answer', text: i.a },
  })),
});

export const breadcrumbs = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});

export const softwareApplication = (
  name: string,
  description: string,
  url: string,
  appUrl?: string,
) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name,
  description,
  url,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  publisher: { '@id': ORG_ID },
  ...(appUrl ? { installUrl: appUrl } : {}),
});

export const blogPosting = (p: {
  title: string;
  description: string;
  url: string;
  image: string;
  date: Date;
  author: string;
  lang: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: p.title,
  description: p.description,
  url: p.url,
  image: p.image,
  datePublished: p.date.toISOString(),
  inLanguage: p.lang,
  author: { '@type': 'Organization', name: p.author },
  publisher: { '@id': ORG_ID },
});
