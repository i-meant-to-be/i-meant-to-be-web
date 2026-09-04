# Routing and SEO

이 문서는 라우트 정의부터 실제 배포 환경에서 색인되는 과정까지, 여러 파일이 어떻게 맞물리는지
정의한다. [`project-structure.md`](project-structure.md)의 폴더 배치 규칙을 함께 적용한다.

## 1. 소유권

| 파일                       | 책임                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `src/routes/route.ts`       | 라우트 경로 상수의 단일 소스 (`ROOT`, `POST`, `POST_DETAIL`, `MUSIC`)                 |
| `src/routes/routes.tsx`     | 경로 ↔ 페이지 컴포넌트 매핑 배열의 단일 소스. 브라우저와 프리렌더가 공유한다          |
| `src/routes/router.tsx`     | `routes.tsx`의 배열을 `createBrowserRouter`에 넘기는 브라우저 전용 래퍼               |
| `src/routes/seo.ts`         | **정적** 라우트별 `{ title, description, noindex }`의 단일 소스                      |
| `src/components/seoTags.ts` | 경로 하나로 SEO 데이터를 결정(`resolveSeoData`)하고, head 태그 목록(`buildSeoTags`)과 프리렌더용 HTML 문자열(`renderHeadHtml`)을 만드는 순수 모듈 |
| `src/components/jsonLd.ts`  | 라우트별 JSON-LD 그래프 생성 (`BlogPosting`/`WebSite`/`WebPage`/`BreadcrumbList`)     |
| `src/components/Seo.tsx`    | `seoTags.ts`의 결과를 렌더. React 19가 `title`/`meta`/`link`를 `<head>`로 hoist한다. 프리렌더(SSR) 중에는 아무것도 렌더하지 않는다 (§4 참고) |
| `src/entry-server.tsx`      | 프리렌더 엔트리. 경로별 `render()`와 sitemap/RSS 생성 함수를 export한다               |
| `src/posts/feed.ts`         | 프리렌더 경로 목록, sitemap XML, 전체 본문 RSS XML을 만드는 모듈                      |
| `scripts/prerender.mjs`     | `npm run build` 마지막 단계. 모든 라우트를 정적 HTML로 굽고 `dist/sitemap.xml`, `dist/rss.xml`을 쓴다 |
| `public/robots.txt`         | 크롤링 허용 범위와 sitemap 위치                                                       |
| `dist/404.html`             | **빌드타임 산출물**. Vercel이 없는 정적 경로에 HTTP 404와 함께 제공하는 공통 오류 본문 |
| `dist/sitemap.xml`, `dist/rss.xml` | **빌드타임에만 생성되는 산출물** (`scripts/prerender.mjs`). 저장소에 커밋하지 않는다. 색인 대상 URL 목록과 게시물 전체 본문 피드 |
| `scripts/check-post-images.mjs` | `npm run build` 첫 단계. 게시물 본문의 이미지 참조가 유효한지 검증하고 위반 시 빌드를 실패시킨다 (규칙: [`posts.md`](posts.md) §4) |

## 1-1. 빌드 파이프라인

`npm run build`는 다음 순서로 실행된다.

1. `scripts/check-post-images.mjs` — 게시물 이미지 참조 검증
2. `tsc -b` — 타입체크
3. `vite build` — 클라이언트 번들 (`dist/`)
4. `vite build --ssr src/entry-server.tsx --outDir dist-ssr` — 프리렌더용 서버 번들
5. `scripts/prerender.mjs` — 라우트별 정적 HTML + `dist/404.html` + `dist/sitemap.xml` +
   `dist/rss.xml`

## 2. 왜 프리렌더가 필요한가

이 프로젝트는 CSR SPA다. 프리렌더가 없으면 배포된 HTML의 `<body>`는 `<div id="root"></div>`
하나뿐이고 제목·설명·본문이 전부 런타임 JS에 의존한다. 네이버 Yeti는 JS를 실질적으로
실행하지 않으므로 이 상태에서는 네이버 검색에 콘텐츠가 존재하지 않는 것과 같다. Google은
렌더링은 하지만 렌더 큐 대기로 색인이 지연된다.

`scripts/prerender.mjs`가 모든 라우트를 `dist/<경로>/index.html`로 구워서 이를 해소한다.
클라이언트는 `src/main.tsx`에서 `#root`에 자식이 있으면 `hydrateRoot`로, 비어 있으면
(`vite dev`) `createRoot`로 마운트한다.

## 3. 정적 라우트와 실제 404

모든 공개 라우트와 게시물 URL은 빌드 시 `dist/<경로>/index.html`로 생성한다. 전체 경로를
`index.html`로 보내는 SPA rewrite는 두지 않는다. 따라서 유효 경로는 프리렌더 HTML과 HTTP
200을 반환하고, 오타나 삭제된 게시물처럼 생성되지 않은 경로는 Vercel이 루트의
`dist/404.html` 본문과 HTTP 404를 반환한다.

