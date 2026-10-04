---
draft: false
title: Prefill a Shopify discount with the Fetch API
description: Set a prefilled discount in checkout with a fetch request.
date: 2023-10-23T10:00:00.000Z
tags:
  - javascript
  - shopify
updates:
  - date: 2026-10-04
    note: >-
      Since May 2025 the Cart AJAX API accepts a [`discount` parameter on
      `/cart/update.js`](https://shopify.dev/docs/api/ajax/reference/cart),
      which is the documented way to apply a code from theme code, so I'd use
      that now.
---


Shopify has a method for [prefilling discounts at checkout](https://help.shopify.com/en/manual/discounts/managing-discount-codes#promote-a-discount-using-a-shareable-link). It's designed to allow a merchant to share a link for marketing purposes so that visitors using the link will conveniently have the discount applied at checkout rather than having to remember the spelling of the code, or get frustrated with typos. The discount link takes the format `<SITE URL>/discount/<DISCOUNT CODE>`.

Visiting that link will store a discount code in a browser Cookie (to be read later at the checkout), and then redirects the visitor to the homepage[^1] so that the whole process feels seamless.

## Why not use an Automatic Discount?

Shopify also supports [Automatic Discounts](https://help.shopify.com/en/manual/discounts/discount-types#automatic-discounts) that don't rely on having a specific code applied at checkout. Unfortunately, there are some limitations to Automatic Discounts, so certain discounts can only be achieved when requiring a code.


## Just use `fetch`

There are also some cases where traffic may already be inbound to a specific page and there's no opportunity to use the `/discount/` link directly. For that case (and the one above) I set up a simple section that a client can add to any page to make a 'visit' invisibly with a `fetch` request and have the discount prefilled. I chose not to directly manipulate or create the Cookie myself as that would involve a lot more code and as the format of the Cookie is not documented, it's also more likely to change without any notice and silently break. So this simple one-liner does the job and should be well supported.

Here's the code with section settings that allow it to be added to your OS2 templates.

```js
{%- if section.settings.discount_code != blank -%}
<script>fetch('/discount/{{ section.settings.discount_code }}');</script>
{%- endif -%}

{% schema %}
{
  "name": "Prefill discount",
  "class": "shopify-section--prefill-discount",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "discount_code",
      "label": "Discount code"
    }
  ],
  "presets": [
    {
      "name": "Prefill discount"
    }
  ]
}
{% endschema %}
```

## Caveats

Since July 2025, [codes from shareable links combine with codes already in the cart](https://changelog.shopify.com/posts/discount-codes-from-shareable-links-can-now-combine-with-existing-codes-in-the-cart) where your [combination settings](https://help.shopify.com/en/manual/discounts/discount-combinations) allow it. Before that, Shopify would only store and apply one prefilled discount, so visiting a page with this section would override any code a visitor already had. Either way, be careful not to leave expired or unwanted versions of these sections live on the site, as they will still apply their code!

[^1]: Actually, it's even better, you can add additional parameters to the link to redirect to another part of your site besides the homepage, as you can see [in the docs](https://help.shopify.com/en/manual/discounts/managing-discount-codes#promote-a-discount-using-a-shareable-link).
