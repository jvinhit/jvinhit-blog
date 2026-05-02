// @ts-check
import { defineConfig } from 'astro/config';
import { copyFile } from 'node:fs/promises';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE } from './src/lib/site-config';

/**
 * Plugin `@astrojs/sitemap` mặc định ghi 2 file:
 *   - `sitemap-index.xml`  — index trỏ tới các sitemap con
 *   - `sitemap-0.xml`      — flat list URL thật
 *
 * Nhiều tool / crawler (Bing Webmaster, một số SEO scanner) dò mặc định
 * filename `sitemap.xml` — ta tạo thêm 1 alias là **bản copy của
 * `sitemap-0.xml`** (flat list), KHÔNG phải của `sitemap-index.xml`.
 * Lý do: file flat đọc được trực tiếp không cần fetch tiếp, tiện cho
 * tool / agent đọc 1-shot. Index file giữ nguyên cho site lớn vượt
 * 50K URL sau này (plugin sẽ tự shard `sitemap-1.xml`, `sitemap-2.xml`).
 *
 * @returns {import('astro').AstroIntegration}
 */
function copySitemapAlias() {
  return {
    name: 'copy-sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const src = new URL('sitemap-0.xml', dir);
        const dst = new URL('sitemap.xml', dir);
        try {
          await copyFile(src, dst);
          logger.info('copied sitemap-0.xml → sitemap.xml');
        } catch (err) {
          logger.warn(
            `skip copy sitemap.xml: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      },
    },
  };
}

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
  // `'always'` → Astro generate URL với trailing slash trong sitemap, link,
  // và canonical. Cần thiết để:
  //   1. Sitemap URL prefix khớp với GH Pages serve path (GH Pages 301 redirect
  //      path không slash → có slash cho directory routes).
  //   2. Khớp với property URL prefix trên Google Search Console
  //      (`https://jvinhit.github.io/jvinhit-blog/` có trailing slash).
  // Nếu giữ `'never'`, homepage URL trong sitemap thành
  // `https://jvinhit.github.io/jvinhit-blog` (không slash) → bị 301 → Google
  // báo "Sitemap could not be read".
  trailingSlash: 'always',

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/drafts/'),
    }),
    // Phải đặt SAU `sitemap()` để hook `astro:build:done` chạy sau khi
    // file `sitemap-index.xml` đã tồn tại trong `dist/`.
    copySitemapAlias(),
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
