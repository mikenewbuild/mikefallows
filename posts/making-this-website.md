---
draft: false
title: Making this website.
description: The process and decisions behind this site.
date: 2021-07-11
tags:
  - web
layout: layouts/post.njk
---
I have planned to have a personal site for a long time and in this (my first!) post I'm going to cover how I selected the technology used to build this site and why.

The main roadblock to having my own site over the years has been a mixture of "analysis paralysis", the commitment of maintaining my own website (cobbler's shoes) and for a large part the fear of it being - well - a bit rubbish.

I'm not a great writer, nor prolific, but I do document a lot of thoughts in email. Email can be a great resource to dig into, but I hope a personal site of writing will serve as a way to distil those thoughts that are more important to me. I also want somewhere I can experiment freely, without the commercial considerations of professional work.

Left to my own devices, I'm pretty sure I would have put it off indefinitely. But as is so often the way, a casual conversation with [a friend](https://kierankelly.net/) turned out to be the motivation I needed.

By thinking about what would be the best solution for him, it helped me better consider what _I_ would want. I wanted something that would be:

- [low friction to update](#low-friction-to-update)
- [low cost](#low-cost)
- [portable](#portable)
- [easy to maintain](#easy-to-maintain)
- [fun to tinker with](#fun-to-tinker-with)

### Low friction to update

I don't have a habit of writing a blog, and I know enough about myself that any substantial barrier to publishing new content will result in failure. I want it to be as easy as copy-pasting an email I've written. I want to be able to write in [Markdown](https://en.wikipedia.org/wiki/Markdown), and I don't want an editor that's going to start injecting cruft into the document. I want to be able to write directly in my code editor if it suits me and other times be able to use a GUI if I want too, and still have version control.

### Low cost

These days a few static pages of a personal blog needn't come with running costs to host. I don't want the "gym subscription" effect that contributes to feeling guilty about not writing more often. I've had such a good experience with Netlify hosting simple landing pages, I was looking for something that was easy to host there, but not necessarily tied to that service.

### Portable

This basically means the freedom to switch tools easily whenever I need or want to, or archive the whole thing if I change my mind. I don't want an all-in-one solution, but pieces that can easily be swapped out for building, editing, hosting, etc.

### Easy to maintain

I don't want to commit to maintaining a server and the evolving languages or database versions that come with that choice. I want to be able to have purple patches where I can work on it a lot, but also have the freedom to just leave it alone for long stretches.

### Fun to tinker with

Part of the appeal of having a personal site is having a place where I can just try things out (in public). I'm fortunate enough to have clients with a lot of confidence in me, so I get plenty of creative opportunities in my professional work. Yet there are still times I want to be able to quickly try out a new idea free from commercial constraints, but may also serve as a demonstration of an idea that I can share when necessary.

### Picking a stack

In 2021 there are a lot of options to choose from: headless CMS providers like Contentful or Sanity; hosted platforms like Tumblr or Substack; self hosting a Wordpress or Ghost site. But these fail on either having to maintain a server, being tied to a service, being restricted in how much you can customise them, potentially incurring too high a financial cost or just subjectively being unappealing.

It would also be true to say that my experience with Netlify was a huge influence. I've been so impressed with it that it is my first consideration when hosting any static projects.

So this steered me towards static site generators. I already had some experience building client sites with tools like [Jigsaw](https://jigsaw.tighten.co/) (PHP), [Gatsby](https://www.gatsbyjs.com/) (React) and [Routify](https://routify.dev/) (Svelte). I had success with all of them, and consider them great tools. I also considered [Hugo](https://gohugo.io/) (Go) and [Jekyll](https://jekyllrb.com/) (Ruby), but in the end I felt like they all required either too much code out of the box, were subject to change, or meant committing to a single language.

I had been aware of Eleventy being a relative newcomer and had read some glowing reviews, but still wasn't sure I "got it". Then I watched the creator, [Zach Leatherman](https://www.zachleat.com/), demo it and its simplicity frankly blew me away. It felt easy to grasp, very flexible and lightweight and I was excited to try it out. You could literally start your site from a single file with zero config. It also supported Liquid syntax which I use regularly on Shopify themes so the learning curve was much less steep.

I could see that it was simple to deploy to Netlify (and others) via Git, and had support for Netlify CMS (which I'd used) as well as Forestry which I was interested to try out.

So [Eleventy](https://www.11ty.dev/) it is, with [Github](https://github.com/) and [Netlify](https://www.netlify.com/).
