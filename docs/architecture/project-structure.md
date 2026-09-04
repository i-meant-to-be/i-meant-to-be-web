# Project Structure

이 문서는 현재 `src/` 구조와 파일 소유권을 정의한다. 라우팅과 SEO 연동은
[`routing-and-seo.md`](routing-and-seo.md), 스타일 토큰은 [`styling.md`](styling.md),
컴포넌트 코드 작성 규칙은 [`react-conventions.md`](react-conventions.md)를 기준으로
해석한다.

## 1. 해석 원칙

- 이 문서는 현재 실제 구조만 설명한다. 아직 만들어지지 않은 목표 구조를 앞서 정의하지 않는다.
- 폴더가 비어 있거나 최소 구현이어도 그 자체를 문서 불일치로 보지 않는다.
- 구조가 실제로 바뀌면(파일 추가/이동) 이 문서를 함께 갱신한다.

## 2. 디렉터리 구조

```text
src/
├── components/                  # 여러 페이지가 공유하는 컴포넌트 (배치 규칙: §3)
│   ├── Layout.tsx                 # Header + children + Footer 조립, 공통 여백/배경
│   ├── Header.tsx                 # 상단 네비게이션 (NavLink 기반)
│   ├── HeaderButton.tsx           # Header 내부 버튼 UI (선택 상태 스타일)
│   ├── Footer.tsx                  # 하단 외부 링크(GitHub, Instagram)
│   ├── BorderButton.tsx            # 테두리 버튼 UI (색상 prop)
│   ├── TagList.tsx                 # 상위 분류 배지 + 태그 pill 목록 (posts.md §2)
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
│   │       ├── PostListItem.tsx   # 목록 항목 UI
│   │       └── CategoryTab.tsx    # 철학/개발 상위 분류 필터 탭
│   ├── PostDetailPage/
│   │   ├── PostDetailPage.tsx     # 게시글 상세 (/post/:id, posts/getPostById 기반)
│   │   └── components/
│   │       ├── MarkdownContent.tsx  # react-markdown 렌더링 + 디자인 토큰 매핑
│   │       ├── highlight.css        # rehype-highlight 전용 CSS (styling.md §5 예외)
│   │       ├── TableOfContents.tsx  # extractHeadings 결과를 목차로 렌더
│   │       ├── PostListSection.tsx  # 하단 전체 게시글 페이지네이션 목록
│   │       ├── ShareButton.tsx      # 현재 URL 클립보드 복사
│   │       └── BackToListButton.tsx # 목록으로 돌아가기
│   ├── MusicPage/
│   │   └── MusicPage.tsx
│   └── NotFoundPage/
│       └── NotFoundPage.tsx       # 알 수 없는 경로와 삭제된 게시물의 공통 오류 화면
├── posts/                        # 게시물 로더 (코드) + content/ 원고
│   ├── content/                   # Markdown 원고만 모아둠 (저작 규칙·이미지 정책: posts.md)
│   │   └── 0002-how-to-....md      # 파일명이 곧 게시물 id (URL: /post/{파일명})
│   ├── parsePost.ts               # frontmatter 파서 (순수 함수, Node 스크립트와 공유 가능)
│   ├── extractHeadings.ts         # 본문에서 목차용 제목 추출
│   ├── formatDate.ts              # 날짜 표시 포맷
│   ├── feed.ts                    # 프리렌더 경로 + sitemap + 전체 본문 RSS 생성
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
라우트를 `dist/<경로>/index.html`로 굽고 `dist/404.html`, `dist/sitemap.xml`,
`dist/rss.xml`을 생성한다
(파이프라인 전체: [`routing-and-seo.md`](routing-and-seo.md) §1-1).
`scripts/check-post-images.mjs`는 `npm run build` 첫 단계로 실행되어 게시물 본문의
이미지 참조를 검증한다 (자세한 규칙은 [`posts.md`](posts.md) §4).

게시물 원고 자체의 작성 규칙(frontmatter, 본문 heading, 이미지 정책)은
[`posts.md`](posts.md)가 정의한다.

## 3. 컴포넌트 · 훅 · 타입 배치 규칙

페이지 파일에는 그 페이지의 조립만 남긴다. 부분 컴포넌트, 훅, 타입은 성격에 따라 아래
위치로 분리한다.

| 대상          | 특정 페이지에서만 사용         | 2개 이상 페이지가 공유 |
| ------------- | ------------------------------ | ---------------------- |
| 부분 컴포넌트 | `src/pages/{Page}/components/` | `src/components/`      |
| 훅            | `src/pages/{Page}/hooks/`      | `src/hooks/`           |
| 타입          | `src/pages/{Page}/types/`      | `src/types/`           |

- 페이지 자체는 `src/pages/{Page}/{Page}.tsx`, 테스트는 같은 폴더의 `{Page}.test.tsx`.
- 한 컴포넌트에서만 쓰는 props 인터페이스는 `types/`로 빼지 않고 그 컴포넌트 파일 안에
  둔다 (`react-conventions.md` §1). `types/`는 페이지 안의 **여러 파일이 공유하는** 타입을
  위한 자리다.
- 페이지 전용이던 것이 두 번째 페이지에서 쓰이는 순간 `src/` 아래 공용 위치로 올린다.
  미리 공용으로 만들어 두지 않는다.
- 위 표의 폴더는 **필요할 때 만든다.** 아직 없는 폴더가 §2 트리에 보이지 않는 것은 문서
  불일치가 아니다 (§1). 폴더를 실제로 추가하면 §2 트리도 함께 갱신한다.
- 게시물 로더(`src/posts/`), 라우팅(`src/routes/`)처럼 이미 자기 폴더를 가진 도메인 코드는
  이 표의 대상이 아니다. 해당 폴더 안에 그대로 둔다.

## 4. 게시물

게시물 원고의 위치·네이밍·frontmatter 계약·본문 heading 규칙·이미지 정책은
[`posts.md`](posts.md)가 정의한다. 이 문서는 `src/posts/` 폴더의 코드/원고 분리만
다룬다 (§2 참고).
