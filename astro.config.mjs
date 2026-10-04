import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkBreaks from 'remark-breaks';
import rehypeLegacyMarkup from './src/plugins/rehype-legacy-markup.mjs';

export default defineConfig({
  site: 'https://mikefallows.com',
  trailingSlash: 'ignore',
  markdown: {
    // Sätteri, the default processor, has no hard line break option.
    processor: unified({
      remarkPlugins: [remarkBreaks],
      rehypePlugins: [rehypeLegacyMarkup],
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
