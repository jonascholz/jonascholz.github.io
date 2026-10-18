import type { APIRoute, GetStaticPaths } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

/** Serves MathJax's TeX web fonts straight from the npm package. */
const dir = path.join(
  path.dirname(createRequire(import.meta.url).resolve('mathjax-full/package.json')),
  'es5/output/chtml/fonts/woff-v2',
);

export const getStaticPaths: GetStaticPaths = async () =>
  (await readdir(dir)).filter((f) => f.endsWith('.woff')).map((font) => ({ params: { font } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(await readFile(path.join(dir, params.font!)), { headers: { 'Content-Type': 'font/woff' } });
