import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const references = z
  .array(z.object({ id: z.string(), text: z.string() }))
  .default([]);

/** A post lives in its own folder: `src/content/posts/<date>-<name>/index.mdx` plus its images. */
const posts = defineCollection({
  loader: glob({ pattern: '*/index.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      /** Public URL, kept identical to the old Jekyll site. */
      permalink: z.string().regex(/^\/posts\/.+\/$/),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      references,
      /** Drafts render in `npm run dev` only. */
      draft: z.boolean().default(false),
      /** Built and reachable by its permalink, but left out of every list, the pager and the sitemap. */
      unlisted: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/index.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      permalink: z.string().regex(/^\/projects\/.+\/$/),
      order: z.number(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      references,
      /** Hidden from production builds, like post drafts. */
      draft: z.boolean().default(false),
    }),
});

const publications = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    venue: z.string(),
    paperurl: z.url(),
    permalink: z.string().regex(/^\/publication\/.+\/$/),
  }),
});

export const collections = { posts, projects, publications };
