import { SITE_LANGUAGE, SITE_NAME, SITE_URL } from '../site';
import routes from '../routes/route';
import seo from '../routes/seo';
import type { PostWithId } from './index';

const STATIC_PATHS = [routes.ROOT, routes.POST, routes.MUSIC];

function postPath(post: PostWithId): string {
  return `${routes.POST}/${post.id}`;
}

/** 프리렌더 대상 경로. noindex 라우트도 정적 HTML은 만든다. */
export function getPrerenderPaths(posts: PostWithId[]): string[] {
  return [...STATIC_PATHS, ...posts.map(postPath)];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** `YYYY-MM-DD` → RFC 822 (RSS `pubDate` 형식). */
export function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function buildSitemapXml(posts: PostWithId[]): string {
  const latest = posts[0]?.meta.date;

  const staticEntries = STATIC_PATHS.filter(
    (path) => !seo[path]?.noindex,
  ).map((path) => ({ path, lastmod: latest }));

  const postEntries = posts.map((post) => ({
    path: postPath(post),
    lastmod: post.meta.date,
  }));

  const body = [...staticEntries, ...postEntries]
    .map(({ path, lastmod }) => {
      const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
      const loc = escapeXml(`${SITE_URL}${path}`);
      return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function buildRssXml(posts: PostWithId[]): string {
  const items = posts
    .map((post) => {
      const url = escapeXml(`${SITE_URL}${postPath(post)}`);
      const categories = post.meta.tags.map(
        (tag) => `      <category>${escapeXml(tag)}</category>`,
      );
      return [
        '    <item>',
        `      <title>${escapeXml(post.meta.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${toRfc822(post.meta.date)}</pubDate>`,
        `      <description>${escapeXml(post.meta.description)}</description>`,
        ...categories,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const description = seo[routes.ROOT].description;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(description)}</description>
    <language>${SITE_LANGUAGE}</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
