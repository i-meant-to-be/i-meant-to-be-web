import clsx from 'clsx';

interface CategoryTabProps {
  label: string;
  color: 'on-cream' | 'indigo' | 'teal';
  selected: boolean;
  onSelect: () => void;
}

const COLOR_CLASS_NAMES = {
  'on-cream': {
    selected:
      'border-on-cream bg-on-cream text-cream hover:bg-on-cream-enhanced',
    unselected:
      'border-on-cream bg-transparent text-on-cream hover:bg-on-cream/10',
  },
  indigo: {
    selected: 'border-indigo bg-indigo text-cream hover:bg-indigo-enhanced',
    unselected:
      'border-indigo bg-transparent text-indigo hover:bg-indigo/10',
  },
  teal: {
    selected: 'border-teal bg-teal text-cream hover:bg-teal/80',
    unselected: 'border-teal bg-transparent text-teal hover:bg-teal/10',
  },
} as const;

/** 상위 분류는 각진 사각형이다 — 둥근 태그 pill과 모양으로 위계를 구분한다. */
export default function CategoryTab({
  label,
  color,
  selected,
  onSelect,
}: CategoryTabProps) {
  const tabClassName = clsx(
    'border-2 px-3 py-1 text-xs transition-all md:px-4 md:py-1.5 md:text-sm',
    selected
      ? COLOR_CLASS_NAMES[color].selected
      : COLOR_CLASS_NAMES[color].unselected,
  );

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={tabClassName}
    >
      {label}
    </button>
  );
}
