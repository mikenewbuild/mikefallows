import type { APIRoute } from 'astro';
import { absoluteUrls, getPosts, newestFirst, postUrl } from '../../lib/posts';
import { site } from '../../site';

export const GET: APIRoute = async () => {
  const posts = newestFirst(await getPosts());

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: site.title,
    language: site.language,
    home_page_url: `${site.url}/`,
    feed_url: new URL(site.jsonFeed.path, site.url).href,
    description: site.description,
    authors: [site.author],
    items: posts.map((post) => {
      const url = new URL(postUrl(post), site.url).href;
      return {
        id: url,
        url,
        title: post.data.title,
        summary: post.data.description,
        content_html: absoluteUrls(post.rendered?.html ?? '', url),
        date_published: post.data.date.toISOString(),
        tags: post.data.tags,
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
