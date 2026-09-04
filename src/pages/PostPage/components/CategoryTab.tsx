import clsx from 'clsx';

interface CategoryTabProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

/** 상위 분류는 각진 사각형이다 — 둥근 태그 pill과 모양으로 위계를 구분한다. */
export default function CategoryTab({
  label,
  selected,
  onSelect,
}: CategoryTabProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={clsx(
        'border-2 border-indigo px-3 py-1 text-xs transition-all md:px-4 md:py-1.5 md:text-sm',
        selected
          ? 'bg-indigo text-cream hover:bg-indigo-enhanced'
          : 'bg-transparent text-indigo hover:bg-indigo/10',
      )}
    >
      {label}
    </button>
  );
}
