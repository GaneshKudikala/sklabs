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
    icon: z.enum(['cloud', 'life-buoy', 'workflow', 'shield-check', 'bot']),
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

export const collections = { services, products, pages, blog, 'case-studies': caseStudies };
