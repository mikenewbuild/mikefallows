import type { APIRoute } from 'astro';
import { getPosts, newestFirst, postUrl } from '../../lib/posts';
import { feedHtml } from '../../lib/render';
import { escapeXml } from '../../lib/xml';
import { site } from '../../site';

export const GET: APIRoute = async () => {
  const posts = newestFirst(await getPosts());
  const updated = posts[0]?.data.date ?? new Date();

  const entries = await Promise.all(
    posts.map(async (post) => {
      const url = new URL(postUrl(post), site.url).href;
      return `  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${url}"/>
    <updated>${post.data.date.toISOString()}</updated>
    <id>${url}</id>
    <content type="html">${escapeXml(await feedHtml(post, url))}</content>
  </entry>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(site.title)}</title>
  <subtitle>${escapeXml(site.feed.subtitle)}</subtitle>
  <link href="${new URL(site.feed.path, site.url)}" rel="self"/>
  <link href="${site.url}/"/>
  <updated>${updated.toISOString()}</updated>
  <id>${site.url}/</id>
  <author>
    <name>${escapeXml(site.author.name)}</name>
  </author>
${entries.join('\n')}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
