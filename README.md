# Mike Fallows

[![Netlify Status](https://api.netlify.com/api/v1/badges/310b72fc-5eae-4ad4-b838-859e6803242b/deploy-status)](https://app.netlify.com/sites/mikefallows/deploys)

The source for [mikefallows.com](https://mikefallows.com/), built with [Astro](https://astro.build/) and deployed on Netlify.

## Development

```
npm install
npm run dev
```

Search is built by [Pagefind](https://pagefind.app/) after a production build, so the dev server shows a notice in its place. Use `npm run build && npm run preview` to try it.

## Writing

Posts live in `src/content/posts` as Markdown. The filename is the URL slug. Frontmatter:

```yaml
title: Post title
description: One line summary.
date: 2025-01-31T09:00:00.000Z
draft: false
tags:
  - shopify
```

A post marked `draft: true`, or dated in the future, appears with a (Draft) label in the dev server and is left out of production builds entirely (pages, archive, tags, feeds, sitemap and search). A future post goes live on the first build after its date.

Standalone pages (About, Uses) live in `src/content/pages`.

## Tests

```
npm test
```

This builds the site and runs smoke tests against `dist` using the Node test runner. They check that every URL from the old Eleventy site still exists, and cover the sitemap, feeds, search index and draft handling. Set `SITE_DIR` to run the output checks against another build.
