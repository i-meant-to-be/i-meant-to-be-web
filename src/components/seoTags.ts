import { AUTHOR_NAME, SITE_NAME, SITE_URL } from '../site';
import routes from '../routes/route';
import seo from '../routes/seo';
import { getPostById } from '../posts';
import { buildJsonLd, type ArticleInfo } from './jsonLd';

export interface SeoData {
  title: string;
  description: string;
  noindex?: boolean;
  /** 실제 404 응답에는 URL을 확정하는 canonical/구조화 데이터를 내보내지 않는다. */
  notFound?: boolean;
  /** `og:type=article`이어야 하는 라우트(게시물 상세)에서만 채워진다. */
  article?: ArticleInfo;
}

export interface SeoTag {
  tag: 'title' | 'meta' | 'link';
  attrs: Record<string, string>;
  text?: string;
}

const NOT_FOUND: SeoData = {
  title: '페이지를 찾을 수 없어요.',
  description: '요청한 페이지가 존재하지 않습니다.',
  noindex: true,
  notFound: true,
};

/**
 * 경로 하나로 그 라우트의 SEO 데이터를 결정하는 단일 소스.
 *
 * 정적 라우트는 `src/routes/seo.ts`에서, 게시물 상세(`/post/:id`)는
 * frontmatter에서 가져온다. 클라이언트(`Seo.tsx`)와 프리렌더
 * (`src/entry-server.tsx`)가 같은 함수를 쓰므로 둘이 어긋날 수 없다.
 */
export function resolveSeoData(path: string): SeoData {
  const postPrefix = `${routes.POST}/`;

  if (path.startsWith(postPrefix)) {
    const post = getPostById(path.slice(postPrefix.length));
    if (!post) return NOT_FOUND;

    return {
      title: post.meta.title,
      description: post.meta.description,
      article: {
        publishedTime: post.meta.date,
        ...(post.meta.updated ? { modifiedTime: post.meta.updated } : {}),
        // category는 태그의 상위 분류이므로 태그 목록 맨 앞에 함께 노출한다.
        tags: [post.meta.category, ...post.meta.tags],
      },
    };
  }

  return seo[path] ?? NOT_FOUND;
}

export function fullTitleOf(path: string, title: string): string {
  return path === routes.ROOT ? title : `${title} | ${SITE_NAME}`;
}

/**
 * `<head>`로 올라가는 태그 목록. React 19가 `title`/`meta`/`link`를 자동으로
 * head에 hoist하므로 이 목록만 렌더하면 클라이언트는 끝난다.
 *
 * JSON-LD는 여기 포함되지 않는다 — 프리렌더가 `renderHeadHtml`로 head에 직접
 * 넣는다 (React가 hoist하지 않는 태그라 클라이언트에서 렌더하면 body에 중복으로
 * 남는다).
 */
export function buildSeoTags(path: string, data: SeoData): SeoTag[] {
  const url = `${SITE_URL}${path}`;
  const title = fullTitleOf(path, data.title);
  const { description, article } = data;

  return [
    { tag: 'title', attrs: {}, text: title },
    { tag: 'meta', attrs: { name: 'description', content: description } },
    {
      tag: 'meta',
      attrs: {
        name: 'robots',
        content: data.noindex ? 'noindex, follow' : 'index, follow',
      },
    },
    ...(data.notFound
      ? []
      : [{ tag: 'link' as const, attrs: { rel: 'canonical', href: url } }]),

    {
      tag: 'meta',
      attrs: { property: 'og:type', content: article ? 'article' : 'website' },
    },
    { tag: 'meta', attrs: { property: 'og:title', content: title } },
    {
      tag: 'meta',
      attrs: { property: 'og:description', content: description },
    },
    ...(data.notFound
      ? []
      : [
          {
            tag: 'meta' as const,
            attrs: { property: 'og:url', content: url },
          },
        ]),

    ...(article
      ? [
          {
            tag: 'meta' as const,
            attrs: {
              property: 'article:published_time',
              content: article.publishedTime,
            },
          },
          {
            tag: 'meta' as const,
            attrs: { property: 'article:author', content: AUTHOR_NAME },
          },
          ...article.tags.map((tag) => ({
            tag: 'meta' as const,
            attrs: { property: 'article:tag', content: tag },
          })),
        ]
      : []),

    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    {
      tag: 'meta',
      attrs: { name: 'twitter:description', content: description },
    },
  ];
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function serialize(tag: SeoTag): string {
  const attrs = Object.entries(tag.attrs)
    .map(([key, value]) => ` ${key}="${escapeAttribute(value)}"`)
    .join('');

  return tag.tag === 'title'
    ? `<title>${escapeText(tag.text ?? '')}</title>`
    : `<${tag.tag}${attrs} />`;
}

/**
 * 프리렌더가 `</head>` 앞에 넣을 HTML 문자열. SEO 태그 + JSON-LD.
 * 이 경로로 나가는 HTML이 JS를 실행하지 않는 크롤러(네이버 Yeti 등)가 보는 전부다.
 */
export function renderHeadHtml(path: string): string {
  const data = resolveSeoData(path);
  const tags = buildSeoTags(path, data).map(serialize);

  // JSON-LD의 headline/name은 사이트명 접미사가 없는 원래 제목을 쓴다.
  if (!data.notFound) {
    const jsonLd = buildJsonLd({
      path,
      title: data.title,
      description: data.description,
      article: data.article,
    });

    tags.push(
      `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(
        /</g,
        '\\u003c',
      )}</script>`,
    );
  }

  return tags.join('\n    ');
}
