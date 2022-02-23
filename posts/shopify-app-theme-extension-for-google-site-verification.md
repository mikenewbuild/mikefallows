---
draft: true
date: 2022-02-23
layout: layouts/post.njk
title: Shopify App Theme Extension for Google Site Verification
description: Whipping up a quick Shopify app to take advantage of the new app theme
  extension blocks.
tags:
- shopify

---
Given that I'm all in on Shopify's OS2 themes, I've been looking for a way to take advantage of app extensions in a theme. This gives you a way to add functionality to Shopify themes without the need to change the underlying theme code. 

Assuming you already have a Shopify Partner account and installed the [Shopify CLI](https://shopify.dev/apps/tools/cli) then it's incredibly simple to get started with app theme extensions. As a small project to get familiar with them, I set myself the task of creating an app that allows you to insert a Google site verification tag. Although I tend to recommend verifying via DNS records, sometimes its easier or more urgent and installing a meta tag in the `<head>` of the site is more appropriate.

## Verification tag format

The tag has the following format:

```html
<meta name="google-site-verification" content="UNIQUE_ID">
```

I want to be able to have a theme block that allows you to add the client's `UNIQUE_ID` as a setting and the result to be the tag in the correct format automatically rendered in the `<head>` portion of the site.

### Creating the app

To use theme extensions you need to create an app first. This is super easy. In the terminal run:

```bash
shopify app create
```

You'll be asked to pick the type of app you want (I went for Node) but it's not particularly relevant because I'm not worried about creating any UI for the app itself. Next I supplied a name for the app, I just picked something generic like 'Theme Blocks'. It will also ask you which type of app you want to create, for simplicity I picked 'Custom' which means it can only be installed on one specific store. 

That created an app and output a link to it in the partner dashboard. It also provided a link to a page in the dashboard where I could install the theme in my chosen store. I didn’t do that though (yet).

Next I navigated to the root of the project, initiated a repository and committed the all the files Shopify had installed for me (basically a scaffold of a NextJS app with a Koa server).

### Creating the App Theme Extension

There are two types of [theme app extensions](https://shopify.dev/apps/online-store/theme-app-extensions/extensions-framework). Standard “App blocks” and “App embed blocks”. It’s the embeds that I’m interested in as they allow you to insert code into the `<head>` portion of the document. You can learn a bit more in Shopify's 
[Getting Started Guide](https://shopify.dev/apps/online-store/theme-app-extensions/getting-started)

A theme app extension should be created in the app project. This isn't actually that explicit in the documentation, so at first I wasn;t sure if it should be a separate project in its own repo, but don't do that. In the root of the project I ran:

```
shopify extension create
```

I was prompted to choose the app I wanted to associate the extension with, I of course picked the one I was currently working on. The next question was about which type of extension I wanted to create for which I selected “Theme App Extension”.

The project now contained a folder called `theme-app-extension` scaffolded with empty `assets`, `blocks`, `locales` and a `snippets` folder, along with a `.env` file and `.shopify-cli.yml` file. 

Okay, now for the block code. I created a `blocks/google-verification.liquid` file with the following contents:

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

This should make sense if you're familiar with Shopify's theme sections. Essentially I'm defining some settings that can capture the information I need and dynamically insert that where I need to.

Note the `target` is set to `head` and I’m rendering the tag on the condition that a `google_verification_id` is provided.

Now I can `cd` into the `theme-app-extension` folder and run

```bash
shopify extension push
```

It offered to register the extension for me and update the `.env` file, then run any validation before pushing to Shopify. Once it’s pushed it outputs a link to the app in my Partner dashboard where I can version and publish it. Here I can also enable a development store preview so I can test the changes. As I’m only working on one store in this instance, I’m not sure if it’s that important, but I’m going to do that first anyway.

After I enable the development store preview, I can now go to the Debut theme in my development store, and in the theme customiser under Theme Settings > App Embeds I can see my new app block waiting to be enabled. What a rush.

To test it, I enable the block, add a dummy verification ID, hit save and check the output theme code. Sure enough, in the `<head>` tag, before the standard Shopify `content_for_header` output I can see the verification tag output using the data I added.

This is fantastic! I’ve managed to modify a theme without having to change any of the underlying theme templates themselves. 

It’s worth noting that changing the filename of any of the extensions will lose any settings, so will changing any of the ids in the schema settings, in the same they would if you were using the schema in a theme. 

To edit the theme extension when checking out a fresh clone out the repository, you can populate the `.env` file by running:

```bash
shopify extension connect
```