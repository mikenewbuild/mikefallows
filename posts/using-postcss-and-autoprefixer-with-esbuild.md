---
draft: false
date: 2022-02-15
layout: layouts/post.njk
title: Using PostCSS and Autoprefixer with esbuild
description: Updating an esbuild config in a Shopify theme to utilise autoprefixer.
tags:
- shopify
- esbuild

---
In [a previous post](/posts/shopify-theme-development-with-esbuild/), I described how to use [esbuild](https://esbuild.github.io/) as a bundler for Shopify themes.

In this post, I want to document an additional step to use a tool called [Autoprefixer](https://github.com/postcss/autoprefixer) (a [PostCSS plugin](https://github.com/postcss/postcss)) which will automatically add browser vendor prefixes to your compiled CSS so that features are supported in older browsers.

### Why add vendor prefixes?

Even in the days of modern "evergreen" browsers, users don't always upgrade in a timely fashion or are on older versions of operating systems which are limits certain versions of browsers (👋 Safari). [Vendor prefixes](https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix) were initially a way for browsers to ship their own implementations of features which developers could opt into before standards had been agreed but I think it's largely abandoned as an approach now. I don't want to keep track of which vendor prefixes I should include where but when it comes to e-commerce, a broken-looking site can reduce credibility, and ultimately sales.

Wouldn't it be nice if there was a tool that keeps track of which vendor prefixes I should still be including, and like, y'know, add them for me at build time? Could it please compile my old Sass files too? Really _fast_? Oh goody.

### Adding PostCSS and Autoprefixer

Fortunately, the [esbuild-sass-plugin](https://github.com/glromeo/esbuild-sass-plugin) package by Gianluca Romeo I was already using makes integrating PostCSS super easy and [documents a simple example](https://github.com/glromeo/esbuild-sass-plugin#--postcss) that includes Autoprefixer.

First, install the necessary packages from the command line.

```
npm i -D postcss autoprefixer postcss-preset-env
```

Then we can update our `esbuild.config.js` to use these plugins.

```js
import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

esbuild.build({
  //...
  plugins: [
    sassPlugin({
      async transform(source, resolveDir) {
        const {css} = await postcss([autoprefixer, postcssPresetEnv({stage: 0})]).process(source, {from: undefined})
        return css
      }
    }),
    //...
  ],
  //...
});
```

I ended up adding `{from: undefined}` to the options of the `process` function, just to quieten a warning about the way the source maps are generated. It's true that with this config the source maps aren't really very useful, but I haven't taken the time to look into getting that set up correctly. For now, I'm just glad to have the benefit of having the vendor prefixes added as part of the build and a single entry point.

I could probably improve this, if I felt the need/pain, by defining a separate config for CSS eg. an `esbuild.css.config.js` with just the rules for the CSS compilation and with the option to run those independently or in parallel.

### Defining supported browsers

The last part is specifying which browsers you want to support, to define which vendor prefixes are required. There is a couple of ways to handle this, but I prefer to add a `browserslist` property to my `package.json` as it's pretty universally supported, and fairly explicit.

The current default is to specify that usage is greater than 0.5% and at least the last two versions are supported which, will make sure that the most commonly used browser versions are included.

```json
{
  //...
  "browserslist": "> 0.5%, last 2 versions, Firefox ESR, not dead"
}
```

You can [learn more about Browserslist queries](https://github.com/browserslist/browserslist#queries).

With that, my built CSS includes the necessary vendor prefixes. Plus I now also have a config that's easily portable between other Shopify themes ([Gist](https://gist.github.com/mikenewbuild/2eaddfb3f5bbca0d1d07908c61725daf)) where I'm bundling Sass and using the Shopify CLI.
