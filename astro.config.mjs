import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkCitations from './src/lib/remark-citations.ts';
import rehypeMathjax from './src/lib/rehype-mathjax.ts';

export default defineConfig({
  site: 'https://jonascholz.github.io',
  integrations: [mdx(), react(), sitemap()],
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
