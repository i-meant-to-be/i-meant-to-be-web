# Architecture Guide

i-meant-to-be-web(imeanttobe) 아키텍처의 단일 진입점. Vite, React 19, react-router-dom,
Tailwind CSS 4로 구성하고 Vercel에 정적 SPA로 배포함.

세부 계약은 `docs/architecture/`의 주제별 문서가 나눠 소유함. 이 문서를 먼저 읽고 §4의
작업별 표가 지정한 문서를 추가로 읽음.

## 1. 문서 권위

1. 이 문서 `docs/ARCHITECTURE.md`
2. 이 문서가 편입한 `docs/architecture/*.md`
3. [`AGENTS.md`](../AGENTS.md) — 에이전트 실행 절차와 검증 규칙
4. `docs/workflows/*.md` — 절차 문서
5. `README.md`

`docs/architecture/*.md`는 참고 자료가 아니라 이 문서가 편입한 상세 계약임. 상위 문서와
충돌하면 상위 문서가 우선함. 세부 문서끼리 충돌하면 임의로 해석하지 말고 문서 오류로 보고함.

## 2. 기술 개요

| 항목       | 기준                                                              |
| ---------- | ----------------------------------------------------------------- |
| Build Tool | Vite                                                              |
| UI         | React 19                                                          |
| Routing    | react-router-dom (`createBrowserRouter`, CSR + 빌드타임 프리렌더) |
| Styling    | Tailwind CSS 4 (`@theme` 토큰)                                    |
| Test       | Vitest + Testing Library                                          |
| Hosting    | Vercel 정적 호스팅 (라우트별 프리렌더 HTML + 루트 `404.html`)     |
| Analytics  | `@vercel/analytics`                                               |
| SEO        | React 19 metadata hoisting + `src/components/seoTags.ts`          |

`.env`의 실제 값은 커밋하지 않음. `.env`는 `.gitignore`에 있어야 함.

## 3. 세부 문서

| 문서                                                        | 소유하는 계약                                 |
| ----------------------------------------------------------- | --------------------------------------------- |
| [`project-structure.md`](architecture/project-structure.md) | 폴더 구조, 컴포넌트·훅·타입 배치              |
| [`react-conventions.md`](architecture/react-conventions.md) | 컴포넌트 선언, 본문 순서, 핸들러, `useEffect` |
| [`styling.md`](architecture/styling.md)                     | 컬러 토큰, 클래스 작성, 반응형(`md:`)         |
| [`routing-and-seo.md`](architecture/routing-and-seo.md)     | 라우트·SEO·프리렌더·404·sitemap·RSS 연동      |
| [`posts.md`](architecture/posts.md)                         | 게시물 저작 계약 — frontmatter, 본문, 이미지  |
| [`docs.md`](architecture/docs.md)                           | 문서 작성 규칙 — 어미, 표현, 문서별 고유 책임 |

## 4. 작업별 필수 읽기

모든 코드 변경 전에 이 문서를 읽고, 아래 해당 문서를 추가로 읽음.

| 작업                          | 필수 세부 문서                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| 새 페이지·라우트 추가         | `project-structure.md`, `routing-and-seo.md`, `react-conventions.md` |
| 컴포넌트·훅·타입 작성         | `react-conventions.md`, `project-structure.md`, `styling.md`         |
| 페이지 title/description 변경 | `routing-and-seo.md`                                                 |
| 게시물 추가·수정              | `posts.md` (외부 원고 이관은 `docs/workflows/add-new-post.md`)       |
| 디자인 토큰 변경              | `styling.md`                                                         |
| 문서 작성·수정                | `docs.md`                                                            |
| 커밋 또는 PR 생성             | `docs/workflows/pull-request.md`                                     |
