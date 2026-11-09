import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.array(z.object({ q: z.string(), a: z.string() }));

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string(),
    icon: z.enum(['cloud', 'life-buoy', 'workflow', 'shield-check', 'bot', 'users']),
    order: z.number(),
    draft: z.boolean().default(false),
    problem: z.string(),
    whatWeDo: z.array(z.string()),
    deliverables: z.array(z.string()),
    engagement: z.object({ assessment: z.string(), project: z.string(), retainer: z.string() }),
    faq,
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'beta', 'coming-soon']),
    order: z.number(),
    draft: z.boolean().default(false),
    problem: z.string(),
    features: z.array(z.string()),
    url: z.url().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().default(false),
    updated: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    author: z.string().default('SK LABS'),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    client: z.string(), // use "[CLIENT]" until the client has approved being named
    sector: z.string(),
    date: z.coerce.date(),
    challenge: z.string(),
    solution: z.string(),
    outcomes: z.array(z.string()),
    services: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const jobs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jobs' }),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      reference: z.string(),
      status: z.enum(['open', 'closed']).default('open'),
      datePosted: z.coerce.date(),
      validThrough: z.coerce.date().optional(),
      employmentType: z.enum(['FULL_TIME', 'CONTRACTOR', 'PART_TIME']),
      seniority: z.enum(['junior', 'medior', 'senior', 'lead']),
      specialism: z
        .array(z.enum(['cloud', 'devops', 'sre', 'security', 'data-ai', 'other']))
        .min(1),
      location: z.string(), // city, or "[LOCATION]" until known
      country: z.string().length(2).default('NL'), // ISO 3166-1 alpha-2
      workModel: z.enum(['onsite', 'hybrid', 'remote']),
      // Pay transparency: both are required, so the build fails if they are missing.
      salaryMin: z.number().positive(),
      salaryMax: z.number().positive(),
      currency: z.string().length(3).default('EUR'),
      salaryPeriod: z.enum(['YEAR', 'MONTH', 'HOUR', 'DAY']),
      clientDescriptor: z.string(), // anonymised, e.g. "Fintech scale-up"
      recruiter: z.object({ name: z.string(), email: z.string() }),
      tags: z.array(z.string()).default([]),
      responsibilities: z.array(z.string()),
      requirements: z.array(z.string()),
      niceToHave: z.array(z.string()).default([]),
      offered: z.array(z.string()).default([]),
      sample: z.boolean().default(false), // sample roles are hidden in production builds
      draft: z.boolean().default(false),
    })
    .refine((j) => j.salaryMax >= j.salaryMin, {
      message: 'salaryMax must be >= salaryMin',
      path: ['salaryMax'],
    }),
});

export const collections = {
  jobs,
  services,
  products,
  pages,
  blog,
  'case-studies': caseStudies,
};
