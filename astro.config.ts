import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';

import { readingTimeRemarkPlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The Almanac — Astro + Tailwind CSS v4 (CSS-first, via the Vite plugin).
// There is NO @astrojs/tailwind integration in v4; `@import "tailwindcss"`
// lives in src/styles/globals.css, imported once from the base layout.
export default defineConfig({
  site: 'https://evanharmon.com',
  output: 'static',

  integrations: [sitemap(), mdx(), react()],

  // Astro 7 defaults to `satteri()`; the remark/unified pipeline is now opt-in
  // via `markdown.processor`. The old `markdown.remarkPlugins` shorthand still
  // works in 7.x but is deprecated and slated for removal in a future major, so
  // it is spelled out here. readingTimeRemarkPlugin populates the `min read`
  // metadata blog posts render — verified present in the build output both
  // before and after this migration.
  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
