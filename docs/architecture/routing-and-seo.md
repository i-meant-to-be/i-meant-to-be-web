# Routing and SEO

라우트 정의부터 배포 환경에서 색인되기까지 여러 파일이 맞물리는 방식.

## 1. 소유권

| 파일                               | 책임                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/routes/route.ts`              | 라우트 경로 상수의 단일 소스                                                                                  |
| `src/routes/routes.tsx`            | 경로 ↔ 페이지 컴포넌트 매핑의 단일 소스. 브라우저와 프리렌더가 공유                                           |
| `src/routes/router.tsx`            | `routes.tsx`를 `createBrowserRouter`에 넘기는 브라우저 전용 래퍼                                              |
| `src/routes/seo.ts`                | **정적** 라우트별 `{ title, description, noindex }`의 단일 소스                                               |
| `src/components/seoTags.ts`        | 경로 → SEO 데이터(`resolveSeoData`), head 태그 목록(`buildSeoTags`), 프리렌더용 HTML 문자열(`renderHeadHtml`) |
| `src/components/jsonLd.ts`         | 라우트별 JSON-LD 그래프 (`BlogPosting`/`WebSite`/`WebPage`/`BreadcrumbList`)                                  |
| `src/components/Seo.tsx`           | `seoTags.ts`의 결과를 렌더. 프리렌더 중에는 아무것도 렌더하지 않음 (§4)                                       |
| `src/entry-server.tsx`             | 프리렌더 엔트리. 경로별 `render()`와 sitemap/RSS 생성 함수를 export                                           |
| `src/posts/feed.ts`                | 프리렌더 경로 목록, sitemap XML, 전체 본문 RSS XML                                                            |
| `scripts/prerender.mjs`            | 모든 라우트를 정적 HTML로 굽고 `dist/404.html`, `dist/sitemap.xml`, `dist/rss.xml`을 씀                       |
| `scripts/check-post-images.mjs`    | 게시물 이미지 참조 검증 (규칙: [`posts.md`](posts.md) §4-7)                                                   |
| `public/robots.txt`                | 크롤링 허용 범위와 sitemap 위치                                                                               |
| `dist/404.html`                    | 빌드 산출물. 없는 정적 경로에 HTTP 404와 함께 제공되는 공통 오류 본문                                         |
| `dist/sitemap.xml`, `dist/rss.xml` | 빌드 산출물. 커밋하지 않음                                                                                    |

## 1-1. 빌드 파이프라인

`npm run build` 실행 순서.

1. `scripts/check-post-images.mjs` — 이미지 참조 검증
2. `tsc -b` — 타입체크
3. `vite build` — 클라이언트 번들
4. `vite build --ssr src/entry-server.tsx --outDir dist-ssr` — 프리렌더용 서버 번들
5. `scripts/prerender.mjs` — 라우트별 정적 HTML + `404.html` + `sitemap.xml` + `rss.xml`

## 2. 왜 프리렌더가 필요한가

CSR SPA라 프리렌더가 없으면 배포 HTML의 `<body>`가 `<div id="root"></div>` 하나뿐이고
제목·설명·본문이 전부 런타임 JS에 의존함. 네이버 Yeti는 JS를 실질적으로 실행하지 않아 네이버
검색에는 콘텐츠가 없는 것과 같고, Google은 렌더 큐 대기로 색인이 지연됨.

`scripts/prerender.mjs`가 모든 라우트를 `dist/<경로>/index.html`로 구워 이를 해소함.
클라이언트는 `src/main.tsx`에서 `#root`에 자식이 있으면 `hydrateRoot`로, 비어 있으면
`createRoot`로 마운트함.

## 3. 정적 라우트와 실제 404

모든 공개 라우트와 게시물 URL을 빌드 시 `dist/<경로>/index.html`로 생성함. 전체 경로를
`index.html`로 보내는 SPA rewrite는 두지 않음. 유효 경로는 프리렌더 HTML과 HTTP 200을,
생성되지 않은 경로는 `dist/404.html` 본문과 HTTP 404를 반환함.

