import { buildSeoTags, resolveSeoData } from './seoTags';

interface SeoProps {
  /** canonical/OG URL과 SEO 데이터 조회에 쓰이는 실제 접근 경로. */
  path: string;
}

/**
 * 라우트별 head 태그를 렌더한다.
 *
 * React 19가 `<title>`/`<meta>`/`<link>`를 자동으로 `<head>`로 hoist하므로
 * 별도 라이브러리가 필요 없다. 프리렌더 시에는 `renderHeadHtml`이 같은 데이터로
 * head를 미리 채우므로(`src/entry-server.tsx`) 서버에서는 아무것도 렌더하지 않는다 —
 * 그러지 않으면 태그가 `<body>` 안에 중복으로 남는다.
 */
export default function Seo({ path }: SeoProps) {
  const data = resolveSeoData(path);

  if (import.meta.env.SSR) return null;

  return (
    <>
      {buildSeoTags(path, data).map((tag) => {
        const key = `${tag.tag}:${Object.values(tag.attrs).join(':')}`;

        if (tag.tag === 'title') return <title key={key}>{tag.text}</title>;
        if (tag.tag === 'link') return <link key={key} {...tag.attrs} />;
        return <meta key={key} {...tag.attrs} />;
      })}
    </>
  );
}
