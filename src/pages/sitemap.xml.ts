import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPosts, htmlDateString, POSTS_PER_PAGE, postUrl, tagList, tagSlug } from '../lib/posts';
import { site } from '../site';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const pages = await getCollection('pages');
  const archivePages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const entries: { path: string; date?: Date }[] = [
    { path: '/' },
    { path: '/search/' },
    { path: '/tags/' },
    ...pages.map((page) => ({ path: `/${page.id}/` })),
    ...posts.map((post) => ({ path: postUrl(post), date: post.data.date })),
    ...Array.from({ length: archivePages }, (_, i) => ({ path: i === 0 ? '/posts/' : `/posts/${i + 1}/` })),
    ...tagList(posts).map((tag) => ({ path: `/tags/${tagSlug(tag)}/` })),
  ];

  const urls = entries.map(
    ({ path, date }) => `  <url>
    <loc>${new URL(path, site.url)}</loc>${date ? `\n    <lastmod>${htmlDateString(date)}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