브라우저에서 `Link`로 이동한 뒤 생기는 잘못된 URL은 React Router의 마지막 `*` 라우트가 같은
`NotFoundPage`를 렌더함. 404 head에는 `noindex, follow`만 두고 canonical·`og:url`·JSON-LD를
만들지 않음. `404.html`은 프리렌더 경로 목록과 sitemap에서 제외함.

**검증**: 배포 후 유효 URL이 200과 함께 그 경로의 고유 `<title>`·본문을 응답에 포함하는지,
없는 URL과 삭제된 게시물 URL이 404·공통 오류 본문·`noindex, follow`를 반환하는지 확인함.

**`npm run preview`의 함정**: `vite preview`는 슬래시 없는 중첩 경로에서
`dist/post/<id>/index.html` 대신 SPA fallback으로 홈을 반환함. 로컬에서 프리렌더나
하이드레이션을 확인할 때는 **끝에 슬래시를 붙인 URL**을 씀. 슬래시가 없으면 홈 마크업 위에
다른 페이지를 하이드레이션해 실제 코드와 무관한 mismatch가 남. Vercel은 `dir/index.html`을
확장자 없는 경로로 정상 서빙하므로 `vite preview` 한정 문제임.

## 4. Seo.tsx와 noindex

라우트별로 달라지는 태그(`title`, `description`, `robots`, `canonical`, `og:*`, `article:*`,
`twitter:*`, JSON-LD)는 전부 `seoTags.ts`가 소유하고 `index.html`에서 제거되어 있음.
`index.html`에는 라우트와 무관한 태그(favicon, RSS `link`, `og:site_name`, `og:locale`,
`keywords`, `author`)만 남김. 양쪽에 같은 이름의 태그를 두면 중복 태그가 됨.

태그가 `<head>`에 도달하는 경로는 둘임.

- **프리렌더**: `renderHeadHtml(path)`가 만든 HTML 문자열을 `scripts/prerender.mjs`가
  `</head>` 앞에 넣음. 이때 템플릿의 정적 `<title>`은 제거됨.
- **브라우저(SPA 이동)**: `Seo.tsx`가 같은 데이터로 렌더하고 React 19가 `<head>`로 hoist함.

`Seo.tsx`는 `import.meta.env.SSR`일 때 `null`을 반환함. 서버에서도 렌더하면 hoist할 `<head>`가
없어 태그가 `<body>`에 남고 프리렌더가 넣은 head와 중복됨. JSON-LD `<script>`는 hoist 대상이
아니라 `Seo.tsx`가 렌더하지 않음 — 프리렌더가 유일한 경로임.

`react-helmet-async`는 쓰지 않음. React 19에서 passthrough가 되어 서버 상태를 채우지 않고
`<script>` 자식을 버림.

색인하면 안 되는 유효 페이지는 `seo.ts`에서 `noindex: true`로 지정함. `robots.txt`의
`Disallow`로 막지 않음 — 크롤링 자체가 막히면 noindex 지시를 읽지 못함. 없는 경로는 §3의 실제
HTTP 404 계약을 따름.

## 4-1. 동적 라우트의 SEO

`seo.ts`는 경로 문자열을 key로 쓰는 고정 매핑이라 `/post/:id`에는 쓸 수 없음. 이 분기는
`seoTags.ts`의 `resolveSeoData(path)`가 담당함 — `/post/`로 시작하면 `getPostById`로 게시물
frontmatter를 읽고, 그 외에는 `seo.ts`를 조회함. 없는 게시물 id와 매핑되지 않은 경로는 404
전용 SEO 데이터가 됨.

