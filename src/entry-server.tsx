import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom';
import './index.css';
import routeObjects from './routes/routes';
import { renderHeadHtml } from './components/seoTags';
import { getAllPostSummaries, loadPost } from './posts';
import { buildRssXml, buildSitemapXml, getPrerenderPaths } from './posts/feed';

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
export async function render(url: string): Promise<RenderResult> {
  const handler = createStaticHandler(routeObjects);
  const context = await handler.query(
    new Request(new URL(url, 'https://imeantto.be')),
  );
  if (context instanceof Response)
    throw new Error(`Unexpected response: ${context.status}`);
  if (context.errors)
    throw new Error(`Prerender failed: ${JSON.stringify(context.errors)}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  const html = renderToString(
    <StaticRouterProvider router={router} context={context} />,
  );
  return { html, head: renderHeadHtml(url) };
}

export function getPaths(): string[] {
  return getPrerenderPaths(getAllPostSummaries());
}

export function getSitemapXml(): string {
  return buildSitemapXml(getAllPostSummaries());
}

export async function getRssXml(): Promise<string> {
  const posts = await Promise.all(
    getAllPostSummaries().map(async ({ id }) => {
      const post = await loadPost(id);
      if (!post) throw new Error(`Missing post: ${id}`);
      return post;
    }),
  );
  return buildRssXml(posts);
}
