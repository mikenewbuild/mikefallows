import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { render } from 'astro:content';
import { longDate, type Post } from './posts';

let container: AstroContainer | undefined;
let markdown: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;
const cache = new Map<string, string>();

/** MDX entries are not pre-rendered, so they go through the container API. */
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

export async function updatesHtml(post: Post) {
  markdown ??= await createMarkdownProcessor();
  const notes = await Promise.all(
    post.data.updates.map(async ({ date, note }) => {
      const { code } = await markdown!.render(
        `**Update, ${longDate(date)}:** ${note}`,
      );
      return `<div class="note">${code}</div>`;
    }),
  );
  return notes.join('');
}

/** Feed readers strip or mangle styles and scripts, so demos lose theirs. */
export async function feedHtml(post: Post, base: string) {
  const html = ((await updatesHtml(post)) + (await postHtml(post)))
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/g, '')
    .replace(/ data-astro-cid-[\w-]+(="[^"]*")?/g, '');
  return html.replace(
    /(href|src)="(?!#)([^"]+)"/g,
    (_, attr, url) => `${attr}="${new URL(url, base)}"`,
  );
}
