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

export const collections = { posts, about };
