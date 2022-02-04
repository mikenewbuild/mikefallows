---
draft: false
date: 2021-08-27
layout: layouts/post.njk
title: Archiving a Perch CMS site by statically rendering it with Wget
description: Converting a LAMP site to statically hosted files with Wget.
tags:
- php

---
I started working with the [London Short Film Festival](https://www.shortfilms.org.uk/) in 2007, creating the brochure and website for the 2008 festival that takes place in early January. If you've ever been involved in the organisation of festivals you'll know that due to the sheer number of parties involved that no amount of preparation can entirely prevent information arriving at the last minute.

After getting that first brochure singed off and delivered to the printers just before Christmas, I quickly put together a website with Wordpress that was little more than a glorified page of the event listings.

### 12 years of Perch

The following year I used the relatively new [Perch CMS](https://grabaperch.com/) that I found much more developer friendly than Wordpress, but could still be hosted cheaply and familiarly. The site would always get a lot of traffic in the short period of time up to and during the festival, but much less outside of it, so keeping annual hosting costs low in the days before autoscaling was a big bonus.

Year by year, I would update the site for a sustained period adding new features and evolving the design to match the look of the printed promotion. I took great care to preserve access to old events and film listings (typically 300+ each year) along with articles from festivals past. Consequently the site went through several data migrations.

The site went from being a supplement to the listings brochure to becoming the primary source of truth, allowing me to generate the listings content for the brochure from data initially added to the CMS. Using the CMS first made getting content approved by third parties much easier, and meant a lot of previously tedious aspects of the job could be automated.

The (generally) annual cadence of the work on the site meant there would always be some updates to apply to the CMS, versions of PHP or MySQL, current best practices and often dropping feature support for obsolete browsers.

In 2020 the festival took on a new director and due to the pandemic took place online and employed a new technical team, so with a little sadness and relief I'm no longer spending my Decembers scrambling to put the site together. I still had (felt?) the responsibility to archive the existing content. Initially that was just a case of swapping to an archive subdomain, but I knew that keeping the site on the LAMP stack would not make sense permanently.

### Legacy LAMP sites

Anyone who's spent time as a general web developer in the 2000s has probably stood up a few PHP sites that are still ticking along on an old shared server running on some now obsolete version of PHP. They're probably running fine (and I'm sure a lot are still generating a good profit!) but as always there are potential security risks running on versions of software that no longer receive security fixes, and the chances of being able to fix something on a site rotting on some crusty version of PHP5 doesn't sound very appetising.

Even the site was running on PHP 7.4 (the latest at the time) I don't want the technical burden of having to maintain and pay for a server or applying security updates to the CMS software for a site that doesn't need to be dynamically rendered or even updated. By taking a static snapshot of the site and hosting the files (effectively for free) on a CDN, it would mean reducing the technical burden to essentially zero. It also means a lot less energy and overhead to run the site - it seemed like the responsible thing to do.

Of course, there's always the potential that the site will need to be updated in some way, so I decide a good solution would be for me to be able to run the site locally and then to automate the process of snapshotting and deploying the site to something like [Netlify](https://www.netlify.com/).

### Only running the site locally

I've always been able to run the site locally for development purposes, initially using things like [MAMP](https://www.mamp.info/) but more recently using [Laravel Valet](https://laravel.com/docs/valet) (with a [custom driver](https://github.com/mikenewbuild/valet-drivers/blob/main/PerchRunwayValetDriver.php)). I relied on taking copies of the production database to the staging server to get an up-to-date version of the production state that I can work on safely. The only change I made was to store a SQL dump in the repo, so that I could always restore a working copy of the site from just the repo. I considered adding scripts to restore the database, run composer, set up a Docker file etc as well as one to dump changes to the database, but in the end I just left some notes for myself in the README. There's a good chance I'll never need to use this repo again, but if I do that will be the time to solve that problem.

### Generating the static site

Although it would probably make sense to have the static sites generated and hosted within the same repo, for simplicity I decided that all the static files could be generated in a separate repo. It's possibly something I would change, but for now it feels much 'lighter' to separate the repos.

I decided to use [Wget](https://www.gnu.org/software/wget/) to clone the locally running version of the site and store it in a folder that can then be set to serve the files, in this case `/public` which conveniently allowed me to serve the files locally via Valet for testing purposes. It took me scouring a few tutorials and some trial and error to get the configuration of arguments that I wanted.

I ended up with something like this:

```bash
wget -mpckEnH -P ./public https://lsff.test
```

* `-m` creates a mirror of the site
* `-p` get all images, etc. needed to display HTML page
* `-c` resume getting a partially-downloaded file
* `-k` make links in downloaded HTML or CSS point to local files
* `-E` save HTML/CSS documents with proper extensions
* `-nH` don't create host directories
* `-P` define a directory to saves files to

This worked a treat, and the only issue was that absolute urls would refer to the local domain `https://lsff.test` but the files would eventually be hosted at a different domain `https://archive.shortfilms.org.uk` so I realised I would need to do a find and replace on the url. There's probably some solution for this built in to Wget, but I couldn't figure it out. A couple of trips to Stack Overflow (plus some more trial and error) later and I decided the best solution for me would be to use a combination of the `find` [file finding command](https://en.wikipedia.org/wiki/Find_(Unix)) and the [stream editor command](https://en.wikipedia.org/wiki/Sed), `sed`.

On Mac OS you need to create backup files when you run `sed` to preserve the integrity of the filesystem or something. Eventually I got the following to work.

```bash
find ./public -name "*.html" -type f -exec sed -i '.bak' 's/lsff\.test/archive\.shortfilms\.org\.uk/gI' {} \;
```

Great! I could now generate a fully working static reproduction of the site 🙌

The interesting outcome was that now the generated files were being stored in a repo, I could easily see how small changes to the original site were reflected in the static output and therefore which files were directly effected. Reviewing the files helped me spot a couple of small errors, pages that needed to be removed and other improvements that could be made quickly. It was satisfying being able to see the resulting changes in a git diff in a way that you don't when dynamically generating the content and only working with the templates.

I noticed a couple of oversights, like needing to empty the `/public` directory before running `wget` so that pages I wanted removed didn't remain. Although I could add the `.bak` files I was generating to `.gitignore` it added a lot of noise to the file explorer so I decided to clean those up on each run too. In the end I had a `build.sh` file I could run that looked like this:

```bash
rm -rf ./public
wget -mpckEnH -P ./public https://lsff.test
find ./public -name "*.html" -type f -exec sed -i '.bak' 's/lsff\.test/archive\.shortfilms\.org\.uk/gI' {} \;
find ./public -name "*.bak" -type f -delete
```

### Deploying to Netlify

All that remained was setting up a new site in Netlify linked to the repo on GitHub that served the `./public` folder and pointing the domain. I can't see [this archive](https://archive.shortfilms.org.uk/) ever generating enough traffic to escape the free tier and if necessary there's a few useful goodies like [redirects](https://docs.netlify.com/routing/redirects/) and [snippet injection](https://docs.netlify.com/site-deploys/post-processing/snippet-injection/) I can take advantage of if I ever need to.

So that's it – with just a handful of commands – I can pull down both repos make a change in the dynamic one and generate and publish a new set of static files to the web. I now have a solid solution for archiving and hosting static versions of LAMP sites without losing the ability to still make changes via the CMS.
