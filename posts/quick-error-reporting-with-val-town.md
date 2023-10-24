---
draft: false
title: Quick error reporting with Val Town
description: >-
  Using Val Town's simple storage and notifications to rig up a lightweight
  error reporting system.
date: 2023-08-21T12:00:00.000Z
tags:
  - javascript
  - shopify
  - testing
layout: post
---

<div class="note italic">
<p>This post was updated on 24th October 2023 to reflect the changes in Val Town v3.</p>
</div>

Recently I needed to quickly inspect a script running in the 'Additional Checkout Scripts' portion of the order thank you / status page for a Shopify client. These are copy-paste scripts and there's no easy way to manage them, and it's particularly difficult to test them properly without running real orders. The client was seeing some odd data in their reporting and suspected that there might be some occasional errors with one of the scripts, but it was hard to work out when or why this might be happening.

## Welcome to Val Town

I'd recently heard about the features of [val.town](https://val.town) – a new project that enables you to quickly create javascript functions with a public API endpoint, and some neat features like a small amount of storage and an email notification system, even on their free plan.

I was honestly blown away by how quickly I could add some observability to a script this way. At the heart of it, Val Town lets you build some serverless functions via the web browser using an interface that will be familiar if you've used GitHub gists.

All I wanted to do was be able to log a minimal amount of data whenever the script runs and let Val Town notify me by email if an error was detected in the script so I can investigate it.

## Creating a store

First, let's create a store:

```js
export let store = [];
```

Yep, that's literally it. Val Town will let you add up to 100kb of data to that value (on its very reasonable free tier), at which point it will begin to truncate the data. This is plenty for my purposes as I'm only storing an order id and at most I'm only interested in a few dozen of the latest records.

Still, it might be useful to have a way to empty our store (let's say you potentially fill the store up with lots of dummy data while preparing to write a blog post 👀), so you can create an additional Val with the following snippet. Note that we're importing `set` from Val's standard library to update the value of one of our other Val's by reference. Also note that it's constructed as an IIFE to make sure that the function is invoked when you 'run' the Val.

Just beware that when you run this Val, the results may not appear instantly (ie. your store won't be cleared out straight away so wait a few moments to see the results).

```js
import { set } from "https://esm.town/v/std/set";

export const clear = (async () => {
  await set("store", []);
})();
```

## Creating an endpoint

Finally, the cool part: a Val that serves as our web endpoint to receive the data from our script. Here, we're accepting three arguments, `subject`, `message` and an optional `error`. The subject and message will be added to the store, and if an error is present it will also use the `email` function from the standard library to send me an email. Val will only send emails to the email address of the account. This is a totally acceptable limitation, but I guess if you needed to notify others you could set up a forwarding filter.

You should also note that I'm importing my `store` Val so that I can append to it and then use the `set` function to update the Val with the new contents.

```js
import { email } from "https://esm.town/v/std/email";
import { set } from "https://esm.town/v/std/set";
import { store } from "https://esm.town/v/<user>/store";

export async function report(subject, message, error = false) {
  store.push({ subject, message });
  await set("store", store);
  if (error) {
    await email({
      subject: `Error: ${subject}`,
      html: `<pre>${message}</pre><hr><pre>${error}</pre>`,
    });
  }
}
```

 Remember to click the lock icon on the Val to convert from a 'private' Val. Private Val's need an API key that you wouldn't want to leak publicly.

 ### A note on security

 By making the Val unlisted (or public) you can send unauthorised web requests. For the purpose of knocking up some temporary logging on a protected part of the internet (a checkout thank you page) you have _some_ security through obscurity, but it's not enough for general purpose, so just keep this in mind. I'm certainly not storing or transferring any sensitive data (only an order id reference), and I'm aware that the endpoint could be abused to spam me at which point I'd have to take measures to defend against that if it were the case (like, change the Val's endpoint?). If you make the Val 'public' (as opposed to unlisted) you make it available to other Val users to reference inside their Vals.

## Sending data to Val Town

{% raw %}
With that in place, you will need to add some code to format your data and send the request to the API endpoint that Val Town provides. Here I'm storing the strings for the subject and message data I want to store (Shopify's Liquid syntax will replace the `{{ shop.url }}` and `{{ order_id }}` dynamically). I append any error that is thrown in the script that I want to test and finally, use the `fetch` method to send this data to Val Town. Anything you include in the `args` parameter will be passed as arguments to the Val.
{% endraw %}

{% raw %}
```js
let report = [
  `Order on {{ shop.url }}`,
  `order_id: {{ order_id }}`,
];

try {
  // main script to test
} catch (error) {
  report.push(error);
}

fetch("https://api.val.town/v1/run/<username>.report?args=" + JSON.stringify(report));
```
{% endraw %}

With this tool you can have a simple mechanism for reporting how and when a script runs and an email notification for errors. I can see plenty of ways this could be augmented to capture more information or to create additional Vals to inspect the store, like looking for duplicate order IDs being logged. As Val Town has a built-in 'Interval' system you could even periodically run Vals to clear your log, or aggregate the data and email yourself a summary.

Val Town is very cool.
