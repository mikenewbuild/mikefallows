---
draft: false
date: 2023-03-06
layout: layouts/post.njk
title: 'Observing cart changes in a Shopify theme'
description: Identifying and responding to changes in a customer's cart.
tags:
- shopify
- javascript

---
Recently I needed to write some code to monitor and respond to changes made to a Shopify cart. The script would need to be added to several themes and be independent of the specific theme the site used or potential apps that were (or would be) installed.

This presented a challenge as cart interactions can take many forms and vary across themes. For example, as well as a dedicated cart page most sites have some sort of dynamic 'Ajax' cart. Many can also have apps integrated with the theme that enable products to be added to the cart in different ways.

I've often seen crude attempts to solve this by adding event listeners to the 'Add to cart' button on the product page. But this falls down once you consider things like 'Quick Buy' or 'Upsell' features, or take into account that simply clicking an 'Add to cart' button doesn't guarantee a product is *actually* added to the cart. Problems like network request errors, or items becoming sold out come into play and it quickly becomes complicated.

## Detecting changes to the cart

To solve this I opted to record requests to both the cart page, and the `/cart/*` endpoints used to dynamically mutate the cart. This would mean that regardless of which part of the theme or an app was updating the cart, I would be able to detect and react to it.

Determining if a request is made to the cart page is easy enough as you can just inspect the location or type of the current page.

In Liquid you can access the type of page from the `request` object.

{% raw %}

```js
const page_type = {{ request.page_type | json }};
```

{% endraw %}

It's a bit more complicated to watch for dynamic requests, but you can do that with a `PerformanceObserver` that filters on `resource`-based performance activity, and within that modern `fetch` requests as well as the older `xmlhttprequest` type.

The `observeCartChanges` function below
- loops over entries to the `PerformanceObserver`
- checks if the entry is an Ajax request
- checks if the endpoint of the request contains `/cart/`[^1]

Finally, it initiates the observer restricted to only `resource` entries.

```js
function observeCartChanges() {
  const cartObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const isValidRequestType = ['xmlhttprequest', 'fetch'].includes(entry.initiatorType);
      const isCartChangeRequest = /\/cart\//.test(entry.name);
      if (isValidRequestType && isCartChangeRequest) {
        // handle cart request
      }
    });
  });
  cartObserver.observe({ entryTypes: ["resource"] });
}
```

## Determine the changes to the cart

Now that we have a way to observe _when_ the cart is changed we next need to determine _how_ the cart has changed.

At first, I considered inspecting the endpoint that was requested, eg. `cart/add.js` and assume that the items in the payload had been added to the cart. However, just because the request has been made is no guarantee that it was successful. It could be an invalid request such as an out-of-stock item or use badly formed data.

I decided the better approach is to track the current state of the cart and, given a request to mutate the cart, get the latest version and figure out what changes have been made. I chose to use a fetch request to get the latest cart state and track it in local storage for reference.

### Retrieving and storing cart state

Here's a quick example of fetching the current cart, as well as storing and then retrieving it from local storage:

```js
const response = await fetch('/cart.js');
const cart = response.json();
localStorage.setItem('cart', JSON.stringify(cart));
const storedCart = JSON.parse(localStorage.getItem('cart'));
```

### Identifying items that have been added or removed

Next, to work out whether items have been added or removed from the cart, I created a function that accepts the old cart items (eg. retrieved from local storage) and some new cart items (eg. retrieved from a fetch request) and returns a tuple of the added and removed items. To do this, I find the items present in the new cart that are not present in the old cart and stored these in the `added` array. Next, I do the inverse and check for items in the old cart that no longer exist in the new cart to determine what has been removed, and stored them in the `removed` array.

It starts getting a bit complicated to read here as I've used some quite generic terminology like `l` and `r` for _left_ and _right_, and used `li` to represent the _items_ on the left-hand side. I try to avoid this type of naming, but as this is just a simple algorithm for comparing arrays, the terseness is okay for me. Fortunately, because Shopify applies a unique `key` property to each line item in the cart, it's easy to check whether the current line exists in both carts. The `onlyInLeft` function takes the two carts and filters out any items in the left cart that exist in the right cart.

Here's an example of how that function could look:

```js
function findCartChanges(oldCart, newCart) {
  const onlyInLeft = (l, r) => l.filter(li => !r.some(ri => li.key == ri.key));
  return {
    added: onlyInLeft(newCart.items, oldCart.items),
    removed: onlyInLeft(oldCart.items, newCart.items),
  };
}
```

