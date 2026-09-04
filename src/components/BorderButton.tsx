import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

type BorderButtonProps = PropsWithChildren<{
  className?: string;
  color?: 'indigo' | 'on-cream';
}>;

export default function BorderButton({
  children,
  className = '',
  color = 'indigo',
}: BorderButtonProps) {
  const buttonClassName = clsx(
    'inline-flex items-center gap-1 border-2 px-4 py-2 text-sm font-bold transition-all min-h-10 md:gap-2 md:px-5 md:py-2.5 md:text-base md:min-h-12',
    {
      'border-indigo text-indigo hover:bg-indigo hover:text-cream':
        color === 'indigo',
      'border-on-cream text-on-cream hover:bg-on-cream hover:text-cream':
        color === 'on-cream',
    },
    className,
  );

  return <span className={buttonClassName}>{children}</span>;
}
