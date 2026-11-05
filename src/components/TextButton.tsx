import clsx from 'clsx';

interface TextButtonProps {
  text: string;
  url?: string;
  color?: 'indigo' | 'on-cream';
}

/**
 * 문단 안에서도 사용할 수 있는 인라인 외부 링크. URL이 없으면 텍스트로 표시함.
 */
export default function TextButton(props: TextButtonProps) {
  const { text, url, color = 'indigo' } = props;

  const className = clsx('transition-colors', {
    'text-indigo': color === 'indigo',
    'text-on-cream': color === 'on-cream',
    'hover:text-indigo-enhanced': !!url && color === 'indigo',
    'hover:text-on-cream-enhanced': !!url && color === 'on-cream',
    'underline-offset-4 hover:underline': !!url,
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current':
      !!url,
  });

  if (!url) {
    return <span className={className}>{text}</span>;
  }

  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noreferrer noopener"
    >
      {text}
    </a>
  );
}
