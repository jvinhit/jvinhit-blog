import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

/**
 * Search index endpoint
 *
 * - Pre-render ở build time → static `/search.json` cho SSG.
 * - Trả về plain JSON với title/description/tags/body đã được strip
 *   MDX noise → client matcher chạy substring/token trên text "sạch".
 * - Lazy load: client chỉ fetch khi user mở search lần đầu, không
 *   bloat initial page bundle.
 */
export async function GET(_context: APIContext) {
  const posts = await getCollection('posts', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );

  const sorted = posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const items = sorted.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
    body: stripMdxForSearch(post.body ?? ''),
  }));

  return new Response(JSON.stringify({ items, total: items.length }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Index regenerate mỗi build → cho phép cache mạnh nhưng vẫn
      // revalidate (ETag/Last-Modified do host xử lý). 1h là sweet spot
      // giữa tránh re-fetch và pick up update sớm sau khi publish bài mới.
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}

/**
 * Lọc bỏ MDX/Markdown syntax noise để substring search hoạt động trên
 * text thuần. Giữ lại nội dung code block và link text vì user có thể
 * search keyword code hoặc URL fragment.
 */
function stripMdxForSearch(src: string): string {
  return (
    src
      // ESM import/export ở đầu MDX — không có giá trị search.
      .replace(/^\s*(import|export)\s.+$/gm, '')
      // JSX tags (Astro/MDX components) — bỏ tag, giữ inner text qua
      // pass tiếp theo (regex này chỉ kill tag opening/closing).
      .replace(/<\/?[A-Z][^>]*\/?>/g, ' ')
      // HTML/MDX self-closing tags lowercase (br, hr, img inline)
      .replace(/<\/?(br|hr|img|input)[^>]*\/?>/gi, ' ')
      // Markdown link [text](url) → giữ cả text và url cho search.
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2')
      // Image ![alt](src) → giữ alt.
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Heading hash markers
      .replace(/^#+\s+/gm, '')
      // Blockquote markers
      .replace(/^>\s?/gm, '')
      // Bold/italic/inline-code markers (1-3 ký tự `*` `_` `` ` ``)
      .replace(/[*_`]{1,3}/g, '')
      // Horizontal rule
      .replace(/^-{3,}$/gm, '')
      // Whitespace collapse
      .replace(/\s+/g, ' ')
      .trim()
  );
}
