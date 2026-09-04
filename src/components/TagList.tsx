interface TagListProps {
  /** 태그의 상위 분류. 태그보다 앞에, 각진 채움 배지로 렌더한다. */
  category?: string;
  tags: string[];
  className?: string;
}

/** 상위 분류와 태그가 공유하는 여백·글자 크기. 모양(모서리·색)만 서로 다르다. */
const BADGE = 'px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm';

export default function TagList({ category, tags, className }: TagListProps) {
  if (!category && tags.length === 0) return null;

  return (
    <span
      className={`flex flex-row flex-wrap gap-2 md:gap-3 ${className ?? ''}`}
    >
      {category && (
        <span className={`bg-indigo text-cream ${BADGE}`}>{category}</span>
      )}
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-full bg-indigo/10 text-indigo ${BADGE}`}
        >
          {tag}
        </span>
      ))}
    </span>
  );
}
