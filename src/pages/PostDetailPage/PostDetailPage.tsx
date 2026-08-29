import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import TagList from '../../components/TagList';
import routes from '../../routes/route';
import { getAllPosts, getPostById } from '../../posts';
import { formatDate } from '../../posts/formatDate';
import { extractHeadings } from '../../posts/extractHeadings';
import BackToListButton from './components/BackToListButton';
import MarkdownContent from './components/MarkdownContent';
import PostListSection from './components/PostListSection';
import ShareButton from './components/ShareButton';
import TableOfContents from './components/TableOfContents';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const post = id ? getPostById(id) : undefined;
  const path = `${routes.POST}/${id ?? ''}`;

  if (!post) {
    return (
      <Layout>
        <Seo
          path={path}
          override={{
            title: '게시글을 찾을 수 없어요',
            description: '요청한 게시글이 존재하지 않습니다.',
            noindex: true,
          }}
        />
        <h1 className="text-2xl font-bold md:text-3xl">
          게시글을 찾을 수 없어요.
        </h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        path={path}
        override={{
          title: post.meta.title,
          description: post.meta.description,
        }}
      />

      <div className="flex flex-row items-center justify-between mb-24 md:mb-32">
        <BackToListButton />
        <ShareButton />
      </div>

      <article className="select-text">
        <h1 className="text-4xl font-bold break-keep mb-8 md:text-5xl md:mb-10">
          {post.meta.title}
        </h1>
        <TagList tags={post.meta.tags} className="mb-2 md:mb-3" />
        <p className="mb-8 text-sm text-on-cream/60 md:mb-10 md:text-base">
          {formatDate(post.meta.date)}
        </p>

        <TableOfContents headings={extractHeadings(post.content)} />
        <MarkdownContent content={post.content} />
      </article>

      <PostListSection posts={getAllPosts()} className="mb-12 md:mb-16" />

      <BackToListButton className="self-end" />
    </Layout>
  );
}
