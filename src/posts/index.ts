import { parsePost, type Post, type PostMeta } from './parsePost';
export { CATEGORIES } from './parsePost';
export type { Category } from './parsePost';
export interface PostSummary {
  id: string;
  meta: PostMeta;
}
export interface PostWithId extends Post {
  id: string;
}
const metadata = import.meta.glob<PostMeta>('./content/*.md', {
  query: '?post-meta',
  import: 'default',
  eager: true,
});
const bodies = import.meta.glob<string>('./content/*.md', {
  query: '?raw',
  import: 'default',
});
const posts: PostSummary[] = Object.entries(metadata)
  .map(([path, meta]) => ({
    id: path.replace('./content/', '').replace(/\.md$/, ''),
    meta,
  }))
  .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
export function getAllPostSummaries(): PostSummary[] {
  return posts;
}
export function getPostSummaryById(id: string): PostSummary | undefined {
  return posts.find((post) => post.id === id);
}
export async function loadPost(id: string): Promise<PostWithId | undefined> {
  if (!getPostSummaryById(id)) return undefined;
  const raw = await bodies[`./content/${id}.md`]();
  return { id, ...parsePost(raw) };
}
