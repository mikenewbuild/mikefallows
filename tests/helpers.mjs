import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');
export const siteDir = resolve(root, process.env.SITE_DIR ?? 'dist');
export const siteUrl = 'https://mikefallows.com';

const postsDir = [join(root, 'src/content/posts'), join(root, 'posts')].find(existsSync);

export function read(path) {
  return readFileSync(join(siteDir, path), 'utf-8');
}

export function exists(path) {
  return existsSync(join(siteDir, path));
}

export function routeFile(route) {
  return route.endsWith('/') ? `${route}index.html` : route;
}

export function decode(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function frontmatter(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (name) =>
    block.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1].trim().replace(/^(['"])(.*)\1$/, '$2');
  return { title: field('title'), date: new Date(field('date')), draft: field('draft') === 'true' };
}

export function posts() {
  return readdirSync(postsDir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => ({ slug: file.replace(/\.mdx?$/, ''), ...frontmatter(readFileSync(join(postsDir, file), 'utf-8')) }));
}

export function publishedPosts() {
  const now = new Date();
  return posts().filter((post) => !post.draft && post.date <= now);
}

export function routes() {
  return readFileSync(join(root, 'tests/fixtures/routes.txt'), 'utf-8').trim().split('\n');
}
