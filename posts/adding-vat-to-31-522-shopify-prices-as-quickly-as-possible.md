---
draft: false
date: 2021-10-20
layout: layouts/post.njk
title: Adding VAT to 31,522 Shopify prices as quickly as possible
description: Yay! Shopify finally handles tax in a way that's useful for Europeans.
tags:
- shopify

---
I built my first Shopify theme in 2012, and after years of custom built PHP carts, and third party self-hosted products, Shopify was a breath of fresh air. No servers to worry about, a pleasant templating language in Liquid, great support and an API that gave you advanced capabilities when you needed it.

## Shopify and the VAT problem

I really only had one major gripe: VAT support. Shopify took a very North American-centric approach to tax, that assumed that you expected to see pre-tax prices with the tax added at the checkout. European tax laws require prices to be displayed inclusive of tax, and that proved to be a big issue. Customers outside the EEC weren't required to pay tax on products (they would often be subject to import duties instead) so it was common - particularly with high ticket items - to offer the net price to customers outside the EEC. This was difficult with Shopify, as it had no way to allow you to _deduct_ the domestic tax from a product's price at checkout.

## The hack

The solution for years was to store all prices as their net value and customise themes to display a VAT calculated price. This is essentially a simple solution, but caused no amount of headaches when integrating Shopify with third parties or trying to build complex functionality, not to mention odd penny rounding issues.

 It meant I became quite the expert on all the ways that this approach could break, and spent a huge amount of my professional time working around these limitations.

## The eventual fix

Almost ten years later, in early 2021 the fix I had been waiting for finally arrived. Ironically this may be the one upside of Brexit for me as it seemed to coincide with Shopify making a host of changes to accommodate the UK leaving the EU. There was now a checkbox in the settings to deduct VAT at checkout. Hallelujah.

## The easy way

Soon it became time to start taking advantage of this on client sites. For smaller stores with relatively fixed catalogues this was a pretty simple process of removing any price customisations in the theme and updating the prices and the setting. For a few dozen products a quick import of new prices updated in a spreadsheet was sufficient.

## The hard way

However, some of my clients have been on Shopify for years, consistently publishing new products on a weekly basis. In one client's case I believe they were one of the first Shopify Plus shops in the UK, and had a catalogue of 8,187 products, totalling 31,522 individual prices that needed updating! Such a fundamental change required closing the shop while prices were updated, and as a high traffic site, minimising downtime was a priority.

Running that amount of data through a spreadsheet risked being slow and extremely error prone. Some prices needed to be preserved because they're not subject to VAT like books and magazines. A slight mistake could overwrite the data on over 8,000 products.

I realised I could use my [Shopify CSV Export](https://github.com/mikenewbuild/shopify-csv-export) app to optimise the process. I set up a development store and imported the existing catalogue to safely test against (it took over 12 hours for the initial import to complete!). This doubled to test any theme updates against too, so I could be confident that prices would be displayed properly after the switch - some of the code in that theme hadn't been touched for years.

I then set about writing a script that would create an optimised CSV of just the minimal data needed to modify prices. Then I allowed for it to split the export into a backup of the existing prices (so I could reset if anything went wrong) and the new modified prices that we would want to import.

## Optimising imports

Importing the full 31,522 updated prices took over 80 minutes - but the bulk of those products aren't even published on the online store. The total number of prices for for published products was 4,300 which took less than 10 minutes to import. Nice! We would only need to close the store for a few minutes to update the online prices, publish the theme and make any changes to settings and apps we needed to. We could import the rest of the prices for the physical store and historical products separately.

I updated the script so that it would create 4 files on export:

* the _original_ prices of _published_ products
* the _original_ prices of _unpublished_ products
* the _updated_ prices of _published_ products
* the _updated_ prices of _unpublished_ products

The exports were always much faster by the way, taking seconds to generate the full 31,522 prices, even when split into existing and new. This allowed me to take an up-to-the-minute snapshot of the prices as we closed the site, meaning there was no impact to the business operations in preparation either.

In the end, even with manual acceptance testing and some last minute decisions, the site was closed for less than 20 minutes. A few moments after re-opening it was a relief to see an order placed with correctly calculated tax, and the rest of the prices completed updating about an hour later.

## It pays to test

Taking the time to set up the development store and run the tests may have saved hours of problems, and possibly even some disastrous outcomes. It gave me the chance to test some hypotheses, measure real-word examples and safely experiment with solutions without impacting the day-to-day business. Changing prices, and updating the entire catalogue has such a high risk of going wrong that perhaps the biggest benefit of tests is providing the confidence to be able to safely make the switch when the time came.
