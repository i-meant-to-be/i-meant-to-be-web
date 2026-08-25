# Routing and SEO

이 문서는 라우트 정의부터 실제 배포 환경에서 색인되는 과정까지, 여러 파일이 어떻게 맞물리는지
정의한다. [`project-structure.md`](project-structure.md)의 폴더 배치 규칙을 함께 적용한다.

## 1. 소유권

| 파일                       | 책임                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `src/routes/route.ts`       | 라우트 경로 상수의 단일 소스 (`ROOT`, `POST`, `MUSIC`)                                |
| `src/routes/router.tsx`     | `createBrowserRouter`에 경로 ↔ 페이지 컴포넌트 등록                                  |
| `src/routes/seo.ts`         | 라우트 경로별 `{ title, description, noindex }`의 단일 소스                          |
| `src/components/Seo.tsx`    | `seo.ts`를 조회해 `react-helmet-async`로 title/description/robots/canonical/OG 렌더링 |
| `vercel.json`               | Vercel에서 `/` 이외의 모든 경로를 `index.html`로 rewrite (SPA fallback)              |
| `public/robots.txt`         | 크롤링 허용 범위와 sitemap 위치                                                       |
| `public/sitemap.xml`        | 색인 대상 URL 목록 (noindex 페이지는 제외)                                            |

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

## 4. 새 라우트 추가 체크리스트

1. `route.ts`에 경로 상수 추가
2. `router.tsx`에 페이지 컴포넌트 등록
3. `src/pages/{Page}/{Page}.tsx` 생성, 최상위에 `<Seo path={routes.X} />` 추가
4. `seo.ts`에 해당 경로의 `{ title, description, noindex? }` 추가
5. 완성된 콘텐츠라면 `public/sitemap.xml`에 `<url><loc>` 추가 (완성 전이면 `noindex: true`만
   두고 sitemap에는 넣지 않는다)
6. `Header.tsx`에 내비게이션이 필요하면 `NavLink`로 추가 (내부 라우트는 항상
   `Link`/`NavLink`만 쓴다 — `window.open`은 외부 링크 전용. `Footer.tsx`/`HomePage.tsx`의
   외부 링크 버튼 참고)
7. 배포 후 `curl -I`로 200 확인, Google Search Console에서 URL 검사 → 색인 생성 요청

## 5. 금지 사항

- `seo.ts`를 거치지 않고 페이지 컴포넌트에 `<title>`이나 `<meta>`를 직접 쓰지 않는다.
- `index.html`에 라우트별로 달라지는 태그(title/description/canonical/robots/og:title/
  og:description/og:url)를 다시 추가하지 않는다 — `Seo.tsx`와 중복된다.
- `vercel.json`의 rewrite 규칙을 제거하거나, 특정 정적 파일만 예외 처리하려고 규칙을 좁히지
  않는다 (Vercel은 rewrite 전에 실제 정적 파일을 먼저 확인하므로 현재 규칙으로도
  `favicons/`, `assets/`는 이미 안전하다).
- noindex 상태인 페이지를 `sitemap.xml`에 넣지 않는다.