### Identifying items that have been updated

So far, so good. But this still doesn't take into account quantities of exiting line items being increased or decreased.

For example, if a customer already has _Product X_ in their cart and then adds another _Product X_ then I want to record that item in the `added` array with a quantity of 1 (to represent the quantity _added_ to the previous state of the cart). I considered adding a third property to the returned object with a key of `updated`, but the distinction wasn't necessary for my use case. Quantity changes could be recorded in the relevant `added` and `removed` properties.

To do that, I assign the original calculations to a `result` variable. That allows me to iterate over the new cart's items and look for matching lines (by `key`) that exist in the old cart, but have a different `quantity` value. I can then calculate the difference between the two quantities – a negative value means the quantity was reduced and a positive value means increased. So I can make a copy of the line item, update its `quantity` to an absolute number of the calculated value (so that negative numbers become positive), and then `push` that item onto the correct property of the `result` object.

Here's how that looks:

```js
function findCartChanges(oldCart, newCart) {
  const onlyInLeft = (l, r) => l.filter(li => !r.some(ri => li.key == ri.key));
  let result = {
    added: onlyInLeft(newCart.items, oldCart.items),
    removed: onlyInLeft(oldCart.items, newCart.items),
  };

  oldCart.items.forEach(oi => {
    const ni = newCart.items.find(i => i.key == oi.key && i.quantity != oi.quantity);
    if (!ni) return;
    let quantity = ni.quantity - oi.quantity;
    let item = { ...ni };
    item.quantity = Math.abs(quantity);
    quantity > 0
      ? result.added.push(item)
      : result.removed.push(item)
  });

  return result;
}
```

## Wrapping up

Here's an example of wrapping it all up into a `CartWatcher` class with an `init` method to handle fetching current cart details in case there have been changes between requests and setting up the observer for dynamic requests. The `emitCartChanges` method fires a custom event with the details of the changes whenever the cart is updated. This allows me to build several features that can independently listen and respond to changes in the cart without having to repeat this code. If I needed more flexibility I could add the ability to configure things through the constructor such as the keys used in the events and local storage (if I was worried about collisions).

```js
class CartWatcher {

  init() {
    this.emitCartChanges().then(() => {
      this.observeCartChanges();
    });
  }

  async fetchCart() {
    const response = await fetch('/cart.js');
    return response.json();
  }

  storeCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

 storedCart() {
    return JSON.parse(localStorage.getItem('cart')) || { items: [] };
  }

 findCartChanges(oldCart, newCart) {
    const onlyInLeft = (l, r) => l.filter(li => !r.some(ri => li.key == ri.key));
    let result = {
      added: onlyInLeft(newCart.items, oldCart.items),
      removed: onlyInLeft(oldCart.items, newCart.items),
    };

    oldCart.items.forEach(oi => {
      const ni = newCart.items.find(i => i.key == oi.key && i.quantity != oi.quantity);
      if (!ni) return;
      let quantity = ni.quantity - oi.quantity;
      let item = { ...ni };
      item.quantity = Math.abs(quantity);
      quantity > 0
        ? result.added.push(item)
        : result.removed.push(item)
    });

    return result;
  }

  async emitCartChanges() {
    const newCart = await this.fetchCart();
    const oldCart = this.storedCart();
    const changes = this.findCartChanges(oldCart, newCart);

    const event = new CustomEvent("cart_changed", { detail: changes });
    window.dispatchEvent(event);

    this.storeCart(newCart);
  }

 observeCartChanges() {
    const cartObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const isValidRequestType = ['xmlhttprequest', 'fetch'].includes(entry.initiatorType);
        const isCartChangeRequest = /\/cart\//.test(entry.name);
        if (isValidRequestType && isCartChangeRequest) {
          this.emitCartChanges();
        }
      });
    });
    cartObserver.observe({ entryTypes: ["resource"] });
  }
}
```

Here's a quick example of newing up the class and adding a listener for the `cart_changed` event that will log out the changes to the cart whenever it is updated.

```js
const myCartWatcher = new CartWatcher;
myCartWatcher.init();
window.addEventListener("cart_changed", e => console.log(e.detail));
```

You could of course use this to provide some feedback to the customer, log some data in analytics or provide an offer based on the change to the cart.


[^1]: According to the [Cart API docs](https://shopify.dev/docs/api/ajax/reference/cart), regardless of the locale, the endpoints that mutate the cart all contain `/cart/` eg. `/{locale}/cart/add.js`, `/{locale}/cart/update.js`, etc.
