/**
 * Global site configuration.
 * Sửa ở đây để đổi branding mà không phải tìm xuyên codebase.
 */
export const SITE = {
  /** Tên hiển thị ở header & OG tags */
  name: 'jvinhit',
  /** Handle dạng `owner/repo` — hiển thị trong header kiểu breadcrumb */
  handle: 'jvinhit//lab',
  /** URL production (đổi khi deploy lên domain thật) */
  url: 'https://jvinhit.github.io/jvinhit-blog',
  /** Mô tả mặc định cho meta + OG */
  description:
    'A frontend engineer and systems architect. This is my digital lab where I document my thoughts on modern web development, performance metrics, and architectural patterns.',
  /** Ngôn ngữ mặc định */
  lang: 'en',
  /** Locale cho OG tag */
  locale: 'en_US',
  /** Tác giả */
  author: {
    name: 'jvinhit',
    title: 'Senior Frontend Engineer',
    email: 'hello@jvinhit.dev',
  },
  /**
   * Search engine verification tokens.
   * Mỗi field render thành 1 `<meta name="..." content="...">` trong <head>.
   * Bỏ trống / xoá field nếu chưa verify với search engine tương ứng.
   */
  verification: {
    google: 'HK-rhhzRnsZFvbYVG-QDIvBa55wpN6L468CT46-zsjs',
  },
  /** Social links hiển thị ở footer */
  socials: [
    { label: 'GitHub', href: 'https://github.com/jvinhit', rel: 'me' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/jvinhit', rel: 'me' },
    { label: 'X', href: 'https://x.com/jvinhit', rel: 'me' },
  ],
  /** Menu điều hướng chính — sync với design */
  nav: [
    { label: 'JOURNAL', href: '/' },
    { label: 'RESUME', href: '/about' },
    { label: 'ARCHIVE', href: '/blog' },
    { label: 'PROJECTS', href: '/projects' },
  ],
} as const;

export type SiteConfig = typeof SITE;

/**
 * Prepend Astro's configured `base` path to an internal URL.
 *
 * Dùng CHO MỌI internal link (href, src, redirect) để site portable giữa
 * các deploy target khác nhau:
 * - Local dev / Cloudflare Pages / custom domain  → base = `/`  → return path as-is
 * - GitHub Pages project site (jvinhit.github.io/jvinhit-blog) → base = `/jvinhit-blog/`
 *   → tự prepend prefix vào mọi link
 *
 * External URLs (http/https/mailto/tel) được return nguyên vẹn.
 */
export function withBase(path: string): string {
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
