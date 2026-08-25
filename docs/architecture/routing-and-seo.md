# Routing and SEO

이 문서는 라우트 정의부터 실제 배포 환경에서 색인되는 과정까지, 여러 파일이 어떻게 맞물리는지
정의한다. [`project-structure.md`](project-structure.md)의 폴더 배치 규칙을 함께 적용한다.

## 1. 소유권

| 파일                       | 책임                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `src/routes/route.ts`       | 라우트 경로 상수의 단일 소스 (`ROOT`, `POST`, `POST_DETAIL`, `MUSIC`)                 |
| `src/routes/router.tsx`     | `createBrowserRouter`에 경로 ↔ 페이지 컴포넌트 등록                                  |
| `src/routes/seo.ts`         | 정적 라우트별 `{ title, description, noindex }`의 단일 소스                          |
| `src/components/Seo.tsx`    | `seo.ts`를 조회해 `react-helmet-async`로 title/description/robots/canonical/OG 렌더링. `override` prop이 있으면 `seo.ts` 조회 대신 이를 사용 (§3-1 참고) |
| `vercel.json`               | Vercel에서 `/` 이외의 모든 경로를 `index.html`로 rewrite (SPA fallback)              |
| `public/robots.txt`         | 크롤링 허용 범위와 sitemap 위치                                                       |
| `public/sitemap.xml`        | **빌드타임에 자동 생성됨** (`scripts/generate-sitemap.mjs`, `npm run build`의 일부). 색인 대상 URL 목록 (noindex 페이지는 제외). 수동 편집 금지 — 직접 고친 내용은 다음 빌드에서 덮어써진다 |

## 2. 왜 vercel.json이 필요한가

이 프로젝트는 `createBrowserRouter`(History API 기반 CSR)를 쓴다. 브라우저에서 `Link` 클릭으로
이동할 때는 정상 동작하지만, `/music`처럼 파일로 존재하지 않는 경로에 직접 접근하거나
새로고침하면 Vercel이 정적 파일을 찾지 못해 실제 404를 반환한다. `vercel.json`의 rewrite가
이를 `index.html`로 돌려보내 react-router가 클라이언트에서 라우팅을 이어받게 한다.

**검증 방법**: `curl -I https://imeantto.be/{경로}`로 실제 배포에서 200이 오는지 직접
확인한다. 로컬 `vite preview`는 자체 SPA fallback을 갖고 있어 이 문제를 재현하지 못한다.

## 3. Seo.tsx와 noindex

`react-helmet-async`는 자신이 렌더링한 태그만 관리한다. `index.html`에 정적으로 박아둔
태그와 `Helmet`이 추가하는 태그가 같은 이름을 가지면 **중복 태그**가 생긴다. 그래서
라우트별로 달라지는 태그(`title`, `description`, `robots`, `canonical`, `og:title`,
`og:description`, `og:url`)는 `index.html`에서 제거되어 있고, 전부 `Seo.tsx`가 소유한다.
`index.html`에는 라우트와 무관한 태그(favicon, `og:type`, `og:site_name`, `og:locale`,
`keywords`)만 남긴다.

완성되지 않은 페이지(`PostPage`처럼 placeholder 콘텐츠만 있는 경우)는 `seo.ts`에서
`noindex: true`를 지정한다. `noindex`는 `robots.txt`의 `Disallow`가 아니라 `Seo.tsx`의
`<meta name="robots">`로 처리한다 — `robots.txt`로 막으면 Google이 크롤링 자체를 못 해서
noindex 지시를 읽지 못하고, 외부 신호만으로 그 URL을 색인해버릴 수 있다.

## 3-1. 동적 라우트의 SEO — `Seo`의 `override`

`seo.ts`는 라우트 경로 문자열을 key로 쓰는 고정 매핑이라 `/post/:id`처럼 콘텐츠에 따라
제목/설명이 달라지는 라우트에는 쓸 수 없다. 이런 경우 `Seo`에 `override={{ title, description,
noindex? }}`를 넘기면 `seo.ts` 조회를 건너뛰고 이 값을 그대로 쓴다. `path` prop은 이 경우에도
canonical/OG URL 생성을 위해 실제 접근 경로(예: `` `${routes.POST}/${id}` ``)를 넘긴다.

예시는 `src/pages/PostDetailPage/PostDetailPage.tsx` 참고 — 게시물의 frontmatter(`title`,
`description`)를 override로 넘기고, `draft: true`인 게시물은 `noindex: true`로 넘긴다. 존재하지
않는 id는 `noindex: true` override와 함께 안내 문구만 렌더링한다 (별도 404 라우트는 없음).

이 패턴을 쓰는 라우트는 `seo.ts`에 해당 경로 key를 추가하지 않는다 — `override`가 항상 필수이기
때문이다.

## 4. 새 라우트 추가 체크리스트

1. `route.ts`에 경로 상수 추가
2. `router.tsx`에 페이지 컴포넌트 등록
3. `src/pages/{Page}/{Page}.tsx` 생성, 최상위에 `<Seo path={routes.X} />` 추가 (콘텐츠에 따라
   제목/설명이 달라지는 동적 라우트라면 `override`도 함께 — §3-1 참고)
4. 정적 라우트라면 `seo.ts`에 해당 경로의 `{ title, description, noindex? }` 추가 (동적 라우트는
   이 단계를 건너뛴다)
5. `public/sitemap.xml`은 `npm run build` 시 `scripts/generate-sitemap.mjs`가 자동 생성한다 —
   정적 라우트를 새로 추가했다면 이 스크립트의 `STATIC_PATHS`에도 추가한다 (완성 전 라우트는
   `noindex: true`만 두고 `STATIC_PATHS`에는 넣지 않는다)
6. `Header.tsx`에 내비게이션이 필요하면 `NavLink`로 추가 (내부 라우트는 항상
   `Link`/`NavLink`만 쓴다 — `window.open`은 외부 링크 전용. `Footer.tsx`/`HomePage.tsx`의
   외부 링크 버튼 참고)
7. 배포 후 `curl -I`로 200 확인, Google Search Console에서 URL 검사 → 색인 생성 요청

## 5. 금지 사항

- `Seo`(`seo.ts` 조회 또는 `override` prop)를 거치지 않고 페이지 컴포넌트에 `<title>`이나
  `<meta>`를 직접 쓰지 않는다.
- `index.html`에 라우트별로 달라지는 태그(title/description/canonical/robots/og:title/
  og:description/og:url)를 다시 추가하지 않는다 — `Seo.tsx`와 중복된다.
- `vercel.json`의 rewrite 규칙을 제거하거나, 특정 정적 파일만 예외 처리하려고 규칙을 좁히지
  않는다 (Vercel은 rewrite 전에 실제 정적 파일을 먼저 확인하므로 현재 규칙으로도
  `favicons/`, `assets/`는 이미 안전하다).
- noindex 상태인 페이지를 `scripts/generate-sitemap.mjs`의 대상에 넣지 않는다 (게시물은
  `draft: true`로 표시하면 스크립트가 자동으로 제외한다).
- `public/sitemap.xml`을 직접 수정하지 않는다 — 빌드 시 자동 재생성되어 덮어써진다.
