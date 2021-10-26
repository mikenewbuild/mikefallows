---
draft: false
date: 2021-09-08
layout: layouts/post.njk
title: Uploading Source Maps to Honeybadger with Github Actions
description: Using Github Actions to update Honeybadger with the lates source maps
  for more useful error reporting.
tags:
- ci
- github actions

---
I've been a happy user of [Honeybadger](https://www.honeybadger.io/) for well over a year now. For the small apps I've built it has often been enough to rely on users reporting bugs, as I usually have a direct line of contact with the user (AKA the client).

## Error Tracking Shopify apps

As the apps I've been building have become more complex, and the number of users increased, it seemed prudent to add an error reporting service to my stack. I'd heard good things about Honeybadger, and I liked that they promoted a good company ethic and seen a lot of support in the development communities that I subscribe to. Their free tier seemed like it would cover my requirements comfortably, and allow me to scale as necessary. I was pleasantly surprised at how quickly I had error reporting set up in my apps and automatically generating Github issues for errors that were detected.

This was particularly the case for the backend of the apps that I typically develop in PHP with Laravel. They have a [Laravel specific integration](https://docs.honeybadger.io/lib/php/integration/laravel/) which is a cinch to install.

Some of my most heavily used apps are integrated with Shopify, and utilise Shopify's React based framework, [Polaris](https://polaris.shopify.com/). The JavaScript is minified for production so by default errors reported in JS can be obscured by the minification process. Often the nature of the error can reveal its origin, but that's not always the case.

### Using Source Maps

Fortunately it's possible to provide Source Maps to Honeybadger that can then interpret the errors and identify their location in the original source files. Much easier to debug!

Honeybadger can try to detect your Source Maps automatically, but by its nature it can be unreliable. A better solution is to upload the latest source maps to Honeybadger on each deploy.

This can be done a number of ways including a Webpack plugin or cURL.

### Using Github Actions

In the end I decided to explore doing it via Github Actions. I have been keen to find an excuse to try them out since they launched but haven't really needed to, or had the impetus to dig into it.

There is already a [Github Package](https://github.com/honeybadger-io/github-upload-sourcemap-action) provided that handles the hard part of uploading the files to Honeybadger via their API. All I had to do was configure it correctly.

I clumsily added the Action via Github's web interface, and after a couple of false starts (YAML is unforgiving), I had my first successful run and Source Maps uploaded. It took less than 20 mins in the end.

The final action looked like this:

{% raw %}

```yaml
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Install npm packages
      run: npm install --prefer-offline --no-audit

    - name: Build production assets
      run: npm run production

    - name: Upload source maps to Honeybadger
      uses: honeybadger-io/github-upload-sourcemap-action@master
      with:
        api_key: ${{ secrets.HONEYBADGER_API_KEY }}
        minified_url: ${{ secrets.PRODUCTION_URL }}/js/app.js
        minified_file: public/js/app.js
        source_map: public/js/app.js.map
```
{% endraw %}


I stored the API key for the project as a Github Secret to keep it secure, and I also stored the URL of the production site to make this action more portable. This works for me as I try to enforce building my apps in a consistent way.

Now each time the main branch is updated, the npm packages are installed and production assets (including Source Maps) are generated, and the latest Source Maps uploaded to Honeybadger with a reference to the commit. So it's much easier for me to track down the source of any JS errors that users generate in production (and of course, fix them 😉).
