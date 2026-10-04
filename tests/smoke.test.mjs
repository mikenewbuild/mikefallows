import { test } from 'node:test';
import assert from 'node:assert/strict';
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

test('every page has a title, description and canonical URL', () => {
  for (const route of pageRoutes) {
    const html = read(routeFile(route));
    assert.match(html, /<title>[^<]+<\/title>/, `${route} title`);
    assert.match(html, /<meta name="description" content="[^"]+"/, `${route} description`);
    assert.ok(html.includes(`rel="canonical" href="${siteUrl}${route}"`), `${route} canonical`);
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
  for (const item of json.items) assert.ok(item.content_html.length > 0, `${item.url} has content`);
});

test('search index is built', () => {
  assert.ok(exists('pagefind/pagefind.js'));
  assert.ok(exists('pagefind/pagefind-ui.js'));
  assert.match(read('search/index.html'), /pagefind-ui\.js/);
});
