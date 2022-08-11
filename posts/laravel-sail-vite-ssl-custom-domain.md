---
draft: false
date: 2022-07-29
layout: layouts/post.njk
title: 'Laravel Sail, Vite and SSL with a custom domain'
description: Set up Sail and Vite to develop locally under HTTPS.
tags:
- php
- caddy
- laravel
- vite

---
The Shopify apps I build are typically powered by Laravel. Version 8 introduced [Sail](https://laravel.com/docs/master/sail), "a light-weight command-line interface for interacting with Laravel's default Docker development environment". Version 9 introduced [Vite](https://vitejs.dev) "a modern frontend build tool that provides an extremely fast development environment" to replace Laravel Mix (Webpack). Recently I've preferred to use Docker over Laravel Valet as I'm regularly switching between projects with different PHP versions and database engines, as well as working locally on either Intel or Silicon hardware.

## Using a custom domain

Giving each project its own development domain is a great feature of Valet. Sail assumes a default `laravel.test` domain but allows you to override that in the Docker config. If you wanted to use a domain such as `myproject.test` you can make a couple of changes to achieve that.

In your `.env` file set the `APP_URL` value and add a new Sail-specific `APP_URL` value:

```js
APP_URL="http://myproject.test"
APP_SERVICE="myproject.test"
```

Then update the `docker-compose.yml` file to reflect the new domain, changing `laravel.test` to `myproject.test`.

```yaml
version: '3'
services:
  myproject.test:
    build:
    # etc...
```

## Securing the domain with Caddy

Because Shopify requires secure URLs for its Oauth integration, I followed [this guide by Gilbert Pellegrom](https://gilbitron.me/blog/enabling-https-ssl-for-laravel-sail-using-caddy/) to enable HTTPS for Sail using Caddy. I won't repeat the steps here, but it involves adding a Caddy service to Docker, creating a custom `Caddyfile` and setting up an endpoint for Caddy. Gilbert's post kindly [provides a gist](https://gist.github.com/gilbitron/36d48eb751875bebdf43da0a91c9faec) with some example code you can drop in. The only changes you would need to make is replacing any references to `laravel.test` with `myproject.test`.

You will also want to update the `APP_URL` in your `.env` file to use `https` now:

```js
APP_URL="https://myproject.test"
```

I also found I needed to add a line to the `AppServiceProvider`'s `boot` method to force all links to use HTTPS. Without that, at least on my machine, routes or URLs generated with the `url()` helper would use the HTTP scheme instead.

```php
public function boot()
{
    \Illuminate\Support\Facades\URL::forceScheme('https');
}
```

Now running `sail up` should give you a server you can access at `https://myproject.test`. However, you may find that the certificate is untrusted. If you don't want the warnings to keep appearing and you're on a Mac, you can add the certificate to your Keychain Access and mark it trusted. Details on how to do that are also included in Gilbert's guide.

## Securing Vite's dev server

The last issue I bumped up against was that, by default, Vite will run its dev server on HTTP, which means that the browser wouldn't load the styles and scripts on my pages. It's possible to set Vite to load its server under HTTPS, but it won't have a certificate. You can use the [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) plugin to generate untrusted certificates which will allow you to access the page, but you will need to first dismiss a warning. You can follow the steps in this [Stack Overflow answer](https://stackoverflow.com/a/73148121/15761479) to set your Vite config's host settings to allow it to run on the Docker container. This is how I set it up at first, but dismissing the warning and seeing the red badge in the address bar bothered me.

I also tried to figure out a way to get the Vite server to use the Caddy certificates but I couldn't work it out. That is probably the best solution so if _you_ figure it out – please let me know!

The alternative I went with was to use the [vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert) package. This allows you to generate a trusted certificate locally on-the-fly. The one compromise is that you have to run the Vite server outside the Docker container (ie use `npm run dev` rather than `sail npm run dev`). In my case, that is acceptable as I'm not using it to build the production assets and the Vite server is probably going to run faster outside of Docker too. What I decided to do was to use a dedicated subdomain of my project eg. `vite.myproject.test` for the Vite server so that I didn't have any conflicts with existing certificates or other projects.

My final `vite.config.js` file looked like this:

```js
import laravel from 'laravel-vite-plugin'
import { defineConfig } from 'vite'
import mkcert from'vite-plugin-mkcert'

export default defineConfig({
    server: {
      https: true,
      host: 'vite.myproject.test',
    },
    plugins: [
        mkcert(),
        laravel({
          input: [
            'resources/css/app.css',
            'resources/js/app.js',
          ],
          refresh: true,
        }),
    ],
})
```

Now when I start work on a project I can run `sail up -d && npm run dev` and have my app running locally with trusted HTTPS along with all the speed and Hot Module Reloading goodness of Vite.
