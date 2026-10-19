import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkCitations from './src/lib/remark-citations.ts';
import rehypeMathjax from './src/lib/rehype-mathjax.ts';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

/** Permalinks of unlisted posts: they are built, but stay out of the sitemap. */
const unlisted = readdirSync('src/content/posts').flatMap((dir) => {
  const file = ['index.mdx', 'index.md'].map((f) => `src/content/posts/${dir}/${f}`).find(existsSync);
  if (!file) return [];
  const data = parseYaml(readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '') ?? {};
  return data.unlisted ? [data.permalink] : [];
});

export default defineConfig({
  site: 'https://jonascholz.github.io',
  integrations: [mdx(), react(), sitemap({ filter: (page) => !unlisted.some((p) => page.endsWith(p)) })],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkCitations],
      rehypePlugins: [rehypeMathjax],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  // Old Jekyll URLs that moved.
  redirects: {
    '/resume': '/cv/',
    '/wordpress/blog-posts': '/blog/',
  },
  vite: {
    // The MuJoCo package loads its .wasm relative to its own module URL.
    optimizeDeps: { exclude: ['@mujoco/mujoco'] },
  },
});
