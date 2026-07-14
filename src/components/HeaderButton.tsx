import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

type HeaderButtonProps = PropsWithChildren<{
  onSelected: boolean;
}>;

export default function HeaderButton(props: HeaderButtonProps) {
  const { children, onSelected } = props;

  return (
    <span
      className={clsx(
        'flex size-12 p-3 transition-all border-indigo border-2 md:size-20 md:border-4 md:p-4',
        {
          'bg-indigo text-cream hover:bg-indigo-enhanced': onSelected,
          'border-indigo bg-transparent text-indigo hover:bg-transparent':
            !onSelected,
        },
      )}
    >
      {children}
    </span>
  );
}
