import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { useRoutes } from 'react-router-dom';
import './index.css';
import routeObjects from './routes/routes';
import { renderHeadHtml } from './components/seoTags';
import { getAllPosts } from './posts';
import { buildRssXml, buildSitemapXml, getPrerenderPaths } from './posts/feed';

function Routes() {
  return useRoutes(routeObjects);
}

export interface RenderResult {
  /** `<div id="root">` 안에 들어갈 마크업 */
  html: string;
  /** `</head>` 앞에 삽입할 SEO 태그와 JSON-LD */
  head: string;
}

/**
 * 하나의 경로를 정적 HTML로 렌더한다. `scripts/prerender.mjs`가 호출한다.
 *
 * `Analytics`(클라이언트 전용)는 여기서 렌더하지 않는다 — `main.tsx`가
 * 하이드레이션 이후 붙인다.
 */
export function render(url: string): RenderResult {
  const html = renderToString(
    <StaticRouter location={url}>
      <Routes />
    </StaticRouter>,
  );

  return { html, head: renderHeadHtml(url) };
}

export function getPaths(): string[] {
  return getPrerenderPaths(getAllPosts());
}

export function getSitemapXml(): string {
  return buildSitemapXml(getAllPosts());
}

export function getRssXml(): string {
  return buildRssXml(getAllPosts());
}
