import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { render } from 'astro:content';
import type { Post } from './posts';

let container: AstroContainer | undefined;
const cache = new Map<string, string>();

/** A post's body as HTML. MDX entries are not pre-rendered, so they go through the container API. */
export async function postHtml(post: Post) {
  if (post.rendered?.html) return post.rendered.html;

  if (!cache.has(post.id)) {
    container ??= await AstroContainer.create({
      renderers: await loadRenderers([getContainerRenderer()]),
    });
    const { Content } = await render(post);
    cache.set(post.id, await container.renderToString(Content));
  }
  return cache.get(post.id)!;
}

/** Post HTML for feeds: absolute URLs, and no demo styles or scripts, which readers strip or mangle. */
export async function feedHtml(post: Post, base: string) {
  const html = (await postHtml(post))
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/g, '')
    .replace(/ data-astro-cid-[\w-]+(="[^"]*")?/g, '');
  return html.replace(
    /(href|src)="(?!#)([^"]+)"/g,
    (_, attr, url) => `${attr}="${new URL(url, base)}"`,
  );
}
