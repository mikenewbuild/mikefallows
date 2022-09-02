---
draft: false
date: 2022-08-11
layout: layouts/post.njk
title: 'Compiling `.kit` files with Grunt'
description: How to generate HTML from `.kit` files without access to CodeKit.
tags:
- email

---
This week I needed to hand over some files to another development team. I was originally commissioned to create some email templates way back in early 2013 for [Campaign Monitor](https://www.campaignmonitor.com/) and, apart from some small tweaks and additions, the templates have hardly changed since. You can view an [archived version of one of the earliest](http://oipolloi.createsend1.com/t/ViewEmail/r/03E42A0A780B70022540EF23F30FEDED/54DE0C796051573CF351F20C80B74D5E?alternativeLink=False). But [this is a better one](http://oipolloi.cmail1.com/t/ViewEmail/r/411C187586824B302540EF23F30FEDED/C378788E19EDA1B76707B176AE29F890?alternativeLink=False). Design credit to my good friend [Eóin MacManus](https://www.eoinmac.com/).

The templates made some heavy use of [`<repeater>` regions](https://www.campaignmonitor.com/create/editable-content/#repeater), a feature of Campaign Monitor's templates that I utilised to allow multiple sections with different colour backgrounds. Because this was email, it required a lot of inline CSS and a lot of code repetition to achieve the desired result. I was using CodeKit a lot at the time and the app had just introduced the [`.kit` file feature](https://codekitapp.com/help/kit/). Kit files added variables and imports to HTML via CSS-style comments which reduced the amount of code I needed to write substantially.

This worked great for the best part of a decade as the sole developer on the project: I could easily make a small adjustment and compile the files quickly with my copy of CodeKit.

Now that I needed to pass the files on to another team, I wanted to do so without the requirement of a proprietary app to compile the templates. A quick search and I discovered there was an open source [node-based compiler](https://github.com/jeremyworboys/node-kit) for `.kit` files and a [Grunt plugin](https://github.com/fatso83/grunt-codekit) that leveraged it. I was aware of [Grunt](https://gruntjs.com/) as an alternative task runner to something like CodeKit and it had a reputation for having a straightforward build pipeline so it seemed like a good solution.

First I installed Grunt and the CodeKit plugin:

```bash
npm i -D grunt grunt-codekit
```

Then I set up a simple `Gruntfile.js` config file that would compile my newsletter template to HTML:

```js
module.exports = function(grunt) {

  grunt.initConfig({
    codekit: {
      'build/newsletter/newsletter.html': 'src/newsletter/newsletter.kit'
    },
  });

  grunt.loadNpmTasks('grunt-codekit');

  grunt.registerTask('default', ['codekit']);
};
```

Now all I needed to do was run `grunt` at the root of the project and my `src/newsletter/newsletter.kit` file would be converted to HTML at `build/newsletter/newsletter.html`. Easy as that!

When you add a new template to Campaign Monitor you need to upload the HTML template and also any images the template uses as a separate zip file. Now that I'd got this far I figured I could make that final step easier too. First I installed the `grunt-zip` plugin:

```bash
npm i -D grunt-zip
```

Then I added the `zip` task to my `Gruntfile` so that my images were zipped into my build folder ready to be uploaded.

```js
module.exports = function(grunt) {

  grunt.initConfig({
    codekit: {
      'build/newsletter/newsletter.html' : 'src/newsletter/newsletter.kit'
    },
    zip: {
      'build/newsletter/img.zip': 'src/newsletter/img/*'
    }
  });

  grunt.loadNpmTasks('grunt-codekit');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['codekit', 'zip']);

};
```

There are potentially a bunch more steps I could add like optimising the images and minifying the HTML but as Campaign Monitor already applies its own optimisations there's no need to overengineer this solution (as much as I'd love to).