페이지 컴포넌트는 `<Seo path={path} />`만 넘기면 됨. 게시물 상세는
`` `${routes.POST}/${id}` ``를 넘김. 프리렌더와 브라우저가 같은 `resolveSeoData`를 쓰므로 둘의
head가 어긋날 수 없음. 동적 라우트는 `seo.ts`에 key를 추가하지 않음.

## 4-2. sitemap과 RSS 날짜·본문 계약

`sitemap.xml`의 `<lastmod>`는 실제로 관리 가능한 날짜만 제공함.

- 개별 게시물: `updated ?? date`
- `/post`: 모든 게시물의 `updated ?? date` 중 최댓값
- `/`, `/music`: 관리하는 수정일 소스가 없으므로 생략

게시물 JSON-LD의 `datePublished`는 최초 발행일 `date`를 유지하고, `updated`가 있을 때만
`dateModified`를 추가함.

`rss.xml`의 각 item은 `react-markdown`과 GFM 규칙으로 변환한 전체 본문 HTML을 `description`과
`content:encoded`에 같은 CDATA로 제공함. 원문의 HTML은 실행하지 않고 텍스트로 이스케이프하며,
`/`로 시작하는 내부 링크·이미지는 `SITE_URL` 기준 절대 URL로 바꿈. 웹 화면용 Tailwind 클래스와
코드 하이라이팅은 넣지 않음. `pubDate`는 최초 발행일, channel의 `lastBuildDate`는 가장 최근
`updated ?? date`를 씀. XML 특수문자와 CDATA 종료 문자열을 안전하게 처리하고, UTF-8 기준
10MB를 넘으면 빌드를 실패시킴.

## 5. 새 라우트 추가 체크리스트

1. `route.ts`에 경로 상수 추가
2. `routes.tsx`에 페이지 컴포넌트 등록
3. `src/pages/{Page}/{Page}.tsx` 생성, 최상위에 `<Seo path={routes.X} />` 추가
4. 정적 라우트면 `seo.ts`에 `{ title, description, noindex? }` 추가. 동적 라우트면
   `resolveSeoData`에 분기 추가 (§4-1)
5. `feed.ts`의 `STATIC_PATHS`에 경로 추가 — 프리렌더와 sitemap이 이 목록을 씀
   (`noindex: true`인 라우트도 프리렌더는 하되 sitemap에서는 자동으로 빠짐)
6. 내비게이션이 필요하면 `Header.tsx`에 `NavLink`로 추가
7. 배포 후 `curl -s https://imeantto.be/{경로} | grep '<title>'`로 응답 본문에 프리렌더된
   메타데이터가 있는지 확인하고, Google Search Console에서 URL 검사 → 색인 생성 요청

## 6. 금지 사항

- `Seo`를 거치지 않고 페이지 컴포넌트에 `<title>`이나 `<meta>`를 직접 쓰지 않음.
- 라우트별로 달라지는 태그를 `index.html`에 다시 추가하지 않음 (§4).
- 전체 경로를 `index.html`로 보내는 SPA rewrite를 추가하지 않음. 없는 URL이 200으로 응답하면
  검색 엔진이 soft 404로 판단할 수 있음.
- `sitemap.xml`과 `rss.xml`을 손으로 만들거나 커밋하지 않음.
- `Seo.tsx`의 SSR 가드(`import.meta.env.SSR`)를 제거하지 않음 (§4).
- 페이지 간 이동은 `Link`/`NavLink`만 씀. 내부 라우트에 `window.open`을 쓰면 크롤러가 링크를
  발견하지 못함. 외부 링크는 `<a href target="_blank" rel="noreferrer noopener">`를 기본으로
  하고, 버튼 UI가 필요할 때만 `window.open`을 씀.
- 문장 안에 흐르는 링크에 블록 레벨 요소를 쓰지 않음. 크롤러가 그 경계마다 문장을 끊어 검색
  스니펫이 깨짐 (`src/pages/HomePage/components/TextButton.tsx`).
