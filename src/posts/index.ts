import { parsePost, type Post } from './parsePost';

export interface PostWithId extends Post {
  id: string;
}

const modules = import.meta.glob<string>('./content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const posts: PostWithId[] = Object.entries(modules)
  .map(([path, raw]) => {
    const id = path.replace('./content/', '').replace(/\.md$/, '');
    return { id, ...parsePost(raw) };
  })
  .filter((post) => !post.meta.draft)
  .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

export function getAllPosts(): PostWithId[] {
  return posts;
}

export function getPostById(id: string): PostWithId | undefined {
  return posts.find((post) => post.id === id);
}
