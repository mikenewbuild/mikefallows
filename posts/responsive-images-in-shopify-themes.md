---
draft: false
date: 2021-12-22
layout: layouts/post.njk
title: Responsive images in Shopify themes
description: Current solutions to handling responsive image formats in Shopify.
tags:
- responsive
- shopify

---
Performance is a useful metric for most cases on the web. None more so than in e-commerce where performance can have a dramatic impact on conversion rates and therefore profits.

One of the benefits of using a platform like Shopify is that you can leverage their margins of scale to achieve high-volume global performance for a fraction of the cost you would need to spend to do it yourself. Although the operating costs of servers have been shrinking in previous years, the complexity and pace of change have increased. As someone that would just about describe themselves as a full-stack[^1] developer, I feel like I offer my clients more value with my front-end expertise than back-end.

Outside of video, images are likely to be the heaviest assets on a web page in terms of sheer file size. This can be particularly true on e-commerce sites, where high-quality images are a key factor in sales conversion. This post covers my current best practices for handling responsive images in Shopify themes when you have access to the `image` object.[^2]

## tl;dr

Skip ahead to the new [image_tag](#the-new-image_tag-filter) section, if you don't want to wade through my ruminations on the old ways.

## Legacy solution

Before the `picture` element, `srcset` and `loading="lazy"` attributes had enough cross-browser support, detecting which images to load – and when – relied on using JavaScript. The technique I used allowed me to effectively query whether an image was within the browser's viewport, and based on the containing element, identify the most appropriate sized image to load in.

This was possible due to Shopify's CDN that allowed you to store a single large image, but also fetch different versions of the image by adjusting certain values in the filename. For example, a large (2000×2000px) image named `arthur.jpg` could be scaled down to 100×100px by requesting `arthur_100x.jpg`. In Liquid that could be achieved with the `img_url` filter like so:

{% raw %}

```liquid
{{ settings.banner | img_url: '100x' }}
// Outputs: //cdn.shopify.com/full/path/to/arthur_100x.jpg
```

{% endraw %}

<figcaption>
Please note: I'm excluding the cache-busting part of the query strings in my examples for simplicity's sake.
</figcaption>

This meant that even with significant design changes, there was no need to worry about replacing existing images (as long as the originals were already stored at a large enough size). Later Shopify introduced more features to the CDN like the ability to `crop` images or convert images to the progressive jpeg format (`pjpg`), which was then superceded by more modern formats like `webp` (update: and now `avif`).

Later Shopify made it possible to request image transformations by appending query parameters to the request rather than by mutating the filename itself. For example, the equivalent file of `arthur_100x.jpg` could be requested instead with `arthur.jpg?width=100`.

{% raw %}

```liquid
{{ settings.banner | image_url: width: 100 }}
// Outputs: //cdn.shopify.com/full/path/to/arthur.jpg?width=100
```

{% endraw %}

This also makes programmatically generating image URLs (for example in JavaScript) easier, because it doesn't rely on a regular expression to check whether the passed filename already includes an image transformation eg. `arthur_480x.jpg` that needs to be accounted for. But we're not covering that here.

## Lazy loading

The concept of lazy loading is that you needn't load images that the visitor can't immediately see anyway – perhaps because they are outside of the browser's viewport (lower down the page), or in an unreached slide in a slideshow component.

Originally you needed to rely on the browser's `resize` and `scroll` events to detect when and which images might be required. These events could have their performance penalty, particularly on image-heavy pages and so meant leveraging things like `debounce` to minimise calculations. The tricks were frankly quite gnarly and I found no _perfect_ solution, even after several years of refinements. This was exacerbated with the introduction of Apple's retina display on iPhones creating the additional matrix of serving higher resolution images at each size.

Some of these issues were mitigated with the introduction of the browser's `IntersectionObserver` API, which allowed you to more easily detect images entering (or more usefully: about to enter) the viewport with a much lower performance cost.

Two things have largely removed the need for JavaScript solutions. The first: cross-browser support for `srcset`, a feature which allows you to define a set of images and let the browser decide which is most appropriate, based on a much broader set of variables such as device, network speeds, and battery level; the second: a `loading="lazy"` attribute, which lets the browser use similar factors to optimise when the browser should start loading in an image with minimum interruption to the visitor's experience.

In a template, a responsive image might be constructed like this:

{% raw %}

```liquid
<img
    src="{{ settings.banner | img_url: '2000x' }}"
    srcset="{{ settings.banner | img_url: '320x' }} 320w,
      		{{ settings.banner | img_url: '640x' }} 640w,
      		{{ settings.banner | img_url: '1000x' }} 1000w"
    alt="Let's go swimming!"
    width="2000"
    height="2000"
    loading="lazy"
/>
```

{% endraw %}

There are surprisingly few places where you need to define image outputs in a theme, but I tried to avoid some duplication by creating a generic snippet for images and passing the image object into it.

## The new `image_tag` filter

Even more recently, Shopify has introduced the `image_tag` filter which cleans up a lot of boilerplate and provides a consistent way to generate responsive images in theme code. Effectively you can generate the same thing with just the filter:

{% raw %}

```liquid
{{ settings.banner | image_url: width: 2000 | image_tag }}
```

{% endraw %}

Output:

```html
<img
  src="//cdn.shopify.com/full/path/to/arthur.jpg?width=2000"
  alt=""
  srcset="//cdn.shopify.com/full/path/to/arthur.jpg?width=352 352w,
          //cdn.shopify.com/full/path/to/arthur.jpg?width=832 832w,
          //cdn.shopify.com/full/path/to/arthur.jpg?width=1200 1200w,
          //cdn.shopify.com/full/path/to/arthur.jpg?width=1920 1920w"
  sizes="(min-width: 1100px) 535px,
         (min-width: 750px) calc((100vw - 130px) / 2),
         calc((100vw - 50px) / 2)"
  width="2000"
  height="1600">
```

The generated image tag includes some good defaults for sizing the image based on the original image size. These can be overridden if you need to fine-tune the output.

You can also pass other attributes to the `image_tag` filter, such as `alt` tags, `class` contents or maybe even to add hooks like `data` attributes for scripts. You would pass an `alt` tag like this:

{% raw %}

```liquid
{{ settings.banner | image_url: width: 2000 | image_tag: alt: "It's a wild combination" }}
```

{% endraw %}

## Good performance optimisations

You're already getting some good performance benefits from using `srcset` on large images, but what if you wanted to add that snazzy lazy loading feature? Easy:

{% raw %}

```liquid
{{ settings.banner | image_url: width: 2000 | image_tag: loading: "lazy" }}
```

{% endraw %}

There is a caveat to using the `loading="lazy"` attribute, in that it can potentially have a _negative_ performance impact if it is used on images that are already within the browser viewport on load. Therefore it's advised that you only use it on images lower down on the page.

However, for key images, it may also be useful to _prioritise_ the loading of those images to reduce "layout shift" and display key content to the visitor faster. You can do that by setting a `preload` attribute on the `image_tag` filter with a value of `true`. Behind the scenes, Shopify will send a `Link` header in the response to the browser with a `rel` attribute of `preload` that contains the relevant `srcset` and `sizes` values. That case would look something like this:

{% raw %}

```liquid
{{ settings.banner | image_url: width: 2000 | image_tag: preload: true }}
```

{% endraw %}

You want to be careful about how many preload hints you give to the browser, as too many may render the benefits moot. It's ideal for the first image on a product page, or a large banner image on the homepage, for example.

More details about the `image_tag` filter can be found [in the docs](https://shopify.dev/api/liquid/filters/html-filters#image_tag).

It's one of the better feelings in development when you can revisit some code and easily remove workarounds, and it's an added bonus if you get some quick performance wins at the same time!

[^1]: The term "full-stack" seems to have quite a fluid definition depending on who you ask, and the term has certainly expanded over the years. Originally it might mean someone that knows how to use a MySQL database and write some jQuery. These days you might be expected to understand a frontend framework like Nextjs and write your own Docker config.

[^2]:  In some cases, you may only have the URL of the image on Shopify's CDN (typically if you're adding images into the body of the rich text editor). In those cases, images can still be optimised, but the strategy is a bit more complicated and I hope to cover that in a later post.
