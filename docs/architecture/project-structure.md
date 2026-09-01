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
│   ├── Seo.tsx                     # 라우트별 <head> 태그 렌더링 (routing-and-seo.md 참고)
│   ├── seoTags.ts                  # 경로 → SEO 데이터/head 태그/프리렌더 HTML (순수 함수)
│   └── jsonLd.ts                   # 라우트별 JSON-LD 그래프 생성 (순수 함수)
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
├── posts/                        # 게시물 로더 (코드) + content/ 원고
│   ├── content/                   # Markdown 원고만 모아둠 (저작 규칙·이미지 정책: posts.md)
│   │   └── 0001-hello-world.md    # 파일명이 곧 게시물 id (URL: /post/{파일명})
│   ├── parsePost.ts               # frontmatter 파서 (순수 함수, Node 스크립트와 공유 가능)
│   ├── extractHeadings.ts         # 본문에서 목차용 제목 추출
│   ├── formatDate.ts              # 날짜 표시 포맷
│   ├── feed.ts                    # 프리렌더 경로 목록 + sitemap/RSS XML 생성 (순수 함수)
│   └── index.ts                   # import.meta.glob('./content/*.md')으로 전체 로드, getAllPosts/getPostById
├── routes/
│   ├── route.ts                   # 라우트 경로 상수 (ROOT/POST/POST_DETAIL/MUSIC)
│   ├── routes.tsx                 # 경로 ↔ 페이지 컴포넌트 배열 (브라우저/프리렌더 공유)
│   ├── router.tsx                 # routes.tsx를 createBrowserRouter에 등록 (브라우저 전용)
│   └── seo.ts                     # 정적 라우트별 SEO 데이터 단일 소스
├── site.ts                       # 사이트 URL/이름/저자 등 전역 상수
├── index.css                     # Tailwind 진입점 + @theme 토큰
├── entry-server.tsx              # 프리렌더 엔트리 (renderToString + head/sitemap/RSS)
└── main.tsx                      # React root(hydrate 또는 CSR), RouterProvider, Analytics 조립
```

`scripts/prerender.mjs`(저장소 루트)는 `npm run build` 마지막 단계로 실행되어 모든
라우트를 `dist/<경로>/index.html`로 굽고 `dist/sitemap.xml`, `dist/rss.xml`을 생성한다
(파이프라인 전체: [`routing-and-seo.md`](routing-and-seo.md) §1-1).
`scripts/check-post-images.mjs`는 `npm run build` 첫 단계로 실행되어 게시물 본문의
이미지 참조를 검증한다 (자세한 규칙은 [`posts.md`](posts.md) §4).

게시물 원고 자체의 작성 규칙(frontmatter, 본문 heading, 이미지 정책)은
[`posts.md`](posts.md)가 정의한다.

## 3. 컴포넌트 배치 규칙

| 컴포넌트 성격          | 위치                                  |
| ----------------------- | -------------------------------------- |
| 2개 이상 페이지가 공유   | `src/components/`                     |
| 특정 페이지에서만 사용   | `src/pages/{Page}/components/`        |
| 페이지 자체              | `src/pages/{Page}/{Page}.tsx` (같은 폴더에 `{Page}.test.tsx`) |

## 4. 게시물

게시물 원고의 위치·네이밍·frontmatter 계약·본문 heading 규칙·이미지 정책은
[`posts.md`](posts.md)가 정의한다. 이 문서는 `src/posts/` 폴더의 코드/원고 분리만
다룬다 (§2 참고).
