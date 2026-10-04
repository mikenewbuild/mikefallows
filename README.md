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
featured: false
tags:
  - shopify
```

A post marked `draft: true`, or dated in the future, appears with a (Draft) label in the dev server and is left out of production builds entirely (pages, archive, tags, feeds, sitemap and search). A future post goes live within the hour after its date (see below).

Posts with `featured: true` are listed under Popular posts on the home page.

Standalone pages (About, Uses) live in `src/content/pages`.

## Scheduled posts

Each build writes `/scheduled.json` with the date of the next future post. The `publish-scheduled` Netlify function runs hourly, reads it, and calls a build hook once that date has passed, so most runs do nothing.

It needs a build hook (Netlify: Project configuration, Build and deploy, Build hooks) with its URL stored as the `BUILD_HOOK_URL` environment variable, scoped to Functions. Without it the function logs a warning and does nothing.

If the triggered build fails, the function tries once more on the next hourly run and then stops, so a broken build cannot keep using build minutes. The post then waits for the next deploy. Turn on Netlify's failed deploy notifications to hear about it.

## Tests

```
npm test
```

This builds the site and runs smoke tests against `dist` using the Node test runner. They check that every URL from the old Eleventy site still exists, and cover the sitemap, feeds, search index and draft handling. Set `SITE_DIR` to run the output checks against another build.
