const { DateTime } = require('luxon');
const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItFootnote = require('markdown-it-footnote');
const { execSync } = require('child_process')

module.exports = function (eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'cccc, d LLLL yyyy'
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter('min', (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  const now = new Date();

  const isPublished = (item) => item.date <= now && !item.data.draft;

  function published(items) {
    // Hide unpublished items in production
    if (process.env.ELEVENTY_ENV === 'production') {
      return items.filter(isPublished);
    }
    return items;
  }

  eleventyConfig.addFilter('published', published);

  // Create an array of all posts
  eleventyConfig.addCollection('posts', (collection) => {
    const posts = collection.getFilteredByGlob('posts/**/*.md');
    return published(posts);
  });

  // Create an array of popular posts
  eleventyConfig.addCollection('popularPosts', (collection) => {
    const posts = collection.getFilteredByGlob([
      'posts/using-postcss-and-autoprefixer-with-esbuild.md',
      'posts/making-a-shopify-theme-app-extension-for-google-site-verification.md',
      'posts/shopify-theme-development-with-esbuild.md',
      'posts/responsive-images-in-shopify-themes.md',
    ]);
    return published(posts);
  });

  function filterTagList(tags) {
    return (tags || []).filter(
      (tag) => ['all', 'nav', 'post', 'posts'].indexOf(tag) === -1
    );
  }

  eleventyConfig.addFilter('filterTagList', filterTagList);

  // Create an array of all tags
  eleventyConfig.addCollection('tagList', function (collection) {
    let tagSet = new Set();
    collection.getAll()
      .filter(isPublished)
      .forEach((item) => {
        (item.data.tags || []).forEach((tag) => tagSet.add(tag));
      });

    return filterTagList([...tagSet]);
  });

  // Put robots.txt in root
  eleventyConfig.addPassthroughCopy('robots.txt');

  // Copy the `img` folder to the output
  eleventyConfig.addPassthroughCopy('img');

  // Copy the root css file to the output
  eleventyConfig.addPassthroughCopy('css/index.css');
  eleventyConfig.addPassthroughCopy({
    './node_modules/prismjs/themes/prism-tomorrow.css': './css/prism.css',
  });

  // Handle Tailwind files
  eleventyConfig.addWatchTarget('./tailwind.config.js');
  eleventyConfig.addWatchTarget('./css/tailwind.css');
  eleventyConfig.addPassthroughCopy({
    './_tmp/css/styles.css': './css/styles.css',
  });
  eleventyConfig.addPassthroughCopy('./css/**/*.woff2');
  eleventyConfig.addWatchTarget('./js/');

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        class: 'direct-link',
        symbol: '#'
      })
    })
    .use(markdownItFootnote);

  // Customise footnotes
  markdownLibrary.renderer.rules.footnote_ref = (
    tokens,
    idx,
    options,
    env,
    slf
  ) => {
    const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    let refid = id;

    if (tokens[idx].meta.subId > 0) {
      refid += ':' + tokens[idx].meta.subId;
    }

    return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${refid}">${id}</a></sup>`;
  };

  eleventyConfig.setLibrary('md', markdownLibrary);

  // Build index for pagefind search
  eleventyConfig.on('eleventy.after', () => {
    // execSync(`pagefind --source _site`, { encoding: 'utf-8' })
  })

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    // Control which files Eleventy will process
    templateFormats: ['md', 'njk', 'html', 'liquid'],

    // Optional (default is shown)
    pathPrefix: '/',

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: 'njk',

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: 'njk',

    // Opt-out of pre-processing global data JSON files: (default: `liquid`)
    dataTemplateEngine: false,

    // These are all optional (defaults are shown):
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
