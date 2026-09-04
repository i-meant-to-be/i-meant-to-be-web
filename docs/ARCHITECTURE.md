# Architecture Guide

이 문서는 i-meant-to-be-web(imeanttobe) 프로젝트 아키텍처의 단일 진입점이다. 프로젝트는 Vite,
React 19, react-router-dom, Tailwind CSS 4를 기준으로 구성하며 Vercel에 정적 SPA로 배포한다.

세부 계약은 `docs/architecture/`의 주제별 문서에 나누어 관리한다. 작업자는 이 문서를 먼저 읽고
작업별 라우팅 표에 지정된 세부 문서를 추가로 읽어야 한다.

## 1. 문서 권위

문서는 다음 순서로 해석한다.

1. 이 문서 `docs/ARCHITECTURE.md`
2. 이 문서가 편입한 `docs/architecture/*.md`
3. [`AGENTS.md`](../AGENTS.md) (AI 에이전트 실행 진입점 — 절차와 검증 규칙)
4. `docs/workflows/*.md` (절차 문서 — 정책이 충돌하면 위 문서가 우선)
5. `README.md`

`docs/architecture/*.md`는 선택적 참고 자료가 아니라 이 문서가 편입한 상세 계약이다. 상위
문서와 충돌하면 상위 문서가 우선한다. 세부 문서끼리 충돌하면 임의로 해석하지 말고 문서
오류로 보고한다.

## 2. 기술 개요

| 항목      | 기준                                                   |
| --------- | ------------------------------------------------------ |
| Build Tool | Vite                                                   |
| UI        | React 19                                                |
| Routing   | react-router-dom (`createBrowserRouter`, CSR + 빌드타임 프리렌더) |
| Styling   | Tailwind CSS 4 (`@theme` 토큰)                          |
| Test      | Vitest + Testing Library                                |
| Hosting   | Vercel 정적 호스팅 (유효 라우트별 프리렌더 HTML + 루트 `404.html`) |
| Analytics | `@vercel/analytics`                                     |
| SEO       | React 19 네이티브 metadata hoisting + `src/components/seoTags.ts` (`seo.ts` / 게시물 frontmatter 조회) |

## 3. 핵심 불변조건

- SEO 문구(title/description)는 `src/routes/seo.ts`에만 쓴다. 페이지 컴포넌트에 직접
  문자열로 쓰지 않는다.
- 새 라우트를 추가하면 `route.ts` + `routes.tsx` + `src/posts/feed.ts`의 `STATIC_PATHS`를
  함께 갱신한다. `seo.ts`는 **정적 라우트에만** 추가한다 — 동적 라우트의 title/description은
  `seoTags.ts`의 `resolveSeoData`가 게시물 frontmatter에서 읽는다
  (`routing-and-seo.md` §5 체크리스트 참고).
- `sitemap.xml`과 `rss.xml`은 `npm run build`가 `dist/`에 생성하는 산출물이다. 손으로
  만들거나 커밋하지 않는다.
- 모든 공개 URL은 빌드 시 정적 HTML로 생성한다. 존재하지 않는 경로를 `index.html`로
  rewrite하지 않고 루트 `404.html` 본문과 실제 HTTP 404로 응답한다.
- `.env`의 실제 값(URL 등)은 커밋하지 않는다. `.env`는 `.gitignore`에 있어야 한다.
- 페이지 간 이동은 `react-router-dom`의 `Link`/`NavLink`만 쓴다. 내부 라우트에
  `window.open`을 쓰면 크롤러가 링크를 발견하지 못한다.
- 외부 링크는 `<a href target="_blank" rel="noreferrer noopener">`를 기본으로 하고,
  버튼 UI가 필요한 경우에만 `window.open`을 쓴다. 문장 안에 흐르는 링크에는 블록 레벨
  요소를 쓰지 않는다 — 크롤러가 문장을 끊어 검색 스니펫이 깨진다.
- 공용 컴포넌트·훅·타입은 `src/{components,hooks,types}/`, 페이지 전용은
  `src/pages/{Page}/{components,hooks,types}/`에 둔다
  (`project-structure.md` §3).
- React 컴포넌트는 `export default function Name() {}` 함수 선언형으로 쓴다. JSX 안에
  인라인 함수를 두지 않고 `useEffect` 콜백은 기명 함수로 쓴다
  (`react-conventions.md` §1·§3·§4).
- 스타일은 모바일이 기본이고 데스크톱이 `md:`다. 기본 클래스에 데스크톱 값을 쓰지 않는다
  (`styling.md` §4).

세부 금지사항과 예외 조건은 관련 주제 문서에서 확인한다. 이 요약만으로 세부 문서를 대체하지
않는다.

## 4. 세부 문서

| 문서                                                          | 목적                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| [`project-structure.md`](architecture/project-structure.md)     | 폴더 구조, 페이지/컴포넌트 소유권, 아직 연결되지 않은 것        |
| [`posts.md`](architecture/posts.md)                             | 게시물 저작 계약 — frontmatter, 본문 heading, 이미지 정책        |
| [`routing-and-seo.md`](architecture/routing-and-seo.md)         | route.ts / seo.ts / Seo.tsx / 프리렌더 / 404 / sitemap·RSS 연동 계약 |
| [`styling.md`](architecture/styling.md)                         | Tailwind 컬러 토큰, 클래스 작성 규칙, 반응형(`md:`) 규칙            |
| [`react-conventions.md`](architecture/react-conventions.md)     | React 코드 컨벤션 — 컴포넌트 선언, 본문 순서, 핸들러, `useEffect`   |

## 5. 작업별 필수 읽기

모든 코드 변경 전에 이 문서를 읽는다. 다음 표에 해당하는 세부 문서를 추가로 읽는다.

| 작업                              | 필수 세부 문서                          |
| --------------------------------- | ---------------------------------------- |
| 새 페이지/라우트 추가             | `project-structure.md`, `routing-and-seo.md`, `react-conventions.md` |
| 게시물 추가 또는 수정             | `project-structure.md`, `posts.md` (외부 원고 이관은 `docs/workflows/add-new-post.md`) |
| 페이지 title/description 변경     | `routing-and-seo.md`                     |
| 공용 컴포넌트 추가 또는 변경      | `project-structure.md`, `styling.md`, `react-conventions.md` |
| 컴포넌트·훅·타입 코드 작성 또는 리팩터링 | `react-conventions.md`, `project-structure.md`, `styling.md` |
| 색상, 폰트 등 디자인 토큰 변경    | `styling.md`                             |
| 커밋 또는 PR 생성                 | `docs/workflows/pull-request.md`         |

## 6. 현재 구조와 목표 구조

이 프로젝트는 공개 페이지 3개와 공통 오류 페이지 1개로 이루어진 소규모 사이트다.
`project-structure.md`는 현재 실제 구조만 설명하며, 별도의 "승인된 목표 구조"를 앞서
정의하지 않는다. 구조가 실제로 커지는 시점에 문서를 갱신한다.
