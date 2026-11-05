import clsx from 'clsx';
import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  color?: 'indigo' | 'rose' | 'amber' | 'teal';
}

const COLOR_CLASS_NAMES = {
  indigo: 'bg-indigo/10 text-indigo',
  rose: 'bg-rose/10 text-rose',
  amber: 'bg-amber/10 text-amber',
  teal: 'bg-teal/10 text-teal',
};

export default function Tag({ children, color = 'indigo' }: TagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm',
        COLOR_CLASS_NAMES[color],
      )}
    >
      {children}
    </span>
  );
}
