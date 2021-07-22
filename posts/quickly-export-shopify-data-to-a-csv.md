---
draft: false
date: 2021-07-12
layout: layouts/post.njk
title: Quickly export Shopify data to a CSV
description: 'A lightweight and configurable node script to export Shopify data. '
tags:
- node
- shopify

---
Shopify provides some simple tools to export your data from the admin. There are also plenty of apps available that enable you to manage complex data exports.

But sometimes I just want to export some data into a CSV file, either from a resource that Shopify doesn't expose in the admin, or that includes a field like the resource ID that's not present in the standard exports. It would be nice to be able to do it without the cost or hassle of installing an app.

I've found a couple of simple scripts that have been published that do something similar, but they were either unmaintained and needed updating or required you to hardcode values to configure the resources you wanted to export.

So I decided this would be a good excuse to try and learn some more [Node.js](https://nodejs.org/) basics and leverage a handy [Node wrapper for the Shopify API](https://www.npmjs.com/package/shopify-api-node).

My end goal was to have a script where I could just set up some API access credentials, plug some variables into a `.env` file and quickly kick out a CSV from the command line. Referencing some of the existing implementations, I surprised myself by putting something together that did that in less than an hour and fewer than 100 lines of code.

It made me realise how easy and accessible using Node is for running small tasks locally where previously I might have used a shell script or full blown app.

You can check out and use my simple [Shopify API Exports](https://github.com/mikenewbuild/shopify-csv-export) script on Github.
