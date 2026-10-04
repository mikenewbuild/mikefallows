---
draft: false
title: Adding an SVG favicon with dark mode support
description: Updating my favicon and adding support for dark mode.
date: 2023-10-25T09:00:00.000Z
tags:
  - the web
  - css
---

When I first set this site up I used [this technique](https://css-tricks.com/emoji-as-a-favicon/) to add a favicon with the 🥶 (cold face) emoji. This was a great way to have a favicon present without having to stress about designing one, or resorting to my usual default of a black square 🥱. Good enough for now, I thought, I can worry more about it later.

Here's the code I used for that.

```html
<link rel="shortcut icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%A5%B6%3C%2Ftext%3E%3C%2Fsvg%3E" type="image/svg+xml">
```

That was fine until I noticed that a search result for my site in [DuckDuckGo](https://duckduckgo.com/) (my primary search engine at time of writing) didn't support emojis as a shortcut icon. I think partially because it (or Bing or whichever system it uses for it) tries to generate a small self-hosted image for the short cut icon. Drat. Time to do something about it.

I still didn't really want to have to _design_ anything. I can tackle that later if I ever get around to seriously thinking about the visual identity of this site. For now I wanted a small improvement, a _kaizen_[^1] if you will. So I thought about whether it was possible to get raw SVG versions of emoji. In my search I came across [OpenMoji](https://openmoji.org/) which I'd seen mentioned before. It provides open source versions of emoji that are available as coloured or outlined SVG files. Perfect!

I decided to switch from 🥶 (cold face) to 👾 (space invader/alien monster) as I really liked the image by Antonia Wagner, and it worked well in outline. I decided to go for outline so that I didn't have to commit to a colour. I also wanted to implement dark mode support to the SVG and I though it would make doing that simpler.

## Dark mode support

Adding dark mode support was pretty simple. First I replaced all hardcoded colour references to `currentColor` so I could control the colour more reliably through CSS. eg.

```diff-svg
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

<style>
  @keyframes cycle-background {
    0% { background-color: hsl(0deg 100% 30% / 50%); }
    20% { background-color: hsl(72deg 100% 30% / 50%); }
    40% { background-color: hsl(144deg 100% 30% / 50%); }
    60% { background-color: hsl(216deg 100% 30% / 50%); }
    80% { background-color: hsl(288deg 100% 30% / 50%); }
    100% { background-color: hsl(360deg 100% 30% / 50%); }
  }
  #alien-demo {
    padding: 18px;
    width: calc(72px + (18px * 2));
    aspect-ratio: 1;
    border-radius: 100%;
    margin-inline: auto;
    color-scheme: light dark;
    animation: cycle-background 12s infinite;
  }
</style>
<div id="alien-demo">
  <svg id="emoji" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        rect, path, line, polyline {
          stroke: black;
          color-scheme: light dark;
        }
        @media (prefers-color-scheme: dark) {
          rect, path, line, polyline {
            stroke: white;
          }
        }
      </style>
    </defs>
    <g id="line">
      <rect x="25.175" y="31" width="3.6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="22,45 16,45 16,39"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="22.583,25 22.583,20 26,20"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="48.708,25 48.708,20 45.292,20"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="13,35 10,35 10,20 16,20 16,35"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="56,35 56,20 62,20 62,35 59,35"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="26,20 26,14 32,14 32,20"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="39,20 39,14 45,14 45,20"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="16,35 19,35 19,38 13,38 13,35"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="59,35 59,38 53,38 53,35 56,35"/>
      <rect x="16" y="51" width="6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <rect x="50" y="51" width="6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="28,45 28,51 22,51 22,45"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="50,45 56,45 56,39"/>
      <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="44,45 44,51 50,51 50,45"/>
      <rect x="43.425" y="31" width="3.6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M44,45L44,45z"/>
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M39,20L39,20z"/>
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16,25L16,25z"/>
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M49,25L49,25z"/>
      <line x1="28" x2="44" y1="45" y2="45" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <line x1="32" x2="39" y1="20" y2="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <line x1="16" x2="22" y1="25" y2="25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <line x1="49" x2="56" y1="25" y2="25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </g>
  </svg>
</div>

And here's the code in full.

```svg
<svg id="emoji" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
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
  <g id="line">
    <rect x="25.175" y="31" width="3.6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="22,45 16,45 16,39"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="22.583,25 22.583,20 26,20"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="48.708,25 48.708,20 45.292,20"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="13,35 10,35 10,20 16,20 16,35"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="56,35 56,20 62,20 62,35 59,35"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="26,20 26,14 32,14 32,20"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="39,20 39,14 45,14 45,20"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="16,35 19,35 19,38 13,38 13,35"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="59,35 59,38 53,38 53,35 56,35"/>
    <rect x="16" y="51" width="6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <rect x="50" y="51" width="6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="28,45 28,51 22,51 22,45"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="50,45 56,45 56,39"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="44,45 44,51 50,51 50,45"/>
    <rect x="43.425" y="31" width="3.6" height="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M44,45L44,45z"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M39,20L39,20z"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16,25L16,25z"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M49,25L49,25z"/>
    <line x1="28" x2="44" y1="45" y2="45" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <line x1="32" x2="39" y1="20" y2="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <line x1="16" x2="22" y1="25" y2="25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <line x1="49" x2="56" y1="25" y2="25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </g>
</svg>
```

And here's the code I needed to add to the head. As I was switching to using an external SVG file I noticed that I needed to add the `sizes="any"` to get it to show up properly.

```html
<link rel="shortcut icon" href="/public/alien.svg" type="image/svg+xml" sizes="any">
```

All in all, a neat little way to get a dark mode supporting favicon!


[^1]: To _'change for better'_. A business concept that refers to small incremental improvements. [Wiki article](https://en.wikipedia.org/wiki/Kaizen).
[^2]: Note: this only responds to the system dark mode, not the personal setting for the site because the colour scheme depends on the browser's chrome not the site's design.
