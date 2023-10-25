---
draft: false
title: Adding an SVG favicon with dark mode support
description: Updating my favicon and adding support for dark mode.
date: 2023-10-25T09:00:00.000Z
tags:
  - the web
  - css
layout: post
---

When I first set this site up I used [this technique](https://css-tricks.com/emoji-as-a-favicon/) to add a favicon with the 🥶 (cold face) emoji. This was a great way to have a favicon present without having to stress about designing one, or resorting to my usual default of a black square 🥱. Good enough for now, I thought, I can worry more about it later.

Here's the code I used for that.

```html
<link rel="shortcut icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%A5%B6%3C%2Ftext%3E%3C%2Fsvg%3E" type="image/svg+xml">
```

That was fine until I noticed that a search result for my site in DuckDuckGo (my primary search engine at time of writing) didn't support emoji's as a shortcut icon. I think partially because it (or Bing or whichever systme it uses for it) tries to generate a small self-hosted image for the short cut icon. Drat. Time to do something about it.

I still didn't really want to have to _design_ anything. I can tackle that later if I ever get around to seriously thinking about the visual identity of this site. For now I wanted a small improvement, a _kaizen_[^1] if you will. So I thought about whether it was possible to get raw SVG versions of emoji. In my search I came across [OpenMoji](https://openmoji.org/) which I'd seen mentioned before. It provides open source versions of emoji that are available as coloured or outlined SVG files. Perfect!

I decided to switch from 🥶 (cold face) to 👾 (space invader/alien monster) as I really liked the image by Antonia Wagner, and it worked well in outline. I decided to go for outline so that I didn't have to commit to a colour. I also wanted to implement dark mode support to the SVG and I though it would make doing that simpler.

## Dark mode support

Adding dark mode support was pretty simple. First I replaced all hardcoded colour references to `currentColor` so I could control the colour more reliably through CSS. eg.

```svg
- <rect ... stroke="#000000" ... />
+ <rect ... stroke="currentColor" ... />
```

Then I added some CSS in the body of the SVG file by using a `<style>` tag inside a `<defs>` tag. That CSS simply applied a black stroke to all the visual elements in the SVG, and using an `@media` rule, switched that to white when a visitor is in dark mode.

```svg
<svg ... >
  <defs>
    <style>
      rect, path, line, polyline {
        stroke: black;
        color-scheme: light dark;
      }
      @media (prefers-color-scheme:dark) {
        rect, path, line, polyline {
          stroke: white;
        }
      }
    </style>
  </defs>
  ...
</svg>
```

That's it! And here's the cute little critter in all its dark-mode-detecting[^2] glory.

{% include '_includes/demos/alien-favicon.njk' %}

And here's the code in full.

```svg
{% include 'public/alien.svg' %}
```

And here's the code I needed to add to the head. As I was switching to using an external SVG file I noticed that I needed to add the `sizes="any"` to get it to show up properly.

```html
<link rel="shortcut icon" href="/public/alien.svg" type="image/svg+xml" sizes="any">
```

All in all, a neat little way to get a dark mode supporting favicon!


[^1]: To _'change for better'_. A business concept that referes to small incremental improvements. [Wiki article](https://en.wikipedia.org/wiki/Kaizen).
[^2]: Note: this only responds to the system dark mode, not the personal setting for the site because the colour scheme depends on the browser's chrome not the site's design.
