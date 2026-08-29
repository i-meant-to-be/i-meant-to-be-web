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
| Routing   | react-router-dom (`createBrowserRouter`, CSR)           |
| Styling   | Tailwind CSS 4 (`@theme` 토큰)                          |
| Test      | Vitest + Testing Library                                |
| Hosting   | Vercel 정적 SPA (`vercel.json` rewrite로 서브라우트 처리) |
| Analytics | `@vercel/analytics`                                     |
| SEO       | `react-helmet-async` + `src/routes/seo.ts` 단일 소스     |

## 3. 핵심 불변조건

- SEO 문구(title/description)는 `src/routes/seo.ts`에만 쓴다. 페이지 컴포넌트에 직접
  문자열로 쓰지 않는다.
- 새 라우트를 추가하면 `route.ts` + `router.tsx` + `seo.ts`를 함께 갱신하고, 색인 대상인
  경우에만 `sitemap.xml`도 갱신한다 (`routing-and-seo.md` §4 체크리스트 참고).
- `vercel.json`의 SPA rewrite는 삭제하지 않는다 — 제거하면 `/` 이외의 모든 라우트가 실제
  404를 반환한다.
- `.env`의 실제 값(URL 등)은 커밋하지 않는다. `.env`는 `.gitignore`에 있어야 한다.
- 페이지 간 이동은 `react-router-dom`의 `Link`/`NavLink`만 쓴다. 외부 링크에만
  `window.open`을 쓴다 — 내부 라우트에 `window.open`을 쓰면 크롤러가 링크를 발견하지
  못한다.
- 공용 컴포넌트는 `src/components/`, 페이지 전용 컴포넌트는
  `src/pages/{Page}/components/`에 둔다.

세부 금지사항과 예외 조건은 관련 주제 문서에서 확인한다. 이 요약만으로 세부 문서를 대체하지
않는다.

## 4. 세부 문서

| 문서                                                          | 목적                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| [`project-structure.md`](architecture/project-structure.md)     | 폴더 구조, 페이지/컴포넌트 소유권, 아직 연결되지 않은 것        |
| [`posts.md`](architecture/posts.md)                             | 게시물 저작 계약 — frontmatter, 본문 heading, 이미지 정책        |
| [`routing-and-seo.md`](architecture/routing-and-seo.md)         | route.ts / seo.ts / Seo.tsx / vercel.json / sitemap.xml 연동 계약 |
| [`styling.md`](architecture/styling.md)                         | Tailwind 컬러 토큰, 클래스 작성 규칙                              |

## 5. 작업별 필수 읽기

모든 코드 변경 전에 이 문서를 읽는다. 다음 표에 해당하는 세부 문서를 추가로 읽는다.

| 작업                              | 필수 세부 문서                          |
| --------------------------------- | ---------------------------------------- |
| 새 페이지/라우트 추가             | `project-structure.md`, `routing-and-seo.md` |
| 게시물 추가 또는 수정             | `project-structure.md`, `posts.md` (외부 원고 이관은 `docs/workflows/add-new-post.md`) |
| 페이지 title/description 변경     | `routing-and-seo.md`                     |
| 공용 컴포넌트 추가 또는 변경      | `project-structure.md`, `styling.md`     |
| 색상, 폰트 등 디자인 토큰 변경    | `styling.md`                             |
| 커밋 또는 PR 생성                 | `docs/workflows/pull-request.md`         |

## 6. 현재 구조와 목표 구조

이 프로젝트는 페이지 3개짜리 소규모 사이트다. `project-structure.md`는 현재 실제 구조만
설명하며, 별도의 "승인된 목표 구조"를 앞서 정의하지 않는다. 구조가 실제로 커지는 시점에
문서를 갱신한다.
