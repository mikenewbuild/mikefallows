---
draft: true
title: Avoiding a DOMContentLoaded gotcha with readyState
description: >-
  I recently hit a race condition when a script was loading faster in some
  browsers.
date: 2023-10-23T12:00:00.000Z
tags:
  - javascript
layout: post
---

I hit one of those strange issues where a script failed _sometimes_ and only in Safari.

It was on a Shopify theme - in this case I was modifying some of the HTML in the header of a site via JavaScript, but didn't realise that in some cases the theme's JavaScript was also modifying some of the same parts of the DOM. I had also moved the code from being inline to an asychronously loaded script, and had dutifully wrapped it in a `DOMContentLoaded` event listener, patted myself on the back and got on with the day.

That was until, the inevitable _it's not working_ email landed. It turned out that Safari, and possibly only certain versions of Safari, would call the `DOMContentLoaded` event in an unreliable way (compared to other browsers) and was therefore executing my script unpredictably. The end result was that the modifications I wanted to make to the DOM weren't taking place, and I think it was down to the `DOMContentLoaded` event being triggered before all scripts were loaded. A little hunting on [Stack Overflow](https://stackoverflow.com/a/39993724) and I managed to find this trick (which I'm recording here as a _note to self_).

```js
function init() {
  // code to run on load...
}

if (document.readyState === 'loading') {
  // document still loading...
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
} else {
  // already loaded, chocs away!
  init();
}
```

It essentially checks to see if the browser reports that it's still loading via `document.readyState` ([docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState)) and if so, registers the `DOMContentLoaded` event listener. If not, then it can safely be assumed that the event has already been fired, in which case, we run the code immediately. For convenience you can wrap all the code you wanted to run in a function (in this example, `init`).

I'm not sure if this only relates to Safari (although it seems to be more commonly reported that way) and/or I've just been lucky enough that I've not run into it before, but it's handy to have in the toolbox to keep things more robust.
