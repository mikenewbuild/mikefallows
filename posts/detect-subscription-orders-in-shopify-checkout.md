---
draft: false
date: 2023-02-17
layout: layouts/post.njk
title: 'Detect subscription orders in the Shopify checkout'
description: How to determine whether a Shopify order includes a subscription.
tags:
- shopify

---
This week I needed to help a client distinguish which orders contained subscriptions so they can measure the results of their PPC[^1] advertising. As their business model is heavily geared towards subscriptions and subscriptions will typically indicate a much higher LTV[^2], measuring which adverts are more likely to generate subscription purchases is a key metric.

It was a bit harder than I expected, and that's down to the limited amount of data available on the 'Thank You' page of Shopify's checkout.

## The result

Here's the final logic that I used in the additional scripts part of the checkout:

{% raw %}
```ruby
# track subscriptions
assign includes_subscription = false
for line_item in line_items
  if line_item.selling_plan_allocation.selling_plan.name contains 'Delivery every'
    assign includes_subscription = true
  endif
endfor
```
{% endraw %}

That will check if any of the line items on an order include a subscription purchase and give you a nice variable you can use to conditionally fire an event, or pass as a value to Google Tag Manager.

For example, to fire a Meta pixel 'Subscribe' event:

{% raw %}
```js
{%- if includes_subscription == true %}
  fbq('track', 'Subscribe');
{%- endif -%}
```
{% endraw %}

To include as a `dataLayer` variable.
{% raw %}
```js
dataLayer.push({
  event: 'purchase',
  ecommerce: {
    // ...
    'includes_subscription': {{ includes_subscription | default: false }},
    // ...
  }
});
```
{% endraw %}


## Why the hacky inspection of selling_plan.name?

As I mentioned earlier, you're a bit limited with the data you can access on the initial 'Thank You' page that you're presented with immediately after placing an order. That's because the full order hasn't been created yet due to the potential delays in building up the order in a background task.

It's also very hard to test the Thank You page, as to my knowledge you can't simulate it, so you have to place a live order to test each code change. Initially, I ran my tests by visiting the status page of an order that had already been placed. The 'Order Status' page has access to the entire order object which, you can use to find out if `selling_plan.recurring_deliveries` is set to `true`. That appeared to be the most robust way to identify subscription orders. Unfortunately, the only field available on the 'Thank You' page is `selling_plan.name`.

As far as I could tell, at least in my client's case (English language only checkout), the selling plan name for a line item would always begin 'Delivery every' as in, *'Delivery every 1 week'*, *'Delivery every 2 weeks'*, etc. The other types of selling plan names would not.

## Why not use Customer Events?

There certainly was the option of using a [Checkout Completed Customer Event](https://shopify.dev/docs/api/pixels/customer-events#checkout_completed) instead of the checkout additional scripts. And while I welcome the introduction of this feature, I've found it much harder to test as the delay between making changes and seeing those updates reflected in the shop have been unpredictable.


[^1]: Pay Per Click: display advertising through platforms like Google or Meta where you pay for the amount of traffic the advert drives to your website.
[^2]: Life Time Value: the total amount spent by an individual customer over their lifetime.
