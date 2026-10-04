import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/** Read by the publish-scheduled Netlify function to decide when to rebuild. */
export const GET: APIRoute = async () => {
  const now = new Date();
  const upcoming = (await getCollection('posts'))
    .filter((post) => !post.data.draft && post.data.date > now)
    .map((post) => post.data.date)
    .sort((a, b) => a.valueOf() - b.valueOf());

  return new Response(JSON.stringify({ next: upcoming[0]?.toISOString() ?? null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
