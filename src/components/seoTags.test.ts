import { describe, expect, it } from 'vitest';
import { renderHeadHtml, resolveSeoData } from './seoTags';
import { getAllPosts } from '../posts';

describe('resolveSeoData', () => {
  it('reads a post title and description from its frontmatter', () => {
    const post = getAllPosts()[0];
    const data = resolveSeoData(`/post/${post.id}`);

    expect(data.title).toBe(post.meta.title);
    expect(data.article).toEqual({
      publishedTime: post.meta.date,
      tags: post.meta.tags,
    });
  });

  it('marks unknown posts and unknown routes as noindex', () => {
    expect(resolveSeoData('/post/does-not-exist').noindex).toBe(true);
    expect(resolveSeoData('/nope').noindex).toBe(true);
  });

  it('reads static routes from the seo map', () => {
    expect(resolveSeoData('/music').title).toBe('음악');
    expect(resolveSeoData('/music').article).toBeUndefined();
  });
});

describe('renderHeadHtml', () => {
  it('emits article metadata and JSON-LD for a post', () => {
    const post = getAllPosts()[0];
    const html = renderHeadHtml(`/post/${post.id}`);

    expect(html).toContain(`<title>${post.meta.title} | imeanttobe</title>`);
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain(
      `<link rel="canonical" href="https://imeantto.be/post/${post.id}" />`,
    );
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('<meta name="robots" content="index, follow" />');
  });

  it('marks a missing post noindex and keeps the site title suffix off the root', () => {
    const notFoundHead = renderHeadHtml('/post/nope');

    expect(notFoundHead).toContain(
      '<meta name="robots" content="noindex, follow" />',
    );
    expect(notFoundHead).not.toContain('rel="canonical"');
    expect(notFoundHead).not.toContain('property="og:url"');
    expect(notFoundHead).not.toContain('application/ld+json');
    expect(renderHeadHtml('/')).toContain('<title>imeanttobe</title>');
  });

  it('escapes markup characters so the head stays well formed', () => {
    const html = renderHeadHtml('/');
    expect(html).not.toMatch(/content="[^"]*"[^"/>]*"/);
    expect(html).toContain('"@type":"WebSite"');
  });
});
