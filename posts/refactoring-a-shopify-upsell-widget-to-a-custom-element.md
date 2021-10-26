---
draft: true
date: 2021-10-26
layout: layouts/post.njk
title: Refactoring a Shopify upsell widget to a Custom Element
description: Often shop owners want the ability to offer a small upsell that can be
  easily added to an order.
tags:
- Web Components
- Shopify

---
Clients often ask me for a good way to upsell a product at the point of purchase. A good example might be a florist wanting to sell a vase with a bouquet. The main product they're selling is the bouquet, but it's probable that the customer may also like to add a vase to their order at the same time.

One solution would be to add a "fake" variant to the product that acts as a combo of the bouquet + vase, but this quickly falls down with stock, reporting, etc as the upsell vase is its own product with inventory that should really exist separately. It's also then necessary to create all the extra "fake" variants on each product. What if there's a requirement for more than just the vase, or different styles of vase?

The simplest solution is to add a prompt in the description that directs customers to the upsell product(s), but this is not as convenient as being able to add the product without leaving the page.

There are apps that offer this functionality, but they're not always the most elegant which is an issue for design-led sites.

I recently tackled this issue for a client and my initial solution accepted a Shopify Collection and used vanilla javascript to display the products with +/- buttons to set the quantity added to the cart. This first solution worked great, but there was some complexity in tracking the state of each product's quantity and having to continually filter DOM elements to match a reference.

Here's a simplified example of the type of code I was using just to add a product to the cart:

```html
<div class="custom-upsell-products">
  <div class="custom-upsell-products-item">
    <button data-decrease data-id="123">-</button>
    <input data-quantity data-id="123" value="0">
    <button data-increase data-id="123">+</button>
  </div>
  <!-- more products -->
</div>
```

```js
const increaseButtons = document.querySelectorAll('.custom-upsell-products button[data-increase]');
const quantityInputs = document.querySelectorAll('.custom-upsell-products input[data-quantity]');

function enableLoading(el) {
  el.closest('.custom-upsell-products-item').classList.add('loading');
}

function disableLoading(el) {
  const quantity = Array.from(quantityInputs)
    .find(quantityInput => quantityInput.dataset.id == el.dataset.id)?.value || 0;
  handleChange(el.dataset.id, quantity);
  el.closest('.custom-upsell-products-item').classList.remove('loading');
}

function handleChange(id, quantity) {
  //  set button state, etc
}

function increaseCart(id) {
  // get current quantity
  // send post request to cart
}

increaseButtons.forEach(increaseButton => increaseButton.addEventListener('click', () => {
 enableLoading(increaseButton);
 increaseCart(increaseButton.dataset.id)
   .then(qty => {
     Array.from(quantityInputs)
       .filter(quantityInput => quantityInput.dataset.id === increaseButton.dataset.id)
       .forEach(quantityInput => quantityInput.value = qty);
    })
    .catch(err => console.error(err))
    .finally(() => disableLoading(increaseButton));
  })
);
```

You don't have to particularly understand in detail what's going on in the example above, but you'll notice that there's a lot of occasions where the code needs to iterate over the DOM elements to get a reference to the relevant product. It's possible that it could be done with a different DOM traversal strategy, or maybe there's a better way to store references (quite possible!) that I'm not aware of. In this instance, the code needed to account for an unknown number of upsell products, so it has to rely on a lot of assumptions about how the code is set up too. There's a trade off between storing the `id` on a parent element (more complex traversing) or adding a reference to the `id` on all the interactive elements. It's much harder for me to feel confident about where the boundaries should be.

I often have to write code like this for Shopify themes, and I know it's a smell when I have to start querying elements for their state, passing around references (elements, ids) and trying to make unique enough selectors to avoid leaking styles, etc. Traditionally, I would just suck it up and hope that I can still understand it if I ever have to come back to it to make changes.

## Enter Custom HTML Elements

More often I'm encountering widgets that are implemented using [Custom HTML Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (sometimes referred to as Web Components) that encapsulate some code into a defined HTML element, usually with some bespoke interactivity. This sounded like it might be a solution for my upsell widget... (Spoiler: it was!)

Here's the same functionality implemented with a Custom HTML Element.

```html
<custom-upsell-product data-id="123">
  <button data-decrease>-</button>
  <input data-quantity value="0">
  <button data-increase>+</button>
</custom-upsell-product>
<!-- more products -->
```

```js
class CustomUpsellProduct extends HTMLElement {
  constructor() {
    super();

    this.id = this.getAttribute('data-id');
    this.quantityInput = this.querySelector('input[data-quantity]');
    this.increaseButton = this.querySelector('button[data-increase]');

    this.increaseButton.addEventListener('click', () => this.quantity++);
  }

  get quantity() {
    return this.quantityInput.value;
  }

  set quantity(value) {
    this.enableLoading();
    this.updateCart(value)
    .then(qty => this.quantityInput.value = qty)
    .catch(err => console.error(err))
    .finally(() => this.disableLoading());
  }
  
  handleChange() {
    // set button state, etc
  }

  updateCart(quantity) {
    // send post request to cart
  }

  enableLoading() {
    this.classList.add('loading');
  }

  disableLoading() {
    this.handleChange();
    this.classList.remove('loading');
  }
}

customElements.define('custom-upsell-product', CustomUpsellProduct);
```

There is so much complexity from the implementation that has now been removed. Each product has its own internal state eliminating the need to filter through elements, pass around ids, or traverse the DOM. In this case I've used accessors (`get`/`set`) to simplify the code further, and easily been able to use a more generic `updateCart` method but these are really just implementation details (although they were certainly easier to reach for in this version).

Just the fact that the line lengths are shorter, and a huge amount of visual noise has been removed form both the Javascript and the HTML makes it much easier to reason about. I'm confident that returning to this code 12 months from now to add a feature would be much less onerous than the original implementation too.

I'm pretty pleased to discover how well Custom HTML Elements solve common problems with adding features to Shopify themes, and I'm looking forward to being able to use them more in future and even refactor older code towards a simpler – and ultimately more portable – implementation.

Check out [my starter gist of a full implementation](https://gist.github.com/mikenewbuild/797eeb136b762ebc4a935d87bcfedf31) that can be modified and integrated into any Shopify theme.