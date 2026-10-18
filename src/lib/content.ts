import { getCollection, type CollectionEntry } from 'astro:content';
import Notice from '../components/Notice.astro';
import Diagram from '../components/Diagram.astro';
import Param from '../components/Param.astro';
import Controls from '../components/Controls.astro';
import Show from '../components/Show.astro';
import Video from '../components/Video.astro';
import RobotDemo from '../components/three/RobotDemo.astro';

/** Components every MDX file can use without importing them. */
export const mdxComponents = { Notice, Diagram, Param, Controls, Show, Video, RobotDemo };

/** Published posts, newest first. Drafts are included in `astro dev`. */
export async function getPosts() {
  const posts = await getCollection('posts', (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getProjects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

export async function getPublications() {
  return (await getCollection('publications')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Route param for an entry whose permalink is `/<prefix>/<rest>/`. */
export const routeParam = (permalink: string, prefix: string) =>
  permalink.slice(prefix.length + 2).replace(/\/$/, '');

export function readingTime(entry: CollectionEntry<'posts' | 'projects'>) {
  const words = (entry.body ?? '').replace(/\$\$[\s\S]*?\$\$|<[^>]+>/g, ' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
