interface TextLinkButtonProps {
  text: string;
  url?: string;
}

const className =
  'bg-indigo text-cream hover:bg-indigo-enhanced transition-all';

/**
 * 소개 문단 안에 흐르는 인라인 외부 링크.
 *
 * 반드시 인라인 요소(`<a>`/`<span>`)로 렌더한다. 블록 레벨 요소(`<h1>` 등)를 쓰면
 * 검색 크롤러가 문단을 그 경계마다 끊어 스니펫이 깨진다.
 */
export default function TextButton({ text, url }: TextLinkButtonProps) {
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
