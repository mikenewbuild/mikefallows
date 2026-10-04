import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const POSTS_PER_PAGE = 6;

export function isPublished(post: Post, now = new Date()) {
  return !post.data.draft && post.data.date <= now;
}

/** Oldest first. Drafts and future posts are only included by the dev server. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (post) => import.meta.env.DEV || isPublished(post));
  return posts.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
}

export function newestFirst(posts: Post[]) {
  return [...posts].reverse();
}

export function postUrl(post: Post) {
  return `/posts/${post.id}/`;
}

export function tagSlug(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-');
}

export function tagList(posts: Post[]) {
  return [...new Set(posts.flatMap((post) => post.data.tags))].sort((a, b) => a.localeCompare(b));
}

const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' });
const month = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' });

export function longDate(date: Date) {
  return `${date.getUTCDate()} ${month.format(date)} ${date.getUTCFullYear()}`;
}

export function readableDate(date: Date) {
  return `${weekday.format(date)}, ${longDate(date)}`;
}

export function htmlDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function timeToRead(html: string) {
  const words = html
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 180))} min`;
}
