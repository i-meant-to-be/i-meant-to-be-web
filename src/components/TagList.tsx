import type { Category } from '../posts';
import Tag from './Tag';

interface TagListProps {
  /** 태그의 상위 분류. 태그보다 앞에, 각진 채움 배지로 렌더한다. */
  category: Category;
  tags: string[];
  className?: string;
}

/** 상위 분류 배지의 여백·글자 크기. */
const BADGE = 'px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm';

const CATEGORY_CLASS_NAMES = {
  개발: 'bg-indigo text-cream',
  철학: 'bg-teal text-cream',
} as const;

const TAG_COLORS = {
  개발: 'indigo',
  철학: 'teal',
} as const;

export default function TagList({ category, tags, className }: TagListProps) {
  return (
    <span
      className={`flex flex-row flex-wrap gap-2 md:gap-3 ${className ?? ''}`}
    >
      <span className={`${CATEGORY_CLASS_NAMES[category]} ${BADGE}`}>
        {category}
      </span>
      {tags.map((tag) => (
        <Tag key={tag} color={TAG_COLORS[category]}>
          {tag}
        </Tag>
      ))}
    </span>
  );
}
