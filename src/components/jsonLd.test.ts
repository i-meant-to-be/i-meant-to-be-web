import { describe, expect, it } from 'vitest';
import { buildJsonLd } from './jsonLd';

function graphOf(node: ReturnType<typeof buildJsonLd>) {
  return node['@graph'] as Record<string, unknown>[];
}

describe('buildJsonLd', () => {
  it('builds a WebSite graph for the root path', () => {
    const graph = graphOf(
      buildJsonLd({
        path: '/',
        title: 'imeanttobe',
        description: '설명',
      }),
    );

    expect(graph[0]['@type']).toBe('WebSite');
    expect(graph[0].url).toBe('https://imeantto.be/');
    expect(graph[1]['@type']).toBe('Person');
  });

  it('builds a BlogPosting graph with breadcrumbs for a post', () => {
    const graph = graphOf(
      buildJsonLd({
        path: '/post/0001-hello-world',
        title: '안녕',
        description: '첫 글',
        article: {
          publishedTime: '2026-01-02',
          modifiedTime: '2026-01-03',
          tags: ['안드로이드'],
        },
      }),
    );

    expect(graph[0]).toMatchObject({
      '@type': 'BlogPosting',
      headline: '안녕',
      datePublished: '2026-01-02',
      dateModified: '2026-01-03',
      keywords: ['안드로이드'],
      url: 'https://imeantto.be/post/0001-hello-world',
    });

    const breadcrumb = graph[1];
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(
      (breadcrumb.itemListElement as Record<string, unknown>[]).map(
        (item) => item.item,
      ),
    ).toEqual([
      'https://imeantto.be/',
      'https://imeantto.be/post',
      'https://imeantto.be/post/0001-hello-world',
    ]);
  });

  it('builds a WebPage graph for other static routes', () => {
    const graph = graphOf(
      buildJsonLd({
        path: '/music',
        title: '음악',
        description: '음악 설명',
      }),
    );

    expect(graph[0]['@type']).toBe('WebPage');
    expect(graph[1]['@type']).toBe('BreadcrumbList');
  });

  it('omits dateModified when a post has no updated date', () => {
    const graph = graphOf(
      buildJsonLd({
        path: '/post/0002-post',
        title: '게시글',
        description: '설명',
        article: { publishedTime: '2026-01-02', tags: [] },
      }),
    );

    expect(graph[0]).not.toHaveProperty('dateModified');
  });
});
