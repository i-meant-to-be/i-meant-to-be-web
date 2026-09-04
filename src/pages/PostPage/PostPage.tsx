import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';
import { getAllPosts } from '../../posts';
import PostListItem from './components/PostListItem';
import seo from '../../routes/seo';

export default function PostPage() {
  const posts = getAllPosts();

  return (
    <Layout>
      <Seo path={routes.POST} />
      <h1 className="text-4xl font-bold break-keep md:text-5xl">게시글</h1>
      <p className="mt-4 break-keep md:mt-6 md:text-lg">
        {seo[routes.POST].description}
      </p>
      <p className="mt-8 text-sm text-on-cream/60 md:mt-10 md:text-base">
        총 {posts.length}건의 게시물
      </p>
      <div className="flex flex-col divide-y divide-on-cream/20">
        {posts.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
      </div>
    </Layout>
  );
}
