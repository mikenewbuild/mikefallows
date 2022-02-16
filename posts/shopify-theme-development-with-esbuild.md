---
draft: false
date: 2021-07-21
layout: layouts/post.njk
title: Shopify theme development with esbuild
description: Leverage sass and bundle js imports with esbuild when using the new Shopify
  themes CLI.
tags:
- esbuild
- shopify

---
Shopify recently released a new CLI that makes it easier to develop themes locally.

## The old way: Theme Kit + CodeKit

Previously I had developed a workflow using Bryan Jones' [CodeKit](https://codekitapp.com/) app and Shopify's old [Theme Kit](https://github.com/Shopify/themekit) tool. CodeKit provides a GUI for bundling assets with great defaults without having to resort to using a complex [webpack](https://webpack.js.org/) config like Shopify's [Slate Theme](https://github.com/Shopify/slate). It also allowed me to set up a local server that could proxy to a specific development theme on the store.

Using Shopify's old Theme Kit tool, I could bundle and minify assets with CodeKit, have them synced to a development theme on Shopify and then CodeKit could refresh the page for me. This gave me the closest thing to an ideal local development setup. There were some niggles though – one drawback was that the bundling and syncing wasn't instant – so I would need to set a 2-3 second delay on the refresh to allow for the bundled files to be uploaded to Shopify. Kudos to CodeKit for including that functionality though.

Another was that at some point CodeKit released a fix for a bug where some urls weren't being encoded. Unfortunately, I realised I had been relying on that bug to make it easier for me to quickly launch a development server.

This is not a knock on CodeKit, it must have saved me hundreds of hours over the years I've been using it, and it's still my go to for lots of projects. There just has never been a great out-of-the-box developer experience for managing themes on Shopify.

## Shopify CLI for themes

With the [announcement of Shopify's Online Store 2.0](https://www.shopify.com/partners/blog/shopify-online-store) came a new CLI (Command Line Interface) tool to manage themes with faster syncing and a local dev server out of the box. Along with being a much faster native solution for a local dev server, it has removed the need for managing API keys and config files for multiple themes (a particular nuisance when working across multiple machines).

Another difference with the [Shopify CLI for themes](https://shopify.dev/themes/tools/cli) over Theme Kit, is that there is no feature for preventing syncing certain files. For example I would often avoid syncing the `settings_data.json` files and keep these out of version control to avoid overwriting client customisations. However, with the changes to the structure of the new themes, the sync speed, and the deprecation of automatic [SASS](https://sass-lang.com/) compilation by Shopify it makes less sense to not track all theme files.

## Bundling assets with esbuild

With less need for third party tooling and increased browser support for modern CSS and JavaScript, it's easy to imagine building new themes without the need for bundlers at all (unless I adopt things like [TypeScript](https://www.typescriptlang.org/)).

However, there are multiple themes I maintain that will take a lot of time to safely convert to the new store structure. In the meantime I need a fast and simple way to bundle `.scss` and `.js` files. I could of course continue to use CodeKit for this purpose, but it feels like overkill for such a simple task. I also want to make it easier to run build steps as part of a deployment pipeline or work with other developers on a theme, so free open source command line tools have some additional benefits.

Fortunately [esbuild](https://esbuild.github.io/) is perfect for the task. It's fast, and although it requires some config I only needed less than 20 lines of code to replace my CodeKit setup.

My esbuild setup needed to:

* bundle js imports for browsers (and support some older browsers)
* bundle scss files to a css file
* minify the output
* watch and bundle files on change

For the simplest set up you can just run esbuild from the command line without the need for a `node_modules` folder, but to handle `.scss` files and support older browsers requires a build config.

### Set up

Here's a typical set up when converting a theme from CodeKit. My file structure typically looks like this:

```text
assets/
...
src/
├─ scripts/
│  ├─ modules/
│  ├─ theme.js
├─ styles/
│  ├─ modules/
│  ├─ theme.scss
```

The only thing I would need to change is to import styles at the top of  `src/scripts/theme.js`

```js
import '../scss/theme.scss';
```

### Install

I can install esbuild and a plugin to compile `.scss` files as npm packages via the command:

```bash
$ npm i esbuild esbuild-sass-plugin --save-dev
```

As esbuild relies on module imports `"type": "module"` needs to be present in the `package.json` file.

### Build config

The convention is to set up a build file as `esbuild.config.js`. The example below takes the `theme.js` file as the entry point, and compiles the minified output to the `assets` directory in a format for browsers that support the es2018 syntax. This allows for some slightly older versions of browsers to be supported, but not legacy versions like IE11 which I no longer actively support.

```js
import esbuild from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'

esbuild.build({
  entryPoints: {
    theme: 'src/scripts/theme.js',
  },
  bundle: true,
  outdir: 'assets',
  target: ['es2018'],
  plugins: [sassPlugin()],
  minify: true,
  watch: true,
}).then(() => {
  console.log('Watching files...')
}).catch((e) => console.error(e.message))
```

Running `node esbuild.config.js` will bundle the files to the assets folder and watch for any changes to imported files. I usually add that to a "start" script so a boilerplate `package.json` might look like this.

```json
{
  "devDependencies": {
    "esbuild": "^0.12.15",
    "esbuild-sass-plugin": "^1.4.8"
  },
  "scripts": {
    "start": "node esbuild.config.js"
  },
  "type": "module"
}
```

### Next steps

I now have a set up that allows me to organise my code in a way that suits me best. I can leverage the features of Sass and npm with instant browser updates, generate minified assets and see the results of my changes almost instantly in the browser.

I'm still looking at ways to improve my process and I plan to introduce things like type safety, automated testing and code linting. I feel positive that this is all a step in the right direction.

#### Update

I have added a post on how to update your config to [automatically add vendor prefixes](/posts/using-postcss-and-autoprefixer-with-esbuild/) to the compiled CSS using PostCSS and the Autoprefixer plugin.