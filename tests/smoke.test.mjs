import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { decode, exists, publishedPosts, read, routeFile, routes, siteUrl } from './helpers.mjs';

const pageRoutes = routes().filter((route) => route !== '/404.html');

test('every route from the Eleventy site still exists', () => {
  const missing = routes().filter((route) => !exists(routeFile(route)));
  assert.deepEqual(missing, []);
});

test('every published post has a page with its title and date', () => {
  for (const post of publishedPosts()) {
    const html = decode(read(`posts/${post.slug}/index.html`));
    assert.ok(html.includes(`>${post.title}</h1>`), `${post.slug} title`);
    assert.match(html, /<time datetime="\d{4}-\d{2}-\d{2}"/, `${post.slug} date`);
  }
});

test('production output has no drafts, CMS or template leftovers', () => {
  assert.ok(!exists('admin'), 'admin/ should not be published');
  assert.ok(!exists('tina'), 'tina/ should not be published');
  for (const route of routes()) {
    const html = read(routeFile(route));
    assert.ok(!html.includes('(Draft)'), `${route} shows a draft label`);
    assert.doesNotMatch(html, /\{%-?\s*(raw|endraw|include)\b/, `${route} leaks a Nunjucks tag`);
  }
});

test('home page lists latest and popular posts', () => {
  const html = read('index.html');
  assert.match(html, /Latest writing/);
  assert.match(html, /Popular posts/);
  const newest = publishedPosts().sort((a, b) => b.date - a.date)[0];
  assert.ok(html.includes(`/posts/${newest.slug}/`), 'newest post is linked');
  const popular = html.slice(html.indexOf('Popular posts'));
  const featured = publishedPosts().filter((post) => post.featured);
  assert.ok(featured.length > 0, 'some posts are featured');
  for (const post of featured) assert.ok(popular.includes(`/posts/${post.slug}/`), `${post.slug} is in popular posts`);
});

test('archive is paginated six to a page', () => {
  const html = read('posts/index.html');
  const links = new Set(html.match(/href="\/posts\/[a-z][a-z0-9-]*\/"/g));
  assert.equal(links.size, 6);
  assert.match(html, /href="\/posts\/2\/"/);
});

test('tag pages list their posts', () => {
  const html = read('tags/shopify/index.html');
  assert.match(html, /Tagged “shopify”/);
  assert.ok(html.includes('/posts/responsive-images-in-shopify-themes/'));
  assert.match(read('tags/index.html'), /href="\/tags\/shopify\/"/);
});

test('markdown features render: heading anchors, footnotes, highlighting, inline demos', () => {
  const post = read('posts/making-this-website/index.html');
  assert.match(post, /<h3 id="low-cost"[^>]*>.*class="direct-link" href="#low-cost"/);
  assert.match(post, /class="footnote-ref"/);
  assert.match(post, /class="footnotes/);

  const code = read('posts/hello-world-with-lit/index.html');
  assert.match(code, /<pre class="(language-html|astro-code[^"]*)"/);
  assert.match(code, /<span class="token|<span style="[^"]*--shiki/);

  assert.match(read('posts/adding-an-svg-favicon-with-dark-mode-support/index.html'), /id="alien-demo"/);
  assert.match(read('posts/implement-a-low-stock-notice-a-shopify-theme/index.html'), /id="low-stock-demo"/);
});

test('every code block language is recognised and diff notation renders', () => {
  for (const route of routes()) {
    assert.doesNotMatch(read(routeFile(route)), /data-language="plaintext"/, `${route} has an unrecognised language`);
  }
  const html = read('posts/adding-an-svg-favicon-with-dark-mode-support/index.html');
  assert.match(html, /class="line diff remove"/);
  assert.match(html, /class="line diff add"/);
  assert.doesNotMatch(html, /\[!code/);

  const plainText = '#24292E';
  const selectors = [...html.matchAll(/style="color:(#[0-9A-F]{6})[^"]*">([^<]*polyline[^<]*)</gi)];
  assert.ok(selectors.length > 0, 'the SVG listings contain CSS');
  for (const [, colour, text] of selectors) {
    assert.notEqual(colour.toUpperCase(), plainText, `CSS inside an SVG listing is highlighted: ${text.trim()}`);
  }
});

test('footnote back arrows use the text presentation of the glyph', () => {
  assert.match(read('posts/making-this-website/index.html'), /class="[^"]*footnote-backref[^"]*">\u21A9\uFE0E<\/a>/);
});

test('borders default to the colour the prose uses for its rules', () => {
  const css = readdirSync(`${process.env.SITE_DIR ?? 'dist'}/_astro`)
    .filter((file) => file.endsWith('.css'))
    .map((file) => read(`_astro/${file}`))
    .join('');
  const variable = (name) => css.match(new RegExp(`${name}:([^;}]+)`))?.[1];
  const border = css.match(/\*,:after,:before,::backdrop\{border-color:var\((--[\w-]+)\)\}/)?.[1];
  assert.ok(border, 'a default border colour is set');
  assert.equal(variable(border), css.match(/\.prose-stone\{[^}]*--tw-prose-hr:([^;}]+)/)?.[1]);
});

test('update notes render above posts, link within the page and reach the feeds', () => {
  const css = read('posts/optimising-css-minification-in-liquid/index.html');
  assert.match(css, /<div class="note"><p><strong>Update, 22 September 2025:<\/strong> <a href="https:\/\/ellodave\.dev\//);

  for (const post of publishedPosts()) {
    const html = read(`posts/${post.slug}/index.html`);
    const notes = [...html.matchAll(/<div class="note">([\s\S]*?)<\/div>/g)].map((m) => m[1]).join('');
    for (const [, id] of notes.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(html.includes(`id="${id}"`), `${post.slug} note links to missing #${id}`);
    }
  }

  const item = JSON.parse(read('feed/feed.json')).items.find((i) => i.url.endsWith('/optimising-css-minification-in-liquid/'));
  assert.match(item.content_html, /^<div class="note"><p><strong>Update, 22 September 2025:/);
  assert.match(read('feed/feed.xml'), /&lt;strong&gt;Update, 22 September 2025:/);
});

test('headings have clean ids and keep their Eleventy ids as aliases', () => {
  const html = read('posts/responsive-images-in-shopify-themes/index.html');
  assert.match(html, /<h2 id="tldr"[^>]*><span id="tl%3Bdr"><\/span>/);
});

test('inline separators keep their surrounding spaces', () => {
  const home = read('index.html');
  assert.match(home, /Search<\/a> • <a/);
  assert.match(home, /about <a href="\/tags\/[^"]+\/">/);

  const post = read('posts/making-this-website/index.html');
  assert.match(post, /<\/time> • \d+ min/);
  assert.match(post, /Tagged<\/span> • <a/);
});

test('every page has one h1 and the main nav marks the current page', () => {
  for (const route of routes()) {
    assert.equal(read(routeFile(route)).match(/<h1[\s>]/g)?.length, 1, `${route} h1 count`);
  }
  assert.match(read('about/index.html'), /<nav aria-label="Main">[\s\S]*href="\/about\/" aria-current="page"/);
});

test('every page has a title, description, canonical URL and Open Graph tags', () => {
  for (const route of pageRoutes) {
    const html = read(routeFile(route));
    assert.match(html, /<title>[^<]+<\/title>/, `${route} title`);
    assert.match(html, /<meta name="description" content="[^"]+"/, `${route} description`);
    assert.ok(html.includes(`rel="canonical" href="${siteUrl}${route}"`), `${route} canonical`);
    assert.ok(html.includes(`property="og:url" content="${siteUrl}${route}"`), `${route} og:url`);
    assert.match(html, /<meta property="og:title" content="[^"]+"/, `${route} og:title`);
  }
});

test('stylesheets, scripts and preloaded fonts referenced by the home page exist', () => {
  const html = read('index.html');
  const assets = [...html.matchAll(/(?:href|src)="(\/[^"]+\.(?:css|js|woff2))"/g)].map((m) => m[1]);
  assert.ok(assets.some((asset) => asset.endsWith('.css')), 'a stylesheet is linked');
  for (const asset of assets) assert.ok(exists(asset), `${asset} missing`);
});

test('sitemap lists every page and nothing else', () => {
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(siteUrl, '')).sort();
  assert.deepEqual(locs, [...pageRoutes].sort());
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${siteUrl}/sitemap.xml`));
});

test('Atom and JSON feeds contain every published post', () => {
  const count = publishedPosts().length;
  const atom = read('feed/feed.xml');
  assert.match(atom, /<feed xmlns="http:\/\/www.w3.org\/2005\/Atom">/);
  assert.equal(atom.match(/<entry>/g).length, count);

  const json = JSON.parse(read('feed/feed.json'));
  assert.equal(json.items.length, count);
  for (const item of json.items) {
    assert.ok(item.content_html.length > 0, `${item.url} has content`);
    assert.doesNotMatch(item.content_html, /<style|<script|data-astro-cid/, `${item.url} carries demo styles or scripts`);
  }
  assert.doesNotMatch(atom, /&lt;style|&lt;script|data-astro-cid/);
});

test('search index is built', () => {
  assert.ok(exists('pagefind/pagefind.js'));
  assert.ok(exists('pagefind/pagefind-ui.js'));
  assert.match(read('search/index.html'), /pagefind-ui\.js/);
});
