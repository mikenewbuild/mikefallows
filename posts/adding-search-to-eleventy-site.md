---
draft: false
date: 2023-02-08
layout: layouts/post.njk
title: 'Adding search to an Eleventy site'
description: Scratching an itch and adding search to the site.
tags:
- the web
- eleventy

---
TL;DR I went with [Pagefind](https://pagefind.app/) and followed [this solution by Robb Knight](https://rknight.me/using-pagefind-with-eleventy-for-search/) which I had running locally after about 10 mins. Sure, I lost an hour or so deploying it because I'd got my node versions out of sync, but that's to be expected.

## Finding my search solution

Weirdly, I've found that I seem to read the posts on this site more than I write them. I say read, but I just mean referring to the stuff I've written because it has left my head. For a long time I've tried to keep some developer notes in my note-taking app _de jour_, but those often tend to be quick copy-paste bits of code with perfunctory captions, and the habit of properly writing up technical notes on this blog has been more useful than I imagined. As there are only a couple dozen posts it's pretty easy to navigate to the information I'm looking for from the homepage. Still, I'm a developer, so that extra effort seems like something I can waste an afternoon resolving.

It was also an academic exercise as I've only ever had to implement very simple search solutions that query a database (hello `LIKE %%`), or the platform I'm working on has already implemented it. I wasn't sure how you would handle this on a static site. I assumed it would mean some sort of serverless function or using a third-party integration. The fact that there's a solution that just crawls your site, looks for HTML attributes to decide what to add to the file-based index, and then queries that client-side is so simple in its genius. That's essentially what Pagefind does. It also ships with a little Svelte-based search UI component that you can drop-in and customise with a few CSS variables. It makes it very easy to integrate with low performance footprint.

## Honourable mention

When I was casting about for solutions I found some older posts by Raymond Camden, one on [adding Lunr to an Eleventy site](https://www.raymondcamden.com/2019/10/20/adding-search-to-your-eleventy-static-site-with-lunr) and one on [using Algolia](https://www.raymondcamden.com/2020/06/24/adding-algolia-search-to-eleventy-and-netlify). Ultimately, both those posts came with caveats, but they both seem like viable solutions. [Lunr](https://lunrjs.com/) is not that different to PageFind, but it perhaps needs a bit more setup to install on Eleventy. Algolia has a great reputation, but I didn't see the need to use an external service given the modest size of this site.

One of the things I'm particularly enjoying about Eleventy is the ease of finding well written up solutions, and getting to tinker with them.

The [search page](/search/) is now live.
