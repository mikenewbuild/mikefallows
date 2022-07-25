---
draft: false
date: 2022-07-25
layout: layouts/post.njk
title: Bulk Deleting Cloudflare DNS Records
description: Using the Cloudflare API to remove incorrect DNS records via the API.
tags:
- dns
- php

---
I've recently been trying to consolidate some of the services that I use, a sort of technical spring clean if you will. In summer.

As well as transferring domains that I own to a single provider, I wanted to have a single point of management that would also work for domains that I don't own, but happen to manage on behalf of clients. I've long been wanting to tinker with Cloudflare as it offers a chunk of nice features like [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) protection, asset compression, HTTPS and email routing, all on a pretty generous free plan. So far I've found it easy to work with, and after migrating a dozen or so domains to it, I've had a pretty good opportunity to try it out.

When you set up a new 'site' in Cloudlflare, you give it a domain and it will try to detect all the A records and create those for you. It does also seem to detect a couple of other records, but in most cases I've had to manually add some records myself, usually to do with email and third-party verification ([DMARC](https://en.wikipedia.org/wiki/DMARC), [SPF](https://en.wikipedia.org/wiki/Sender_Policy_Framework), etc.). You can also import records from a text file, but for my needs adding a couple of extra records helped me review any obsolete records that existed anyway.

## The problem

The only real issue I ran into was that for a couple of domains, on importing them to Cloudflare, it detected and created dozens of A records for standard terms eg. `1`, `2`, `3` ... `a`, `app`, `apps` ... `www1`, `www2`, etc. Nearly 200 unused records in total on one domain. The Cloudflare UI doesn't currently offer any ways to remove DNS records in bulk, so the process of removing so many manually, and on several domains made me look for a solution.

## A fix

Fortunately one of the other benefits of Cloudflare is that it offers a Rest API which allows you to delete [DNS](https://en.wikipedia.org/wiki/Domain_Name_System) records programmatically. I was able to put together a script to delete the unused records on one of my domains pretty quickly. I already knew I was going to be repeating this task on other domains, and that there would be some different requirements for each, so of course, I ~~wasted some time~~ _did the sensible thing_ and [put together a little repo](https://github.com/mikenewbuild/cloudflare) that could be configured. I haven't done much PHP recently so it was also an excuse to flex that muscle. It's still my favourite scripting language for putting something together quickly.

I honestly couldn't figure out why this happened on some domains and not others, there wasn't anything I could identify as the root cause. Maybe you're here because you've encountered the same problem? If so hopefully [this script might help you out](https://github.com/mikenewbuild/cloudflare)!