브라우저에서 `Link`로 이동한 뒤 생기는 잘못된 URL은 React Router의 마지막 `*` 라우트가 같은
`NotFoundPage`를 렌더한다. 404 head에는 `noindex, follow`만 색인 지시로 제공하며 canonical,
`og:url`, JSON-LD는 만들지 않는다. `404.html`은 프리렌더 경로 목록과 sitemap에서 제외한다.

**검증 방법**: 배포 후 유효 URL의 상태 코드가 200이고 해당 경로의 고유 `<title>`과 본문이
응답에 포함되는지 함께 확인한다. 임의의 없는 URL과 삭제된 게시물 URL은 상태 코드 404,
공통 오류 본문, `noindex, follow`를 모두 확인한다.

**`npm run preview`의 함정**: `vite preview`는 슬래시 없는 중첩 경로
(`/post/0010-...`)에서 `dist/post/0010-.../index.html`을 찾지 않고 SPA fallback으로
`dist/index.html`(홈)을 반환한다. 로컬에서 프리렌더 결과나 하이드레이션을 확인할 때는
**끝에 슬래시를 붙인 URL**(`/post/0010-.../`)을 쓴다. 슬래시 없는 URL로 확인하면 홈
마크업 위에 다른 페이지를 하이드레이션하게 되어 실제 코드와 무관한 mismatch 오류가 난다.
Vercel은 `dir/index.html`을 확장자 없는 경로로 정상 서빙하므로 이 문제는 `vite preview`
한정이다.

## 4. Seo.tsx와 noindex

라우트별로 달라지는 태그(`title`, `description`, `robots`, `canonical`, `og:type`,
`og:title`, `og:description`, `og:url`, `article:*`, `twitter:*`, JSON-LD)는
`index.html`에서 제거되어 있고 전부 `seoTags.ts`가 소유한다. `index.html`에는 라우트와
무관한 태그(favicon, RSS `link`, `og:site_name`, `og:locale`, `keywords`, `author`)만
남긴다. 같은 이름의 태그를 양쪽에 두면 **중복 태그**가 된다.

태그가 `<head>`에 도달하는 경로는 둘이다.

- **프리렌더(JS를 실행하지 않는 크롤러가 보는 것)**: `renderHeadHtml(path)`가 만든 HTML
  문자열을 `scripts/prerender.mjs`가 `</head>` 앞에 직접 넣는다. 이때 템플릿의 정적
  `<title>imeanttobe</title>`는 제거된다.
- **브라우저(SPA 이동)**: `Seo.tsx`가 같은 데이터로 `title`/`meta`/`link`를 렌더하고
  React 19가 이를 `<head>`로 hoist한다.

`Seo.tsx`는 `import.meta.env.SSR`일 때 `null`을 반환한다. 서버에서도 렌더하면 hoist할
`<head>`가 없어 태그가 `<body>` 안에 남고, 프리렌더가 넣은 head 태그와 중복된다.

JSON-LD `<script>`는 React 19의 hoist 대상이 아니라 `Seo.tsx`가 렌더하지 않는다 —
프리렌더가 `<head>`에 넣는 것이 유일한 경로다.

`react-helmet-async`는 쓰지 않는다. React 19에서는 통째로 passthrough가 되어 서버 상태를
채우지 않고 `<script>` 자식을 버린다 — React 19의 네이티브 metadata hoisting으로 충분하다.

색인하면 안 되는 유효 페이지가 생기면 `seo.ts`에서 `noindex: true`를 지정한다. `noindex`는
`robots.txt`의 `Disallow`가 아니라 `Seo.tsx`의 `<meta name="robots">`로 처리한다 —
`robots.txt`로 막으면 Google이 크롤링 자체를 못 해서 noindex 지시를 읽지 못한다. 없는
경로는 화면만 noindex 처리하지 않고 §3의 실제 HTTP 404 계약을 따른다.

## 4-1. 동적 라우트의 SEO

`seo.ts`는 라우트 경로 문자열을 key로 쓰는 고정 매핑이라 `/post/:id`처럼 콘텐츠에 따라
제목/설명이 달라지는 라우트에는 쓸 수 없다. 이 분기는 `seoTags.ts`의 `resolveSeoData(path)`가
담당한다 — `/post/`로 시작하는 경로는 `getPostById`로 게시물 frontmatter를 읽고, 그 외에는
`seo.ts`를 조회한다. 존재하지 않는 게시물 id와 매핑되지 않은 경로는 404 전용 SEO 데이터가
되어 canonical, `og:url`, JSON-LD 없이 `noindex, follow`를 제공한다.

