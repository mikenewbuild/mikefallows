---
draft: false
date: 2021-07-26T00:00:00.000Z
layout: layouts/post.njk
title: Using Jest tests to replace jQuery in a Shopify theme
description: >-
  A strategy for safely removing jQuery as a dependency from custom Shopify
  themes. 
tags:
  - testing
  - javascript
  - shopify
_template: blog_post
---


I started building custom Shopify themes in 2015 when it was still quite painful dealing with different browsers and lots of elements of Shopify relied on jQuery by default. In 2020, the browser landscape is much less problematic and so I decided to stop supporting IE and only target modern browsers instead. Although most sites still get a tiny percentage of traffic from older browsers, the number is dwindling and actual sales are non-existent so the cost of extra development is no longer justified.

This has given me the opportunity to do all my new feature development with modern JavaScript techniques using newer frameworks like [Alpine.js](https://alpinejs.dev/). Still, there is a lot of previous code knocking around that relies on jQuery and a lot of it is fundamental to the way the theme works. I'm generally fine with leaving working code alone, but jQuery is quite a heavy dependency, so there are definite performance gains from removing it.

Also, it should go without saying, that the code I wrote in 2015 is much more _naïve_ than the code I would write today. Although I'm sure I will have a similar attitude in the future to the code I write now :)

The difficulty is how to replace such a fundamental part of the codebase (relatively) painlessly without risking breaking something?

### Benefits of tests

Something that I've come to rely on a lot in backend development is automated testing. Sadly I've struggled so far to develop a good testing workflow with JavaScript. So I wanted to use upgrading a legacy codebase as a good opportunity to work on that.

Ultimately I believe Shopify themes would benefit the most from end-to-end testing tools like [Cypress](https://www.cypress.io/), but due to the nature of theme development on Shopify, this seems quite daunting. What I want primarily is to be able to quickly set up and run tests to give me a quick feedback loop so I can confidently refactor code.

Fortunately, most of the code I would be updating is limited to DOM traversal, toggling a few classes and some very simple DOM insertion. More complex code (mainly around cart interaction) I would want to manually test anyway. I figured this simpler code might be a good candidate for a testing framework like [Jest](https://jestjs.io/).

### Install & set up

This was my first experience setting up Jest in a project and credit to the maintainers, it was much easier than I expected and thanks to the helpful error messages I had it set up to my specific requirements in minutes.

I installed Jest with the command:

```bash
$ npm i jest --save-dev
```

Now any files ending `.test.js` will be treated as a test when running `jest` from the root of the project.

You can also keep all your files in a dedicated test folder, which I would typically do when using things like [Pest](https://pestphp.com/), but in this case, I want the files to be easily transferrable between projects so I opted to colocate my tests with my implementation code.

### Running tests

The first snag I hit was using import statements in my tests. I wanted to use imports as I'm [in the future](/posts/shopify-theme-development-with-esbuild/) now. At the time of writing, this is only supported as an [experimental feature in Jest,](https://jestjs.io/docs/ecmascript-modules) but as I'm not planning to do anything crazy in my tests it has worked fine for me. It does mean adding a flag to the command, so it's easier to add to an npm script:

```json
{
  scripts: {
    "test": "node --experimental-vm-modules node_modules/.bin/jest"
  },
  "type": "module"
}
```

Module imports are now automatically supported when I run `npm test`

### Testing the DOM

Pretty much all of the work I'm doing with JS is to do with DOM manipulation, certainly the code I had written with jQuery. Jest has some features that make it easy to test the basic DOM manipulation which I was performing. I struggled a bit when it came to things like using `setTimeout` so I decided to dig into that another day and focus on the simple stuff and test anything more complicated manually.

There is one thing you need to do to allow your tests to use the DOM, and that is to include a doc block at the beginning of your tests.

```js
/**
 * @jest-environment jsdom
 */
 test('...', () => {
   // test DOM stuff...
 })
```

Here's a full example of a test for a dynamic gallery component. It's a quick test that given the right HTML structure, clicking a thumbnail will update the main image with the relevant `src` attribute and apply an `active` class to the corresponding thumbnail.

```js
/**
 * @jest-environment jsdom
 */

import dynamicGalleries from "./dynamicGallery"

test('it can dynamically update a main image by clicking thumbnails', () => {

  document.body.innerHTML = `
    <div class="gallery">
      <img src="1.jpg" class="main">

      <img src="thumb-1.jpg" class="thumb" data-gallery-img-src="1.jpg">
      <img src="thumb-2.jpg" class="thumb" data-gallery-img-src="2.jpg">
      <img src="thumb-3.jpg" class="thumb" data-gallery-img-src="3.jpg">
    </div>
  `;

  const main = document.querySelector('.main');
  const thumbs = document.querySelectorAll('.thumb');

  dynamicGalleries('.gallery', { main: '.main', thumb: '.thumb' });

  expect(thumbs[0].classList.contains('active')).toBe(true);

  thumbs[1].click();

  expect(thumbs[0].classList.contains('active')).toBe(false);
  expect(thumbs[1].classList.contains('active')).toBe(true);
  expect(main.src).toBe('http://localhost/2.jpg');
})
```

This allowed me to refactor away jQuery from the implementation of the `dynamicGalleries()` function using the instant feedback from a test and giving me the confidence that I haven't broken anything. All this without having to wait for files to bundle and sync with Shopify and a browser refresh. 🔥

### Helpful utilities

As I mentioned earlier, I rarely do anything that complicated with jQuery anyway, but its killer feature has always been the elegance of accessing the power of the [Sizzle](https://github.com/jquery/sizzle) selector engine with the `$()` function. Thanks to jQuery a lot of the power of that engine is now available in the browser's native APIs with `querySelector`, `querySelectorAll`, `nextSibling`, `closest`, etc.

However, these aren't quite as terse, and having my code littered with `document.querySelectorAll('div').forEach()` isn't as nice as `$('div').each()` . Inspired by a great series of posts on taking a [JavaScript Framework Diet](https://sebastiandedeyne.com/javascript-framework-diet/) by [Sebastien De Dyne](https://sebastiandedeyne.com/), I've been able to replace a lot of my jQuery use with some simple utility functions.

These two functions alone do most of the heavy lifting, which meant in most cases I could replace `$('div').each()`  with `_$$('div').forEach()` .

```js
function _$(selector, scope = document) {
  return scope.querySelector(selector);
}

function _$$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}
```

Of course, with Jest, it's easy to test this functionality too!

```js
test('_$ can select an element', () => {
  document.body.innerHTML = `
  <div>
    <div id="test" class="yo"></div>
    <div></div>
  </div>
  `;

  const el = _$('div#test');

  expect(el).toBeInstanceOf(HTMLElement);
  expect(el.classList.contains('yo')).toBe(true);
})
```

As I worked my way through the code I was able to find other opportunities to add utilities for frequently used jQuery features like toggling classes, or wrapping elements in another element. With the tests as backup, it greatly reduced the amount of time it took to replace jQuery, and in many cases allowed me to significantly improve the simplicity and readability of the code I was refactoring.

I often find that making code easier to test improves the code itself.

### Next steps

With these tests in place, I can now take steps towards a CI/CD pipeline which will allow me to run tests automatically when merging new features or fixes. This will reduce both the chances of regressions being introduced, as well as the time spent testing manually.

For now, I'm just happy to be able to write tests easily and get super quick feedback.
