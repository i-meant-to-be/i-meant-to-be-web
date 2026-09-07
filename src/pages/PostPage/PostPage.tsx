import { useState } from 'react';
import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';
import { CATEGORIES, getAllPosts, type Category } from '../../posts';
import PostListItem from './components/PostListItem';
import CategoryTab from './components/CategoryTab';

const CATEGORY_COLORS = {
  전체: 'on-cream',
  개발: 'indigo',
  철학: 'teal',
} as const;

export default function PostPage() {
  const posts = getAllPosts();
  const [selected, setSelected] = useState<Category | null>(null);
  const visiblePosts = selected
    ? posts.filter((post) => post.meta.category === selected)
    : posts;

  const handleCategorySelect = (category: Category | null) => () =>
    setSelected(category);

  return (
    <Layout>
      <Seo path={routes.POST} />
      <h1 className="sr-only">게시글</h1>
      <div
        role="group"
        aria-label="분류"
        className="flex flex-row flex-wrap gap-2 md:gap-3"
      >
        {[null, ...CATEGORIES].map((category) => {
          const label = category ?? '전체';

          return (
            <CategoryTab
              key={label}
              label={label}
              color={CATEGORY_COLORS[label]}
              selected={selected === category}
              onSelect={handleCategorySelect(category)}
            />
          );
        })}
      </div>
      <p className="mt-4 text-sm text-on-cream/60 md:mt-6 md:text-base">
        총 {visiblePosts.length}건의 게시물
      </p>
      <div className="flex flex-col divide-y divide-on-cream/20">
        {visiblePosts.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
      </div>
    </Layout>
  );
}
