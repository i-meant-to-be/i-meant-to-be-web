import { Link } from 'react-router-dom';
import routes from '../../../routes/route';
import type { PostWithId } from '../../../posts';
import { formatDate } from '../../../posts/formatDate';
import TagList from '../../../components/TagList';

interface PostListItemProps {
  post: PostWithId;
}

export default function PostListItem({ post }: PostListItemProps) {
  const { id, meta } = post;

  return (
    <Link
      to={`${routes.POST}/${id}`}
      className="flex flex-col py-6 hover:text-on-cream-enhanced md:py-8"
    >
      <span className="text-sm text-on-cream/60 md:text-base">
        {formatDate(meta.date)}
      </span>
      <span className="mt-4 text-xl font-bold break-keep md:mt-6 md:text-2xl">
        {meta.title}
      </span>
      <span className="mt-1 break-keep text-on-cream/80 md:mt-2 md:text-lg">
        {meta.description}
      </span>
      <TagList
        category={meta.category}
        tags={meta.tags}
        className="mt-4 md:mt-6"
      />
    </Link>
  );
}
