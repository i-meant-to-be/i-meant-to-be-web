import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getPosts, Post } from '../../utils/posts';
import PostItem from './component/PostItem';

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      {posts.length === 0 ? (
        <p>아직 작성된 블로그 포스트가 없습니다.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <PostItem post={post} />
          </div>
        ))
      )}
    </Layout>
  );
}
