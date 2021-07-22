---
draft: false
date: 2021-07-21
layout: layouts/post.njk
title: Shopify theme development with esbuild
description: Leverage sass and bundle js imports with esbuild and using the new Shopify
  themes CLI.
tags:
- esbuild
- shopify

---
Shopify recently released a new CLI that amongst other things makes it easier to develop themes locally.

## The old way: Theme Kit + CodeKit

Previously I had developed a workflow using Bryan Jones' [CodeKit](https://codekitapp.com/) app and Shopify's old [Theme Kit](https://github.com/Shopify/themekit) tool. Codekit provides a GUI for bundling assets with great defaults without having to set up a complex [webpack](https://webpack.js.org/) config like Shopify's [Slate Theme](https://github.com/Shopify/slate). It also allowed me to set up a local server that could proxy to a specific development theme on the store.

Using Shopify's old Theme Kit tool, I could bundle and minify assets with CodeKit, have them synced to a development theme on Shopify and then CodeKit could refresh the page for me. This gave me the closest thing to an ideal local development setup. There were some niggles though - one drawback was that the bundling and syncing wasn't instant so I would need to set a 2-3 second delay on the refresh to allow for the bundled files to be uploaded to Shopify. Kudos to CodeKit for having that functionality.

Another was that CodeKit released a fix for a bug that encoded urls properly. Unfortunately, I realised I had been relying on that bug to make it easier for me to quickly launch a development serve.

This is not a knock on CodeKit, it must have saved me hundreds of hours over the years I've been using it, and it's still my go to for lots of projects. There just has never been a great out of the box developer experience for managing themes on Shopify.

## Shopify CLI for themes

With the [announcement of Shopify's Online Store 2.0](https://www.shopify.com/partners/blog/shopify-online-store) came a new CLI (Command Line Interface) tool to manage themes with faster syncing and a local dev server out of the box. Along with it being a native solution (faster) it has removed the need for managing API keys and config files for multiple themes (a particular nuisance when working across multiple machines).

The other difference with the [Shopify CLI for themes](https://shopify.dev/themes/tools/cli) vs Theme Kit, is that there is now no way to instruct CLI to ignore syncing certain files. For example I would often avoid syncing the `settings_data.json` files and keep these out of version control to avoid overwriting client customisations. However, with the changes to the structure of the new themes, the sync speed, and the deprecation of automatic [SASS](https://sass-lang.com/) compilation by Shopify it makes less sense to not track all theme files.

## Bundling assets with esbuild

Without the need for a third party tool to manage a development server and Online Store 2.0's new structure along with increasingly having to worry less about browser support for modern CSS and JavaScript, it's easy to imagine building new themes without the need for bundlers at all (unless I adopt things like [TypeScript]()).

However, there are multiple themes I maintain that will take a lot of time to safely convert to the new store structure. In the meantime I need a fast and simple way to bundle `.scss` and `.js` files. I could of course continue to use CodeKit for this purpose, but it feels like overkill for such a simple task, and I want to make it easier to run build steps as part of a deployment pipeline or work with other developers on a theme, so free open source command line tools work better for this purpose.

Fortunately [esbuild](https://esbuild.github.io/) is perfect for the task. It's fast, and although it requires some config I only needed less than 20 lines to replace my CodeKit setup.

My esbuild setup needed to:

* bundle js imports for browsers (and support some older browsers)
* bundle scss files to a css file
* minify the output
* watch and bundle files on change

For the simplest set up you can just run esbuild from the command line without the need for a `node_modules` folder, but to handle `.scss` files and support older browsers requires a build config.

### Set up

Here's a typical set up when converting a theme from CodeKit. My file structure typically looks like this:

    assets/
    ...
    src/
    ├─ scripts/
    │  ├─ modules/
    │  ├─ theme.js
    ├─ styles/
    │  ├─ modules/
    │  ├─ theme.scss

The only thing I need to change is to import styles at the top of  `src/scripts/theme.js`

    import '../scss/theme.scss';

### Install

Run the following command to install esbuild and a plugin to compile `.scss` files as npm packages.

`npm i esbuild esbuild-sass-plugin --save-dev`

Make sure to add `"type": "module"` to your `package.json` as esbuild relies on module imports.

### Build config

Set up a build file as `esbuild.config.js` that takes the `theme.js` file as the entry point, and compiles the minified output to the `assets` directory in a format for browsers that support the es2018 syntax. this allows for some older versions of modern browsers to be supported, but not legacy versions like IE11 which I no longer actively support.

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

Run `node esbuild.config.js` to bundle the files to the assets folder and watch for any changes to imported files. I usually add that to a start script so a boilerplate `package.json` might look like this.

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

### Next steps

This allows me to organise my code in a way that suits me best and leverage the features of SASS and npm with instant browser updates and minified assets that has made working on Shopify Themes much easier. My workflow also feels much lighter now.

I'm still looking at ways to improve my process by introducing things like type safety and automated testing and linting to my custom theme development. I hope that this paves the way towards that!
