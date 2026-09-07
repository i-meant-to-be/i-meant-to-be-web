import type { Category } from '../posts';

interface TagListProps {
  /** 태그의 상위 분류. 태그보다 앞에, 각진 채움 배지로 렌더한다. */
  category: Category;
  tags: string[];
  className?: string;
}

/** 상위 분류와 태그가 공유하는 여백·글자 크기. 모양(모서리·색)만 서로 다르다. */
const BADGE = 'px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm';

const CATEGORY_CLASS_NAMES = {
  개발: 'bg-indigo text-cream',
  철학: 'bg-teal text-cream',
} as const;

const TAG_CLASS_NAMES = {
  개발: 'bg-indigo/10 text-indigo',
  철학: 'bg-teal/10 text-teal',
} as const;

export default function TagList({ category, tags, className }: TagListProps) {
  const tagClassName = TAG_CLASS_NAMES[category];

  return (
    <span
      className={`flex flex-row flex-wrap gap-2 md:gap-3 ${className ?? ''}`}
    >
      <span className={`${CATEGORY_CLASS_NAMES[category]} ${BADGE}`}>
        {category}
      </span>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-full ${tagClassName} ${BADGE}`}
        >
          {tag}
        </span>
      ))}
    </span>
  );
}
