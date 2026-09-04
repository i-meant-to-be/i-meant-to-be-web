import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SITE_LANGUAGE, SITE_NAME, SITE_URL } from '../site';
import routes from '../routes/route';
import seo from '../routes/seo';
import type { PostWithId } from './index';

const STATIC_PATHS = [routes.ROOT, routes.POST, routes.MUSIC];
const RSS_MAX_BYTES = 10 * 1024 * 1024;

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

function lastModified(post: PostWithId): string {
  return post.meta.updated ?? post.meta.date;
}

function latestModified(posts: PostWithId[]): string | undefined {
  return posts.reduce<string | undefined>((latest, post) => {
    const modified = lastModified(post);
    return !latest || modified > latest ? modified : latest;
  }, undefined);
}

function absoluteContentUrl(url: string): string {
  const absolute =
    url.startsWith('/') && !url.startsWith('//') ? `${SITE_URL}${url}` : url;
  return defaultUrlTransform(absolute);
}

const rssComponents: Components = {
  a: ({ href, children }) => createElement('a', { href }, children),
  img: ({ src, alt }) =>
    createElement('img', {
      src: typeof src === 'string' ? src : undefined,
      alt: alt ?? '',
      loading: 'lazy',
    }),
};

/** Markdown 원문을 스타일·스크립트 없는 RSS용 HTML로 변환한다. */
export function renderRssContent(content: string): string {
  return renderToStaticMarkup(
    createElement(ReactMarkdown, {
      remarkPlugins: [remarkGfm],
      components: rssComponents,
      urlTransform: absoluteContentUrl,
      children: content,
    }),
  );
}

export function toCdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/** 네이버 RSS 제출 제한을 넘으면 배포 전에 빌드를 실패시킨다. */
export function assertRssSize(xml: string, maxBytes = RSS_MAX_BYTES): void {
  const bytes = new TextEncoder().encode(xml).byteLength;
  if (bytes > maxBytes) {
    throw new Error(
      `RSS exceeds the ${maxBytes}-byte size limit (${bytes} bytes).`,
    );
  }
}

/** `YYYY-MM-DD` → RFC 822 (RSS `pubDate` 형식). */
export function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function buildSitemapXml(posts: PostWithId[]): string {
  const latest = latestModified(posts);

  const staticEntries = STATIC_PATHS.filter((path) => !seo[path]?.noindex).map(
    (path) => ({
      path,
      lastmod: path === routes.POST ? latest : undefined,
    }),
  );

  const postEntries = posts.map((post) => ({
    path: postPath(post),
    lastmod: lastModified(post),
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
      const content = toCdata(renderRssContent(post.content));
      return [
        '    <item>',
        `      <title>${escapeXml(post.meta.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${toRfc822(post.meta.date)}</pubDate>`,
        `      <description>${content}</description>`,
        `      <content:encoded>${content}</content:encoded>`,
        ...categories,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const description = seo[routes.ROOT].description;
  const lastBuildDate = latestModified(posts);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(description)}</description>
    <language>${SITE_LANGUAGE}</language>
${lastBuildDate ? `    <lastBuildDate>${toRfc822(lastBuildDate)}</lastBuildDate>\n` : ''}    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  assertRssSize(xml);
  return xml;
}
