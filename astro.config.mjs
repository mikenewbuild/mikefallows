import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkBreaks from 'remark-breaks';
import rehypeLegacyMarkup from './src/plugins/rehype-legacy-markup.mjs';

export default defineConfig({
  site: 'https://mikefallows.com',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    // Sätteri, the default processor, has no hard line break option.
    processor: unified({
      remarkPlugins: [remarkBreaks],
      rehypePlugins: [rehypeLegacyMarkup],
      // Text presentation selector, so the arrow is never drawn as an emoji.
      remarkRehype: { footnoteBackContent: '↩\uFE0E' },
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
      langAlias: { 'diff-svg': 'diff' },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
