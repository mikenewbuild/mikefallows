---
draft: false
date: 2021-08-16
layout: layouts/post.njk
title: Installing Perch Runway via Composer
description: How to manage Perch CMS as a Composer dependency.
tags:
- php
- composer

---
When I've needed to provide a CMS for brochure sites, my first port of call has been [Perch CMS](https://grabaperch.com/). I've been using it since 2010 (when it was still v1.2!) as a great solution to adapt static sites to be updated by a client (eg. adding a news section), or building out highly customised views. Perch uses PHP and MySQL so it was familiar and easy to set up locally and host on a budget.

### The Problem

As some of the sites grew in volume of content and feature complexity, I upgraded them to Perch's more advanced developer version, [Perch Runway](https://perchrunway.com/) (released 2014). Runway has features like collections and dynamic routes making it more akin to popular MVC frameworks like [Laravel](https://laravel.com/), and the types of dynamic regions you get in [Craft](https://craftcms.com/). Unlike Laravel and Craft it didn't have the convenience of [Composer](https://getcomposer.org/) to pull in useful packages and facilitate the types of deploy pipelines I had become accustomed to.

It's expected with Perch that to upgrade to new versions you would replace the `core` folder with new files downloaded from source and then manually uploaded to the client's server. To use a deployment pipeline this meant either committing all of Perch's core files to version control (yuk), or manually updating multiple sites and local development machines with each release, which even with a small number of projects quickly becomes onerous and error prone.

### The ideal

What I wanted to be able to do is pull in specific versions of Perch, or easily update to the latest version consistently across projects and machines. Because Perch doesn't provide this feature I decided to roll my own. To do this I realised I could host my own private repository of Perch with versioned releases in one place. The issue was that because Perch's files need to be accessible in a publicly accessible directory, I would need to figure out how to set up Composer to install the files outside the `/vendor` folder.

### Installers

Fortunately there's a [Composer tool](https://github.com/composer/installers) designed just for this purpose. It's specifically designed to allow packages to be installed outside the `/vendor` directory (useful for things like Wordpress). Normally you would define within the package where the files would be installed, and although Perch is typically installed in a  `/perch` directory, it doesn't have to be and for some projects I have it installed in `/cms` for example. That's okay, because the [Installers Extender](https://github.com/oomphinc/composer-installers-extender) allows the client `composer.json` file to define where the Perch core files should be installed to.

### Setting up Perch as a package

In my case I created a private repository on GitHub called `perch-core` - but it could be called anything - and committed the latest version of Perch's core files.

To set up the repository as an installer, I first needed to add a `composer.json` to the project which I did by running: `composer init` and following the instructions.

Next I installed the two packages I needed:

```bash
composer require composer/installers oomphinc/composer-installers-extender
```

After committing the changes to `composer.json`, I pushed them to GitHub and was now ready to tag the repo with the current release of Perch (at the time v3.1.5). This would allow me to specify the version of Perch I required in my client projects.

### Installing on a Perch project

Now I'm able to install Perch as well as any other composer dependencies in my project such as a helper file, or a package to support the use of `.env` files. It's important to make sure that the `/vendor` directory is not publicly accessible on the web server, so my Perch projects are typically set up with the following structure:

```text
public/
├─ perch/
│  ├─ core/
├─ favicon.png
├─ .htaccess
vendor/
composer.json
```

To use my private `perch-core` repository and have the contents be installed to `/public/perch/core` I need to add the following to my `composer.json` file:

```json
{
  ...
  "require": {
    "mikenewbuild/perch-core": "^3.1"
  },
  "repositories": [
    {
      "type": "vcs",
      "url": "git@github.com:mikenewbuild/perch-core.git"
    }
  ],
  "extra": {
    "installer-types": [
      "perch-core"
    ],
    "installer-paths": {
      "public/perch/core/": [
        "mikenewbuild/perch-core"
      ]
    }
  }
}
```

In the `repositories` section I've defined the location of my private repo on GitHub, and in `extra` I define the package that should be "installed" and the directory where the package should be installed.

It's possible to define multiple packages and locations, which is useful for applying the same technique to eg. [Perch Add Ons](https://addons.perchcms.com/).

### One last thing

Because I don't want to make the Perch core files public I also needed to set up a [Personal Access Token](https://github.com/settings/tokens) in GitHub to grant access to the private repository. This can be done with either an SSH key or by adding an `auth.json` file to the root of the project with the generated token:

```json
{
  "github-oauth": {
    "github.com": "github-token-here"
  }
}
```

Needless to say, this file should not be committed to the repo as it includes sensitive information.

Running `composer install` in my client project will now replace the `/public/perch/core` folder with the contents of my `perch-core` repository, and other packages in the vendor directory. The version will be stored in the `composer.lock` file so I can quickly replicate my project in any environment.

This small addition has made my development workflow much more robust and enables me to leverage Composer in my Perch projects. I can also track the changes to Perch core, and if necessary apply my own patches to enable support for newer version of PHP before an official version of Perch is released.