따라서 페이지 컴포넌트는 `<Seo path={path} />`만 넘기면 된다. 게시물 상세는
`` `${routes.POST}/${id}` ``를 넘긴다 (`src/pages/PostDetailPage/PostDetailPage.tsx` 참고).
프리렌더와 브라우저가 같은 `resolveSeoData`를 쓰므로 둘의 head가 어긋날 수 없다.

동적 라우트는 `seo.ts`에 경로 key를 추가하지 않는다 — `resolveSeoData`가 처리한다.

게시물 frontmatter 필드 계약과 본문 작성 규칙은 [`posts.md`](posts.md)를 참고한다.

## 4-2. sitemap과 RSS 날짜·본문 계약

`sitemap.xml`의 `<lastmod>`는 실제로 관리할 수 있는 날짜만 제공한다.

- 개별 게시물: `updated ?? date`
- `/post`: 모든 게시물의 `updated ?? date` 중 가장 최근 날짜
- `/`, `/music`: 지속적으로 관리하는 수정일 소스가 없으므로 생략

게시물 JSON-LD의 `datePublished`는 최초 발행일 `date`를 유지하고, `updated`가 있을 때만
`dateModified`를 추가한다.

`rss.xml`의 각 item은 `react-markdown`과 GFM 규칙으로 변환한 전체 본문 HTML을
`description`과 `content:encoded`에 같은 CDATA로 제공한다. Markdown 원문의 HTML은 실행하지
않고 텍스트로 이스케이프하며, `/`로 시작하는 내부 링크와 이미지는 `SITE_URL` 기준 절대 URL로
바꾼다. 웹 화면용 Tailwind 클래스와 코드 하이라이팅은 넣지 않는다. `pubDate`는 최초 발행일,
channel의 `lastBuildDate`는 가장 최근 `updated ?? date`를 쓴다. 직렬화할 때 XML 특수문자와
CDATA 종료 문자열을 안전하게 처리하며, UTF-8 기준 10MB를 넘으면 빌드를 실패시킨다.

## 5. 새 라우트 추가 체크리스트

1. `route.ts`에 경로 상수 추가
2. `routes.tsx`에 페이지 컴포넌트 등록
3. `src/pages/{Page}/{Page}.tsx` 생성, 최상위에 `<Seo path={routes.X} />` 추가
4. 정적 라우트라면 `seo.ts`에 해당 경로의 `{ title, description, noindex? }` 추가 (동적 라우트는
   `seoTags.ts`의 `resolveSeoData`에 분기를 추가한다 — §4-1 참고)
5. `src/posts/feed.ts`의 `STATIC_PATHS`에 경로 추가 — 프리렌더와 sitemap이 이 목록을 쓴다
   (`noindex: true`인 유효 라우트도 프리렌더는 하되 sitemap에서는 자동으로 빠진다)
6. `Header.tsx`에 내비게이션이 필요하면 `NavLink`로 추가 (내부 라우트는 항상
   `Link`/`NavLink`만 쓴다 — `window.open`은 외부 링크 전용. `Footer.tsx`/`HomePage.tsx`의
   외부 링크 버튼 참고)
7. 배포 후 상태 코드 200과 함께 `curl -s https://imeantto.be/{경로} | grep '<title>'`로
   **응답 본문에 그 라우트의 프리렌더된 SEO 메타데이터가 들어 있는지** 확인한다. 그 다음
   Google Search Console에서 URL 검사 → 색인 생성 요청

## 6. 금지 사항

- `Seo`를 거치지 않고 페이지 컴포넌트에 `<title>`이나 `<meta>`를 직접 쓰지 않는다.
- `index.html`에 라우트별로 달라지는 태그(title/description/canonical/robots/og:title/
  og:description/og:url)를 다시 추가하지 않는다 — `Seo.tsx`와 중복된다.
- 전체 경로를 `index.html`로 보내는 SPA rewrite를 추가하지 않는다. 없는 URL이 200으로
  응답하면 검색 엔진이 soft 404로 판단할 수 있다.
- `sitemap.xml`과 `rss.xml`을 손으로 만들거나 저장소에 커밋하지 않는다 — `npm run build`가
  `dist/`에 생성한다.
- `Seo.tsx`의 SSR 가드(`import.meta.env.SSR`)를 제거하지 않는다 — §4의 중복 태그 문제가
  다시 생긴다.
- 소개 문단처럼 문장 안에 흐르는 링크에 블록 레벨 요소(`<h1>` 등)를 쓰지 않는다. 크롤러가
  그 경계마다 문장을 끊어 검색 스니펫이 깨진다
  (`src/pages/HomePage/components/TextButton.tsx` 참고).
