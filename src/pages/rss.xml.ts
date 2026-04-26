import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE, withBase } from '~/lib/site-config';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  return rss({
    title: SITE.name,
    description: SITE.description,
    // `@astrojs/rss` join `site` + `link` → cần prepend base vào `link`
    // để RSS URL hợp lệ khi deploy lên GH Pages project site.
    site: context.site?.toString() ?? SITE.url,
    items: posts
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: withBase(`/blog/${post.id}/`),
        categories: [...post.data.tags],
      })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
