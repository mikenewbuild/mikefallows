---
draft: false
date: 2022-10-24
layout: layouts/post.njk
title: 'Hello World with Lit'
description: 'Tinkering with Lit: a web components framework.'
tags:
- web components

---
The world of Web Components seems to be getting more attention recently so I've been exploring some of the frameworks emerging around it. Here are some notes on my initial experience with [Lit](https://lit.dev/) (specifically version 2).

## Aims

Build a small web component that can:
- render some HTML
- accept some data as a property
- have a button that can mutate that data
- style the component
- expose some styling

That's pretty much 90% of what I've been doing with Web Components.

## Getting set up

The first thing I did was head over to the docs. They provide some [interactive tutorials](https://lit.dev/tutorials/) in a REPL which look great but for whatever reason, was behaving slowly when I visited. I also wasn't sure if Lit required a build step so I decided I'd rather try to get something running locally (like the boomer I am).

This turned out to be the most confusing part for me because my preferred way of learning involves watching a screencast and hopefully copy-pasting or re-typing some code into my editor and viewing the results. The Lit [introductory screencast](https://www.youtube.com/watch?v=QBa1_QQnRcs&t=302s) I found on YouTube used TypeScript and I'm not all aboard the TypeScript train yet. I wanted a more apples-to-apples approach to the way I currently write my Web Components so I realised I was going to have to bumble through on my own a bit.

This is not to criticise Lit, I think it's marketing itself as an alternative to developers coming from the React ecosystem and that seems perfectly reasonable. I'm personally coming from a "sprinkles"[^1] background so there are some gaps I have to acknowledge.

## Rendering a component

After some back and forth trying to make things much more complicated than I needed to, I ended up with a minimal HTML page that registered a Lit component:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lit Test</title>
  <script type="module">
    import { html, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js'

    class HelloWorld extends LitElement {
      render() {
        return html`<p>Hello world</p>`;
      }
    }

    customElements.define('hello-world', HelloWorld)
  </script>
</head>
<body>
  <hello-world></hello-world>
</body>
</html>
```

Great, I have a page that renders a `<p>Hello world</p>` in the shadow DOM of the `<hello-world>` element. By the way, that [Lit Core library](https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/core/) comes in at just over 16kb at the time of writing – time to find out what affordances that payload gets me!

Of note here is that the `render` function and the `html` helper are taking care of a few things under the hood and allowing for the use of [tagged template literals](https://www.digitalocean.com/community/tutorials/js-tagged-template-literals). For comparison, here's the boilerplate you would need to write the same functionality without Lit.

```js
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    let p = document.createElement('p');
    p.innerText = 'Hello world';
    this.shadowRoot.append(p);
  }
}
```

## Passing properties

I found the Lit docs a bit confusing here, mainly because the script examples only included the JS portion without the HTML element and attribute I was looking for. It also opens with examples using decorators which require a build step (they are still only a proposal). I'm unfamiliar with the syntax and I wasn't sure whether this was a Lit requirement or something to do with TypeScript but it turns out you can achieve the same thing by defining a `static properties` object.

```js
class HelloWorld extends LitElement {
  static properties = {
    name: { type: String }
  }
  render() {
    return html`<p>Hello ${this.name || 'world'}</p>`;
  }
}
```

Allows you to do:

```html
<!-- output: Hello world -->
<hello-world></hello-world>
<!-- output: Hello you -->
<hello-world name="you"></hello-world>
```

## Mutating the data

That's all good, but how about adding some behaviour to the component? This is where Lit's use of tagged template literals helps to make things so much easier. Using `@click` allows you to create an event listener and remove the need for a whole host of boilerplate to register elements, insert them into the DOM, attach events to them, as well as managing the component's state. I made a simple button to add exclamation marks to the `name` property with a couple of lines of code.

```js
class HelloWorld extends LitElement {
  static properties = {
    name: { type: String }
  }
  constructor() {
    super();
    this.name = "world";
  }
  makeLouder() {
    this.name = this.name + '!'
  }
  render() {
    return html`
    <p>Hello ${this.name}</p>
    <button @click=${this.makeLouder}>Louder</button>
    `;
  }
}
```

## Styling

Because Lit uses the Shadow DOM, it isolates your styling from the rest of the document by default. Making it easy to style your component without worrying about parent styles leaking in, or clashing with other styles. Lit offers a handy `css` function to help manage these styles. This may initially break some syntax highlighting in your editor, but there's a selection of VS Code extensions that add syntax support for Lit.

You can apply styling to the root component element using the `:host` selector. You can even set styles conditionally based on the state of the element. You can interpolate variables into the `css` function eg. the `fontFamily` variable set outside the component, and you can expose certain values by declaring CSS variables.

```js
import { css, html, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js'

const fontFamily = css`sans-serif`;

class HelloWorld extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: var(--background, #eee);
    }
    :host(.blue) {
      background: aliceblue;
    }
    p {
      font-family: ${fontFamily};
    }
  `;
  render() {
    return html`<p>Hello world</p>`;
  }
}
```

```html
<!-- Background #eee -->
<hello-world></hello-world>
<!-- Background aliceblue -->
<hello-world class="blue"></hello-world>
<!-- Background goldenrod -->
<style>
hello-world {
  --background: goldenrod;
}
</style>
<hello-world></hello-world>
```

## Thoughts

So far my use case for Web Components often means creating one-off, quite simple components that need to be portable (ie. dropped into Shopify themes), where it doesn't necessarily make sense to add Lit as a dependency. However, for future projects that might need to make use of multiple Web Components, the small penalty of including Lit will surely be worth it for the reduced boilerplate, and I believe, easier to read code.

[^1]: The JavaScript "sprinkles" approach is a largely undefined term that tends to refer to a backend-driven site or app that includes a small amount of JavaScript added to the front end for client-side activity (as opposed to a fully-fledged SPA). It usually implies using small bits of custom JS, or micro-frameworks like Stimulus, jQuery or Alpine.
