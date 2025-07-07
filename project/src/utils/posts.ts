// src/utils/posts.ts
export interface Post {
  id: number;
  content: string;
}

export const getPosts = async (): Promise<Post[]> => {
  const posts: Post[] = [];
  const postFileNames = ['0001.md'];

  for (const fileName of postFileNames) {
    try {
      // Vite를 사용하는 경우 `import.meta.glob`을 활용하여 동적으로 불러올 수 있습니다.
      const modules = import.meta.glob('/src/posts/*.md', {
        query: '?raw',
        import: 'default',
      });
      const contentUnknown = await modules[`/src/posts/${fileName}`]();
      const content =
        typeof contentUnknown === 'string'
          ? contentUnknown
          : String(contentUnknown);

      const id = parseInt(fileName.replace('.md', ''), 10);
      posts.push({ id, content });
    } catch (error) {
      console.error(`Error loading post ${fileName}:`, error);
    }
  }

  // ID를 기준으로 오름차순 정렬
  posts.sort((a, b) => a.id - b.id);
  return posts;
};
