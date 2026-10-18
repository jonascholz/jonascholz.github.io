import type { APIRoute } from 'astro';
import { stylesheet } from '../../lib/mathjax';

export const GET: APIRoute = () => new Response(stylesheet(), { headers: { 'Content-Type': 'text/css' } });
