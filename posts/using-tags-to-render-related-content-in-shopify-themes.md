---
draft: false
date: 2021-12-21T00:00:00.000Z
layout: layouts/post.njk
title: Using tags to render related content in Shopify themes
description: The trick I use to leverage tags to identify and display related content.
tags:
  - shopify
_template: blog_post
---


With the recent launch of Shopify's OS2 themes, I wanted to reflect on a technique that has been extremely useful as a way to add richer layouts to themes. OS2 introduced a way to add Metafields natively and easily generate new templates via the theme editor, including fields that can also pull in data based on those Metafields.

This latest combination has opened up a native way to build rich templates without the need to edit code directly or resort to third-party apps. The ability to add features via third-party apps is one of the killer features of Shopify. That said, I've always had huge reservations about adding apps that change, or require changes to the theme code. As well as introducing a potential maintenance burden when updating or switching themes, it also seems to carry a high risk in terms of breaking the website in a very consumer-facing and hard-to-debug way. It's not unusual for store owners to contact me to resolve issues caused by the (un)installation of apps that may not even necessarily be the fault of the app developers.

## Benefits of tags

The big benefit I see of using tags is how well they are already supported in Shopify's admin. They are already exposed in the admin when editing resources, it's possible to group resources by tag and either add or remove tags in bulk making it easy for a store owner to manipulate tags, or find and change resources with a given tag.

The only real downsides are the lack of tags on resources like collections or pages. But most use cases I've encountered have applied to products and articles anyway.

## Using tags as a key-value store

By defining a structure for your tags, it's possible to use them as a type of key-value store. I tend to do this by defining a separator for namespace, key and value. eg. `namespace:key:value`.

Using that structure means that within liquid we can look for tags with the given namespace, or namespace and key, then extract the value. Let's say we want to be able to associate a related collection with a product. If our namespace was `theme` and our `key` was `related-collection`, and the value could be the handle of the collection we wanted to identify, then a tag might look like `theme:related-collection:bestsellers`.

If that tag was assigned to an article then in a template with access to the `article` object, we could access the collection like this:

{% raw %}

```liquid
{% liquid

assign needle = 'theme:related-collection:'

for tag in product.tags
	if tag contains needle
		assign handle = tag | remove: needle
        break
    endif
endfor

assign related_collection = collections[handle]

%}
```

{% endraw %}

You can then, for example, display the products from that collection below the article.

## Why the namespace?

Although it's not necessary to use the namespace in the example above, the namespace has a couple of useful benefits. First, it protects you from potential collisions with tags created by apps or that a shop owner wants to apply. Second, you can use the presence of the namespace to quickly exclude those tags in the case that you want to use and expose tags for their "traditional" use, i.e. to filter for a related topic.

Here's a simple example of excluding tags by detecting the presence of the namespace:

{% raw %}

```liquid
<ul class="tags">
{%- for tag in product.tags %}
	{%- unless tag contains 'theme:' %}
		<li>{{ tag }}</li>
    {%- endunless %}
{%- endfor %}
</ul>
```

{% endraw %}

## Use cases

Along with the ability to associate a group of products with an article, other use cases I've found have included storing rich content in a single blog post or page, and then associating that with several products. This could be videos, animation, or a gallery of images that can then be displayed on multiple product pages, without the need to duplicate the content or update it on each product.

The value doesn't need to be a handle either, it can be used to store meaningful strings like a colour, or a date that can be used in the layout. You could then use those to define the colour of elements on the page, or a countdown timer.
