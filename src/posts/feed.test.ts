import { describe, expect, it } from 'vitest';
import {
  buildRssXml,
  buildSitemapXml,
  getPrerenderPaths,
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
      tags: ['철학'],
    },
    content: '',
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
  it('lists static routes and posts with lastmod', () => {
    const xml = buildSitemapXml(posts);

    expect(xml).toContain('<loc>https://imeantto.be/</loc>');
    expect(xml).toContain('<loc>https://imeantto.be/post/0001-first</loc>');
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>');
    // 정적 경로는 가장 최근 게시물 날짜를 쓴다.
    expect(xml).toContain('<lastmod>2026-02-03</lastmod>');
  });
});

describe('buildRssXml', () => {
  it('emits one escaped item per post', () => {
    const xml = buildRssXml(posts);

    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain('두 번째 글 &amp; 그 후');
    expect(xml).toContain(
      '<guid isPermaLink="true">https://imeantto.be/post/0001-first</guid>',
    );
    expect(xml).toContain('<category>철학</category>');
  });
});

describe('toRfc822', () => {
  it('converts YYYY-MM-DD to an RFC 822 date', () => {
    expect(toRfc822('2026-01-02')).toBe('Fri, 02 Jan 2026 00:00:00 GMT');
  });
});
