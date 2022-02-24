---
draft: false
date: 2022-02-23
layout: layouts/post.njk
title: Making a Shopify Theme App Extension for Google Site Verification
description: Whipping up a quick Shopify app to take advantage of the new app theme
  extension blocks.
tags:
- shopify

---
Given that I'm _all in_ on Shopify's OS2 themes, I've been looking for a way to experiment with building the recently introduced "app extensions" for themes. These extensions provide a way to add functionality to Shopify themes without the need to change the underlying theme code itself.

Assuming you already have a Shopify Partner account and the [Shopify CLI](https://shopify.dev/apps/tools/cli) installed, then it's incredibly simple to get started with theme app extensions. As a small project to get familiar with them, I set myself the task of creating an app that allows you to insert a tag to verify a site with Google. Although I tend to recommend verifying via DNS records, sometimes it's more suitable to include a meta tag in the `<head>` of the site. 

## Theme app extension benefits

Normally adding a verification tag would mean editing all of the `/layout` files in a theme like `theme.liquid` and `password.liquid` . Once those files are edited it also means maintaining those changes any time you update the theme. Using a theme app extension reduces this burden. 

Shopify hosts the code for the extensions on their own servers, so performance is great, and as a developer you don't to worry about standing up servers or deployments.

## The verification tag

The tag in question is very simple and has the following format:

```html
<meta name="google-site-verification" content="UNIQUE_ID">
```

I want to be able to have a theme block that allows adding the client's `UNIQUE_ID` as a setting in the theme's customisation UI, and once set rendering a valid tag in the `<head>` portion of the site.

## Creating the app

Extensions must be associated with an app so you need to create an app first if you don't have one set up already. The easiest way is to use the CLI:

```bash
shopify app create
```

After running that command, you'll be asked to pick the type of app you want. I went for Node, but it's not particularly important because I'm not worried about creating any UI for the app itself. Next I supplied a name for the app. I just picked something generic: 'Theme Blocks'. It will also ask you which type of app you want to create, for simplicity I picked 'Custom' which means it can only be installed on one specific store.

That created an app and output a link to it in the Partner dashboard. It also provided a link to a page in the dashboard where I could install the theme in my chosen store. I didn’t do that though (yet).

### Creating the extension

There are two types of [theme app extensions](https://shopify.dev/apps/online-store/theme-app-extensions/extensions-framework). Standard “App blocks” and “App embed blocks”. It’s the embed blocks that I’m interested in as they allow you to insert code into the `<head>` portion of the document. You can learn a bit more in Shopify's [Getting Started Guide](https://shopify.dev/apps/online-store/theme-app-extensions/getting-started). 

A theme app extension should be created within the app project itself. This isn't actually that explicit in the documentation, so at first I wasn't sure if it should be treated as a separate project in its own repo but don't make the same mistake. In the root of the project I ran:

    shopify extension create

I was prompted to choose the app I wanted to associate the extension with and I, of course, picked the one I was currently working on. The next question was about which type of extension I wanted to create for which I selected “Theme App Extension”.

The project now contained a folder called `theme-app-extension` scaffolded with empty `assets`, `blocks`, `locales` and a `snippets` folder, along with a `.env` file and `.shopify-cli.yml` file.

## Building a block

Okay, now for the block code itseld. I created a `blocks/google-verification.liquid` file with the following contents:

{% raw %}

```html
{%- if block.settings.google_verification_id != blank %}
<meta name="google-site-verification" content="{{ block.settings.google_verification_id }}">
{%- endif %}

{% schema %}
{
  "name": "Theme Customisations",
  "target": "head",
  "settings": [
    {
      "type": "text",
      "id": "google_verification_id",
      "label": "Google verification ID"
    }
  ]
}
{% endschema %}
```

{% endraw %}

This should make sense if you're familiar with Shopify's theme sections. Essentially I'm defining some settings that can capture the information I need and dynamically insert that data where I need to.

Note the `target` is set to `head` and I’m rendering the tag only on the condition that a `google_verification_id` is provided.

## Publishing the extension

Now I can `cd` into the `theme-app-extension` folder and run

```bash
shopify extension push
```

The following dialog allowed me to register the extension and update the `.env` file, then run any validation before pushing to Shopify. Once it’s pushed, it outputs a link to the app in my Partner dashboard where I can version and publish it. Here I can also enable a development store preview so I can test the changes.

I can now go to a theme in my development store, and in the theme customiser under _Theme Settings > App Embeds_ I can see my new app block sitting there waiting to be enabled. Genuine thrill when stuff like this just works™.

To test it, I enabled the block, added a dummy verification ID, hit save and checked the output theme code. Sure enough, in the `<head>` tag, before the standard Shopify `content_for_header` output I can see the verification tag output using the data I added.

Nice. I’ve managed to modify a theme without having to change any of the underlying theme templates themselves.

## Updating the extension

Shopify lets you work in 'draft' mode, and has a workflow to publish versions of your extension in production so you can push as many changes as you want, and safely test updates in your development store.

## Connecting the extension

To simulate collaborating on an extension I checked out the project repository on another machine and was able to populate the `.env` file by running:

```bash
shopify extension connect
```

## Some notes

It’s worth mentioning that changing the filename of any of the extensions will lose any settings previously created in a theme. So will changing any of the ids in the schema settings, in the same they would if you were using theme sections. I would want to give this some consideration if I was building a public app.

You can only have one theme extension per app, but I'm not sure if there's a limit to the number of blocks it can have. I might want to be conservative with the number of blocks I created in a public app, but the blocks themselves might be more complex as a result. For custom extensions I might prefer to have more simpler blocks to make it easy to add new blocks, and make them more portable between clients too.

Overall, I'm super impressed with the experience of creating my first theme app extension, and I intend to use it a lot as a tool to add theme customisations in future.