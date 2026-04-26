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
  url: 'https://jvinhit.dev',
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
