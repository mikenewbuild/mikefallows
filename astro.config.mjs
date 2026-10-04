import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import { transformerNotationDiff } from '@shikijs/transformers';
import tailwindcss from '@tailwindcss/vite';
import remarkBreaks from 'remark-breaks';
import rehypeLegacyMarkup from './src/plugins/rehype-legacy-markup.mjs';

const textPresentation = '\uFE0E';

export default defineConfig({
  site: 'https://mikefallows.com',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    // Sätteri, the default processor, has no hard line break option.
    processor: unified({
      remarkPlugins: [remarkBreaks],
      rehypePlugins: [rehypeLegacyMarkup],
      remarkRehype: { footnoteBackContent: `↩${textPresentation}` },
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
      // The HTML grammar leaves CSS inside an <svg> unhighlighted; Astro's does not.
      langAlias: { svg: 'astro' },
      transformers: [transformerNotationDiff()],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
