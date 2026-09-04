import { AUTHOR_NAME, SITE_LANGUAGE, SITE_NAME, SITE_URL } from '../site';
import routes from '../routes/route';

export interface ArticleInfo {
  publishedTime: string;
  modifiedTime?: string;
  tags: string[];
}

interface BuildJsonLdParams {
  path: string;
  title: string;
  description: string;
  article?: ArticleInfo;
}

type JsonLdNode = Record<string, unknown>;

const author: JsonLdNode = {
  '@type': 'Person',
  name: AUTHOR_NAME,
  alternateName: '강시운',
  url: `${SITE_URL}/`,
};

function breadcrumb(items: { name: string; path: string }[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * 라우트별 JSON-LD 그래프를 만든다. 순수 함수 — `Seo.tsx`가 이 결과를
 * `<script type="application/ld+json">`으로 직렬화한다.
 */
export function buildJsonLd({
  path,
  title,
  description,
  article,
}: BuildJsonLdParams): JsonLdNode {
  const url = `${SITE_URL}${path}`;

  if (article) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: title,
          description,
          datePublished: article.publishedTime,
          ...(article.modifiedTime
            ? { dateModified: article.modifiedTime }
            : {}),
          keywords: article.tags,
          inLanguage: SITE_LANGUAGE,
          author,
          publisher: author,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          url,
        },
        breadcrumb([
          { name: SITE_NAME, path: routes.ROOT },
          { name: '게시글', path: routes.POST },
          { name: title, path },
        ]),
      ],
    };
  }

  if (path === routes.ROOT) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          description,
          url: `${SITE_URL}/`,
          inLanguage: SITE_LANGUAGE,
          author,
          publisher: author,
        },
        author,
      ],
    };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: title,
        description,
        url,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
      },
      breadcrumb([
        { name: SITE_NAME, path: routes.ROOT },
        { name: title, path },
      ]),
    ],
  };
}
