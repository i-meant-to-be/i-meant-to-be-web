import { describe, expect, it } from 'vitest';
import {
  assertRssSize,
  buildRssXml,
  buildSitemapXml,
  getPrerenderPaths,
  renderRssContent,
  toCdata,
  toRfc822,
} from './feed';
import type { PostWithId } from './index';

const posts: PostWithId[] = [
  {
    id: '0002-second',
    meta: {
      title: '두 번째 글 & 그 후',
      description: '설명 2',
      date: '2026-02-03',
      updated: '2026-04-05',
      tags: ['철학'],
    },
    content: `## 본문

| 열 | 값 |
| --- | --- |
| GFM | 지원 |

\`\`\`ts
const answer = 42;
\`\`\`

[내부 링크](/post/0001-first)

![게시물 이미지](/posts/0002-second/image.png)

<script>alert('실행 금지')</script>`,
  },
  {
    id: '0001-first',
    meta: {
      title: '첫 번째 글',
      description: '설명 1',
      date: '2026-01-02',
      tags: [],
    },
    content: '',
  },
];

describe('getPrerenderPaths', () => {
  it('includes every static route and every post', () => {
    expect(getPrerenderPaths(posts)).toEqual([
      '/',
      '/post',
      '/music',
      '/post/0002-second',
      '/post/0001-first',
    ]);
  });
});

describe('buildSitemapXml', () => {
  it('uses precise lastmod values and omits unsupported static dates', () => {
    const xml = buildSitemapXml(posts);

    expect(xml).toContain(
      '<loc>https://imeantto.be/post</loc>\n    <lastmod>2026-04-05</lastmod>',
    );
    expect(xml).toContain(
      '<loc>https://imeantto.be/post/0002-second</loc>\n    <lastmod>2026-04-05</lastmod>',
    );
    expect(xml).toContain(
      '<loc>https://imeantto.be/post/0001-first</loc>\n    <lastmod>2026-01-02</lastmod>',
    );
    expect(xml).toMatch(/<loc>https:\/\/imeantto\.be\/<\/loc>\n {2}<\/url>/);
    expect(xml).toMatch(
      /<loc>https:\/\/imeantto\.be\/music<\/loc>\n {2}<\/url>/,
    );
  });
});

describe('buildRssXml', () => {
  it('emits full safe HTML content and accurate channel dates', () => {
    const xml = buildRssXml(posts);

    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain('두 번째 글 &amp; 그 후');
    expect(xml).toContain(
      'xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    );
    expect(xml).toContain(
      '<lastBuildDate>Sun, 05 Apr 2026 00:00:00 GMT</lastBuildDate>',
    );
    expect(xml).toContain(
      '<guid isPermaLink="true">https://imeantto.be/post/0001-first</guid>',
    );
    expect(xml).toContain('<category>철학</category>');
    expect(xml).toContain('<content:encoded><![CDATA[<h2>본문</h2>');
    expect(xml).toContain('<table>');
    expect(xml).toContain('<code class="language-ts">');
    expect(xml).toContain('href="https://imeantto.be/post/0001-first"');
    expect(xml).toContain(
      'src="https://imeantto.be/posts/0002-second/image.png"',
    );
    expect(xml).toContain('&lt;script&gt;alert');
    expect(xml).not.toContain('<script>alert');
    expect(xml).not.toContain('class="mt-');
    expect(xml.match(/<!\[CDATA\[<h2>본문<\/h2>/g)).toHaveLength(2);
  });
});

describe('RSS serialization', () => {
  it('keeps external URLs and converts root-relative URLs', () => {
    const html = renderRssContent(
      '[내부](/post) [외부](https://example.com) ![이미지](/posts/image.png)',
    );

    expect(html).toContain('href="https://imeantto.be/post"');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('src="https://imeantto.be/posts/image.png"');
  });

  it('splits CDATA terminators safely', () => {
    expect(toCdata('앞]]>뒤')).toBe('<![CDATA[앞]]]]><![CDATA[>뒤]]>');
  });

  it('rejects RSS documents over the configured byte limit', () => {
    expect(() => assertRssSize('가나다', 8)).toThrow(
      'RSS exceeds the 8-byte size limit',
    );
    expect(() => assertRssSize('가나다', 9)).not.toThrow();
  });
});

describe('toRfc822', () => {
  it('converts YYYY-MM-DD to an RFC 822 date', () => {
    expect(toRfc822('2026-01-02')).toBe('Fri, 02 Jan 2026 00:00:00 GMT');
  });
});
