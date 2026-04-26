// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE } from './src/lib/site-config';

/**
 * Deploy target được quyết bởi env var (set trong CI workflow):
 * - Không set       → local dev / Cloudflare Pages / custom domain (base `/`)
 * - SITE_URL/BASE   → GitHub Pages project site, cần base path
 *
 * Ví dụ `.github/workflows/deploy-gh-pages.yml`:
 *   env:
 *     SITE_URL: https://jvinhit.github.io
 *     BASE_PATH: /jvinhit-blog
 */
const SITE_URL = process.env.SITE_URL ?? SITE.url;
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'never',

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/drafts/'),
    }),
  ],

  vite: {
    // Astro bundles its own Vite; `@tailwindcss/vite` ships types
    // against top-level Vite → known TS mismatch ở strict mode (runtime OK).
    // Safe cast theo doc Astro 5 + Tailwind 4.
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  markdown: {
    shikiConfig: {
      // Custom theme khớp với accent lime + dark bg
      themes: {
        light: 'github-dark-default',
        dark: 'github-dark-default',
      },
      wrap: true,
    },
  },

  build: {
    format: 'directory',
  },

  image: {
    // Astro tối ưu ảnh ở build-time
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
