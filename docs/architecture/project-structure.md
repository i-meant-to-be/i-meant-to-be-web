# Project Structure

이 문서는 현재 `src/` 구조와 파일 소유권을 정의한다. 라우팅과 SEO 연동은
[`routing-and-seo.md`](routing-and-seo.md), 스타일 토큰은 [`styling.md`](styling.md)를
기준으로 해석한다.

## 1. 해석 원칙

- 이 문서는 현재 실제 구조만 설명한다. 아직 만들어지지 않은 목표 구조를 앞서 정의하지 않는다.
- 폴더가 비어 있거나 최소 구현이어도 그 자체를 문서 불일치로 보지 않는다.
- 구조가 실제로 바뀌면(파일 추가/이동) 이 문서를 함께 갱신한다.

## 2. 디렉터리 구조

```text
src/
├── components/                  # 여러 페이지가 공유하는 컴포넌트
│   ├── Layout.tsx                 # Header + children + Footer 조립, 공통 여백/배경
│   ├── Header.tsx                 # 상단 네비게이션 (NavLink 기반)
│   ├── HeaderButton.tsx           # Header 내부 버튼 UI (선택 상태 스타일)
│   ├── Footer.tsx                  # 하단 외부 링크(GitHub, Instagram)
│   └── Seo.tsx                     # 라우트별 <head> 태그 렌더링 (routing-and-seo.md 참고)
├── pages/                        # 라우트 1개 = 페이지 폴더 1개
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   └── components/            # HomePage 전용 컴포넌트
│   │       └── TextButton.tsx
│   ├── PostPage/
│   │   ├── PostPage.tsx           # 게시글 목록 (posts/getAllPosts 기반)
│   │   └── components/
│   │       └── PostListItem.tsx   # 목록 항목 UI
│   ├── PostDetailPage/
│   │   ├── PostDetailPage.tsx     # 게시글 상세 (/post/:id, posts/getPostById 기반)
│   │   └── components/
│   │       └── MarkdownContent.tsx  # react-markdown 렌더링 + 디자인 토큰 매핑
│   └── MusicPage/
│       └── MusicPage.tsx
├── posts/                        # Markdown 원고 + 로더
│   ├── 0001-hello-world.md        # 파일명이 곧 게시물 id (URL: /post/{파일명})
│   ├── parsePost.ts               # frontmatter 파서 (순수 함수, Node 스크립트와 공유 가능)
│   └── index.ts                   # import.meta.glob으로 전체 로드, getAllPosts/getPostById
├── routes/
│   ├── route.ts                   # 라우트 경로 상수 (ROOT/POST/POST_DETAIL/MUSIC)
│   ├── router.tsx                 # createBrowserRouter 등록
│   └── seo.ts                     # 정적 라우트별 SEO 데이터 단일 소스
├── index.css                     # Tailwind 진입점 + @theme 토큰
└── main.tsx                      # React root, HelmetProvider, RouterProvider, Analytics 조립
```

`scripts/generate-sitemap.mjs`(저장소 루트)는 `npm run build`의 일부로 실행되어
`public/sitemap.xml`을 정적 라우트 + `draft`가 아닌 게시물 목록으로부터 재생성한다.

## 3. 컴포넌트 배치 규칙

| 컴포넌트 성격          | 위치                                  |
| ----------------------- | -------------------------------------- |
| 2개 이상 페이지가 공유   | `src/components/`                     |
| 특정 페이지에서만 사용   | `src/pages/{Page}/components/`        |
| 페이지 자체              | `src/pages/{Page}/{Page}.tsx` (같은 폴더에 `{Page}.test.tsx`) |

## 4. 게시물 작성 규칙

- 파일명 형식: `{4자리 순번}-{영문 슬러그}.md` (예: `0001-hello-world.md`). 파일명(확장자 제외)이
  그대로 URL id(`/post/{id}`)가 된다.
- frontmatter 필수 필드: `title`, `date`(`YYYY-MM-DD`). 선택 필드: `description`(없으면 본문 첫
  문단에서 자동 발췌), `tags`(`[태그1, 태그2]` 형식), `draft`(`true`면 목록/sitemap/색인에서 제외).
- 본문에 frontmatter의 `title`과 같은 내용의 최상위 제목(`# ...`)을 다시 쓰지 않는다 — 페이지가
  `title`로 자체 `<h1>`을 렌더링하므로 중복된다. 본문은 `##`부터 시작하거나 바로 문단으로
  시작한다.
- `parsePost.ts`/`index.ts`의 로딩 로직은 `docs/architecture/routing-and-seo.md` §3-1(동적 라우트
  SEO)과 함께 해석한다.
