import type { IconType } from 'react-icons';

interface IconButtonProps {
  label: string;
  url?: string;
  icon: IconType;
  size?: number;
  /** 아이콘 SVG에 적용할 클래스. 크기는 size-* 유틸리티로 지정할 수 있음. */
  className?: string;
}

const buttonClassName =
  'inline-flex items-center justify-center text-on-cream transition-colors hover:text-on-cream-enhanced focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current';

export default function IconButton(props: IconButtonProps) {
  const { label, url, icon: Icon, size = 32, className } = props;

  if (!url) {
    return null;
  }

  return (
    <a
      href={url}
      aria-label={label}
      title={label}
      target="_blank"
      rel="noreferrer noopener"
      className={buttonClassName}
    >
      <Icon size={size} className={className} aria-hidden="true" />
    </a>
  );
}
