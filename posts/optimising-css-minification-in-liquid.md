---
draft: false
title: Optimising CSS minification in Liquid
description: >-
  Optimising a technique to use Liquid to minify CSS code for performance in
  Shopify themes.
date: 2023-10-24T23:00:00.000Z
tags:
  - shopify
  - css
  - testing
layout: post
---

<div class="note">

  2025-09-22 Update: [David Warrington posted about](https://ellodave.dev/blog/article/inline-critical-css-in-liquid/) using the recently released `inline_asset_content` filter to liquid ([see docs](https://shopify.dev/docs/api/liquid/filters/inline_asset_content)) to minify assets. This filter will automatically minify CSS (and JavaScript) files when they are inlined so I'm updating to use that technique instead.

</div>


One of the mailing lists I subscribe to is _I Only Speak Liquid_, where they regularly publish emails from their stable of developers with some great insights into working on Shopify themes and more generally working as a freelancer/consultant in the Shopify ecosystem. If you're looking for good content on those subjects, I definitely recommend [subscribing](https://ionlyspeakliquid.beehiiv.com/subscribe).

One tip mentioned in [an email by Billy Noyes](https://ionlyspeakliquid.beehiiv.com/p/speak-liquid-33-minify-css-liquid) was a way to use Liquid to minify CSS. The technique was provided by a community member in [this forum post](https://community.shopify.com/c/technical-q-a/tool-to-minify-css-liquid/m-p/1123337). It's a great way to remove unnecessary characters (like whitespace and comments) from a CSS file without the need for an additional build tool, so it's a low effort way to increase a site's performance by reducing its page weight.

## Original

Here is the initial implementation (rewritten slightly to make comparison easier, and added some comments to explain what's happening):

{% raw %}
```liquid
{% capture bloated %}
/* CSS ... */
{% endcapture %}

<!-- CSS {{ bloated.size }} chars -->
{%- liquid
  assign original = ''
  # remove line breaks,
  # multiple whitespace characters and
  # split on closing comment tags
  assign chunks = bloated | strip_newlines | split: ' ' | join: ' ' | split: '*/'
  # iterate over each chunk of CSS
  for chunk in chunks
    # remove comments and whitespace around syntax characters
    assign mini = chunk | split: '/*' | first | strip | replace: '; ', ';' | replace: '} ', '}' | replace: '{ ', '{' | replace: ' {', '{'
    assign original = original | append: mini
  endfor
  # calculate characters saved
  assign change = original.size | times: 1.0 | divided_by: bloated.size | times: 100.0 | round: 1
%}
<!-- original    -{{ bloated.size | minus: original.size }}   {{ 100 | minus: change }}%  -->
```
{% endraw %}

This alone was providing me with a 10% reduction across most of the CSS I tried it on. However, having looked at the code, I thought I could see an opportunity to improve on it _very slightly_, and wanted to see if there were any meaningful gains to be made. I noticed that the final semicolon in a ruleset was being preserved, but it can [safely be removed](https://css-tricks.com/css-basics-syntax-matters-syntax-doesnt/#aa-mostly-important-semicolons). If you have only 100 rulesets that could still save up to 100 characters. That extra bit of code was `replace: ';}', '}'`.

## Test

I wanted to find out how much of a difference this made on a real codebase, and also test that nothing would break as a result, so I set up the following test. I used a 5,000+ lines CSS file from one of my projects to test the results.

{% raw %}
```liquid
{% capture bloated %}
// 5000+ lines of CSS
{% endcapture %}

<!-- CSS {{ bloated.size }} chars -->
{%- liquid
  assign original = ''
  assign chunks = bloated | strip_newlines | split: ' ' | join: ' ' | split: '*/'
  for chunk in chunks
    assign mini = chunk | split: '/*' | first | strip | replace: '; ', ';' | replace: '} ', '}' | replace: '{ ', '{' | replace: ' {', '{'
    assign original = original | append: mini
  endfor
  assign change = original.size | times: 1.0 | divided_by: bloated.size | times: 100.0 | round: 1
%}
<!-- original    -{{ bloated.size | minus: original.size }}   {{ 100 | minus: change }}%  -->

{%- liquid
  assign optimised = ''
  assign chunks = bloated | strip_newlines | split: ' ' | join: ' ' | split: '*/'
  for chunk in chunks
    assign mini = chunk | split: '/*' | first | strip | replace: ': ', ':' | replace: '; ', ';' | replace: '} ', '}' | replace: '{ ', '{' | replace: ' {', '{' | replace: ';}', '}'
    assign optimised = optimised | append: mini
  endfor
  assign change = optimised.size | times: 1.0 | divided_by: bloated.size | times: 100.0 | round: 1
%}
<!-- optimised   -{{ bloated.size | minus: optimised.size }}   {{ 100 | minus: change }}%  -->

```
{% endraw %}

## Results

Here are the results:

```html
<!-- CSS 121066 chars -->
<!-- original    -12829   10.6%  -->
<!-- optimised   -16091   13.3%  -->
```

Nice! An extra 300+ characters removed equating to over 2.5% more of a reduction. The output CSS worked perfectly still. For very little effort or intervention, a 10%+ reduction is a great result, and will benefit almost any project.

## Extracting to a snippet

Finally to wrap it up I created a snippet called `minify-css.liquid` so that I can easily add this feature to any large CSS files as well as to snippets and sections that may also contain large chunks of CSS that could benefit from minification.

{% raw %}
```liquid
{%- liquid
  assign chunks = input | strip_newlines | split: ' ' | join: ' ' | split: '*/'
  for chunk in chunks
    assign mini = chunk | split: '/*' | first | strip | replace: ': ', ':' | replace: '; ', ';' | replace: '} ', '}' | replace: '{ ', '{' | replace: ' {', '{' | replace: ';}', '}'
    echo mini
  endfor
%}
```
{% endraw %}

So it can even be used like this:

{% raw %}
```liquid
<style>
{%- capture bloated %}
// Unminified CSS
{%- endcapture %}

{%- render 'minify-css', input: bloated -%}
</style>
```
{% endraw %}

Now I can maintain beautiful, well documented, human-readable CSS code across an entire theme and still have it optimised for performance without any additional build tools.
