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
In [a previous post](/posts/shopify-theme-development-with-esbuild/) I described how to use [esbuild](https://esbuild.github.io/) as a bundler for Shopify themes.

In this post I want to document an additional step to use a tool called autoprefixer (a PostCSS plugin) which will automatically add browser vendor prefixes to your compiled CSS so that features are supported in older browsers.

### Why vendor prefixes?

Even in the days of modern "evergreen" browsers, users don't always upgrade in a timely fashion, or are on older versions of operating systems which, particularly in the case of Apple, mean they will be stuck on older versions of Safari. Vendor prefixes where initially a way of browsers shipping their own implementations of features which you could opt into before standards had been agreed. It's largely abandoned as an approach now. So, as well as being a good web citizen and making sites as accessible as possible, when it comes to ecommerce a broken looking site can reduce credibility, and ultimately sales.

### Why esbuild?

With the features of modern CSS I probably wouldn't start a new project with Sass, but I have a few existing projects that utilise it extensively. It would take a while to refactor away from Sass so I still need to convert my Sass to native CSS.

I previously used CodeKit to handle bundling across most projects, but I don't need the local server since Shopify introduced their CLI. The CLI provides a local server with HMR (Hot Module Replacement) but due to the nature of Shopify themes it relies on sending files to Shopify's servers, so it's worthwhile to optimise for bundle speed, and esbuild is _fast_.

### Adding PostCSS and autoprefixer

Fortunately the [esbuild-sass-plugin](https://github.com/glromeo/esbuild-sass-plugin) package by Gianluca Romeo I was using makes integrating PostCSS super easy and [documents a simple example](https://github.com/glromeo/esbuild-sass-plugin#--postcss) that includes autoprefixer.

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

I ended up adding `{from: undefined}` to the `process` config, just to quieten a warning about the way the source maps are generated. It's true that with this config the source maps aren't really very useful, but I haven't taken the time to look into getting that set up correctly. For now, I'm just glad oto have the benefit of having the vendor prefixes added as part of the build.

### Defining supported browsers

The last part is specifying which browsers you want to support in order to define which vendor prefixes are required. There's a couple of ways to handle this, but I prefer to add a `browserslist` property to my `package.json` as it's pretty universally supported, and fairly explicit.

The current default is to specify that usage is greater than 0.5% and at least the last 2 versions which makes sure most commonly used browser versions are included.

```json
{
  //...
  "browserslist": "> 0.5%, last 2 versions, Firefox ESR, not dead"
}
```

You can [learn more about Browserslist queries](https://github.com/browserslist/browserslist#queries).

With that, my built CSS includes the necessary vendor prefixes. Plus I now also have a config that's easily portable between other Shopify themes where I'm bundling Sass and using the Shopify CLI.
