import { describe, expect, it } from 'vitest';
import { getAllPostSummaries, getPostSummaryById, loadPost } from './index';
describe('post loading', () => {
  it('provides sorted metadata without bodies', () => {
    const posts = getAllPostSummaries();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => !('content' in post))).toBe(true);
    expect(posts.map((post) => post.meta.date)).toEqual(
      posts
        .map((post) => post.meta.date)
        .sort()
        .reverse(),
    );
  });
  it('loads a selected body with matching metadata', async () => {
    const summary = getAllPostSummaries()[0];
    const post = await loadPost(summary.id);
    expect(post?.meta).toEqual(summary.meta);
    expect(post?.content.length).toBeGreaterThan(0);
    expect(getPostSummaryById(summary.id)).toBe(summary);
  });
  it('returns undefined for unknown and traversal ids', async () => {
    expect(await loadPost('missing')).toBeUndefined();
    expect(await loadPost('../parsePost')).toBeUndefined();
  });
});
