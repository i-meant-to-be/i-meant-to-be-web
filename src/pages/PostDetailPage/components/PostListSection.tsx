import { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../routes/route';
import type { PostWithId } from '../../../posts';
import { formatDate } from '../../../posts/formatDate';
import clsx from 'clsx';

const PAGE_SIZE = 5;

interface PostListSectionProps {
  posts: PostWithId[];
  className?: string;
}

export default function PostListSection({
  posts,
  className = '',
}: PostListSectionProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visiblePosts = posts.slice(start, start + PAGE_SIZE);

  const handlePreviousClick = () =>
    setPage((current) => Math.max(0, current - 1));
  const handleNextClick = () =>
    setPage((current) => Math.min(totalPages - 1, current + 1));

  return (
    <section
      className={clsx(
        'mt-16 border-2 border-on-cream p-4 md:mt-20 md:p-8',
        className,
      )}
    >
      <h2 className="text-lg font-bold md:text-xl">전체 게시글</h2>
      <div className="mt-4 flex flex-col divide-y divide-on-cream/20 md:mt-6">
        {visiblePosts.map((post) => (
          <Link
            key={post.id}
            to={`${routes.POST}/${post.id}`}
            className="group flex flex-row items-baseline justify-between gap-4 px-2 py-2"
          >
            <span className="break-keep text-sm md:text-base">
              {post.meta.title}
            </span>
            <span className="shrink-0 text-sm text-on-cream/60 md:text-base">
              {formatDate(post.meta.date)}
            </span>
          </Link>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex flex-row items-center justify-center gap-4 md:mt-6 md:gap-6">
          <button
            type="button"
            onClick={handlePreviousClick}
            disabled={page === 0}
            className="text-sm text-indigo hover:text-indigo-enhanced disabled:text-on-cream/30 md:text-base"
          >
            이전
          </button>
          <span className="text-sm text-on-cream/60 md:text-base">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextClick}
            disabled={page === totalPages - 1}
            className="text-sm text-indigo hover:text-indigo-enhanced disabled:text-on-cream/30 md:text-base"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
}
