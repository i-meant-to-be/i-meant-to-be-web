import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

const BACKGROUND_OPACITY = '10%';

interface CalloutProps {
  children: ReactNode;
  color?: 'indigo' | 'rose' | 'amber' | 'teal';
  className?: string;
}

// 기본 글자색의 우선순위를 낮춰 className의 텍스트 색상으로 덮어쓸 수 있게 함.
const colorClasses = {
  indigo: 'bg-indigo/(--callout-background-opacity) [:where(&)]:text-indigo',
  rose: 'bg-rose/(--callout-background-opacity) [:where(&)]:text-rose',
  amber: 'bg-amber/(--callout-background-opacity) [:where(&)]:text-amber',
  teal: 'bg-teal/(--callout-background-opacity) [:where(&)]:text-teal',
};

export default function Callout({
  children,
  color = 'indigo',
  className,
}: CalloutProps) {
  return (
    <div
      className={clsx('p-4', colorClasses[color], className)}
      style={
        { '--callout-background-opacity': BACKGROUND_OPACITY } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
