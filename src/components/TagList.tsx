interface TagListProps {
  tags: string[];
  className?: string;
}

export default function TagList({ tags, className }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <span
      className={`flex flex-row flex-wrap gap-2 md:gap-3 ${className ?? ''}`}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-indigo/10 px-3 py-1 text-xs text-indigo md:px-4 md:py-1.5 md:text-sm"
        >
          {tag}
        </span>
      ))}
    </span>
  );
}
