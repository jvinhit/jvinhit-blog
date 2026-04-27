import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Collection cho blog posts.
 * Dùng glob loader (Astro 5) thay cho legacy `src/content/posts` convention
 * để có thể co giãn vị trí content sau này (ví dụ tách sang content repo).
 */
const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(240),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      /** Ẩn bài khỏi production build */
      draft: z.boolean().default(false),
      /** Ảnh cover (optional) — dùng image() để Astro optimize */
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

/**
 * Collection cho CV/About — ta coi About page như một bài "document",
 * nội dung viết bằng MDX để reuse cùng syntax highlight & components.
 */
const about = defineCollection({
  loader: glob({
    pattern: 'about.{md,mdx}',
    base: './src/content/about',
  }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    intent: z.string(),
    skills: z
      .array(
        z.object({
          name: z.string(),
          /** 0-100 */
          level: z.number().int().min(0).max(100),
        })
      )
      .default([]),
    experience: z
      .array(
        z.object({
          title: z.string(),
          company: z.string(),
          period: z.string(),
          bullets: z.array(z.string()),
        })
      )
      .default([]),
    education: z
      .array(
        z.object({
          degree: z.string(),
          school: z.string(),
          period: z.string(),
          description: z.string().optional(),
        })
      )
      .default([]),
    connections: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          href: z.string().optional(),
        })
      )
      .default([]),
  }),
});

/**
 * Collection cho projects/portfolio.
 * Frontmatter-only ở v1 — body MDX optional, có thể tận dụng sau cho
 * "case study" pages chi tiết. Glob loader cho phép organize tự do
 * (theo năm, theo type) khi danh sách dài.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(280),
      /** Trạng thái — drive visual style (badge color, animation) */
      status: z.enum(['shipped', 'in-progress', 'experiment', 'archived']),
      /** Vai trò trong project — e.g. "Tech Lead", "Solo", "Frontend Lead" */
      role: z.string(),
      /** Khoảng thời gian display — e.g. "2024", "2023-2024", "Aug 2024" */
      period: z.string(),
      /** Stack/tech chips (tối đa ~6 để giữ card gọn) */
      stack: z.array(z.string()).default([]),
      /**
       * Links ra ngoài. Tất cả optional vì:
       * - Project nội bộ (NDA) có thể không có demo public
       * - Experiment có thể chỉ có repo
       */
      links: z
        .object({
          site: z.string().url().optional(),
          repo: z.string().url().optional(),
          demo: z.string().url().optional(),
        })
        .default({}),
      /** Đề lên top, render với card lớn hơn */
      featured: z.boolean().default(false),
      /** Sort key — endDate desc làm primary, fallback `order` cho manual override */
      endDate: z.coerce.date(),
      /** Manual sort override (lower = earlier). Để trống nếu dùng endDate */
      order: z.number().int().optional(),
      /** Cover image — chưa dùng ở v1, reserve cho detail page tương lai */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Ẩn project khỏi production build (dùng để draft) */
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, about, projects };
