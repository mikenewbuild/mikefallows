---
draft: false
date: 2022-07-16
layout: layouts/post.njk
title: Handling Dark Mode in HTML Emails
description: Simple method to quickly handle switching colours and image in emails.
tags:
- pug
- css
- email

---
Recently I needed to customise a HTML email template written in [Pug](https://pugjs.org/). This was my first time using Pug and I was pleasantly surprised to find it intuitive and with a few useful features to help organise some reusable components. Its terse syntax is also handy for email templates, as supporting current email clients (even in 2022!) means than you still need to work with deeply nested tables to achieve even the simplest of layouts.

Although CSS support in email is improving, there are a range of mail clients that are hard to test, so resources like [Can I email...](https://www.caniemail.com/) are invaluable in helping identify which features are widely supported. For example, my first though was to use SVG and defining the colours in CSS. Unfortunately, the support at this point is still lacking, so it does require creating multiple versions of images that you need inverting for your design.

I've noticed that some email clients (particularly on mobile), will do their best to apply a dark theme to emails, and sometimes the results can be less than satisfactory. In this case, the company's branding was monochrome, so it afforded me an opportunity to easily adopt a dark mode alternative as the colour scheme was so simple.

## Declaring dark mode support

The first thing to do is indicate that the email supports both light and dark mode. You can declare this in a `<style>` tag in the head of a document.


```css
:root {
  color-scheme: light dark;
  supported-color-schemes: light dark;
}
```

It's then possible to use a media query to detect the mode that the email is being displayed in.

```css
@media (prefers-color-scheme: dark) {
  /* styles for dark mode... */
}
```

## Providing alternative colours

As a fallback for clients that may not support alternative colour schemes I set my light styles first, and then used the media query to override those styles for dark mode. Pug allows you to store values in a [variable](https://pugjs.org/language/interpolation.html) that can be interpolated into strings. Normally on the web I would use CSS Variables (Custom Properties) but support for that is still patchy for emails.

I created a set of variables for my "default" colours, and then a matching set of alternative "inverted" colours. This helped keep everything symmetrical and made it easier not to miss any elements that I needed to account for in dark mode.

Here's a basic example declaring some default colours for the element with a class of `.document` that I used for the root of my email, and then declaring the inverted colours for dark mode.

```css
.document {
  background-color: #{defaultBgColor};
  color: #{defaultTextColor};
}

@media (prefers-color-scheme: dark) {
  .document {
    background-color: #{invertedBgColor} !important;
    color: #{invertedTextColor} !important;
  }
}
```

## Handling alternate images

There are only some images that really needed to be switched for dark mode, and these were graphic elements that essentially match the text and background colours of the design.

The strategy I used to handle these was to wrap the light and dark versions of images in a `span` element with a class to identify which mode the image was supposed to appear in. I used the wrapping `span` to declare some width and height values which had the added bonus of keeping these graphic images sharp on high density screens.

Using a Pug [mixin](https://pugjs.org/language/mixins.html) you can create a function to return the HTML with both images - note the `span`with a class of `.light-mode-images` wraps `logo.png` and `.dark-mode-images` wraps `logo-inverted.png`.


```js
mixin logo()

  span.light-mode-image(style='width:180px;height:64px;')
    img(src='#{assetUrl}/logo.png' alt='Acme' width='360' height='128')
  span.dark-mode-image(style='width:180px;height:64px;')
    img(src='#{assetUrl}/logo-inverted.png' alt='Acme' width='360' height='128')
```

Now we can use some generic CSS rules to handle the correct display of images by toggling between `display: block` and `display: none`.

```css
span.light-mode-image {
  display: block;
}

span.dark-mode-image {
  display: none;
}

@media (prefers-color-scheme: dark) {
  span.light-mode-image {
    display: none !important;
  }

  span.dark-mode-image {
    display: block !important;
  }
}
```

## Other considerations

For this relatively simple template, I only had to generate one othe `mixin` function for a graphic element (an arrow) and handle some link colours. In this case the template was defaulting to system fonts. If it was using a custom font then it might be worth adjusting weights as light-on-dark text can often appear heavier than dark-on-light.

Because the design was essentially black and white, it was easy to decide which colours needed swapping and what the alternative would be. Once you start getting into lighter colours the decision about the alternatives becomes a bit harder to decide, so testing and image generation can increase the workload, and accessibility concerns may require more attention.

In the end I was pleased I managed to get an effective result with a relatively low number of lines of code. Better still, I got an appreciation of how much potential work would be involved in a more complicated design!
