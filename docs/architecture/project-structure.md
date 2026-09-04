# Project Structure

`src/` 폴더 구조와 파일 배치 규칙.

## 1. 해석 원칙

- 현재 실제 구조만 설명함. 만들어지지 않은 목표 구조를 앞서 정의하지 않음.
- 폴더가 비어 있거나 최소 구현이어도 문서 불일치가 아님.
- 파일을 추가하거나 옮기면 이 문서를 함께 갱신함.

## 2. 디렉터리 구조

각 파일의 책임은 주제 문서가 소유함 — 라우팅·SEO 계열은
[`routing-and-seo.md`](routing-and-seo.md) §1, 게시물 원고는 [`posts.md`](posts.md).

```text
src/
├── components/                  # 여러 페이지가 공유하는 컴포넌트
│   ├── Layout.tsx                 # Header + children + Footer 조립
│   ├── Header.tsx
│   ├── HeaderButton.tsx
│   ├── Footer.tsx
│   ├── BorderButton.tsx
│   ├── TagList.tsx                # 상위 분류 배지 + 태그 pill
│   ├── Seo.tsx
│   ├── seoTags.ts
│   └── jsonLd.ts
├── pages/                        # 라우트 1개 = 페이지 폴더 1개
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   └── components/
│   │       └── TextButton.tsx
│   ├── PostPage/
│   │   ├── PostPage.tsx
│   │   └── components/
│   │       ├── PostListItem.tsx
│   │       └── CategoryTab.tsx
│   ├── PostDetailPage/
│   │   ├── PostDetailPage.tsx
│   │   └── components/
│   │       ├── MarkdownContent.tsx
│   │       ├── highlight.css
│   │       ├── TableOfContents.tsx
│   │       ├── PostListSection.tsx
│   │       ├── ShareButton.tsx
│   │       └── BackToListButton.tsx
│   ├── MusicPage/
│   │   └── MusicPage.tsx
│   └── NotFoundPage/
│       └── NotFoundPage.tsx
├── posts/                        # 게시물 로더 + content/ 원고
│   ├── content/                   # 원고 `.md`만 모아둠
│   ├── parsePost.ts               # frontmatter 파서
│   ├── extractHeadings.ts         # 목차용 제목 추출
│   ├── formatDate.ts
│   ├── feed.ts
│   └── index.ts                   # 전체 로드, getAllPosts/getPostById
├── routes/
│   ├── route.ts
│   ├── routes.tsx
│   ├── router.tsx
│   └── seo.ts
├── site.ts                       # 사이트 URL/이름/저자 상수
├── index.css                     # Tailwind 진입점 + @theme 토큰
├── entry-server.tsx
└── main.tsx                      # React root, RouterProvider, Analytics 조립
```

## 3. 컴포넌트 · 훅 · 타입 배치 규칙

페이지 파일에는 그 페이지의 조립만 남김. 부분 컴포넌트, 훅, 타입은 아래 위치로 분리함.

| 대상          | 특정 페이지에서만 사용         | 2개 이상 페이지가 공유 |
| ------------- | ------------------------------ | ---------------------- |
| 부분 컴포넌트 | `src/pages/{Page}/components/` | `src/components/`      |
| 훅            | `src/pages/{Page}/hooks/`      | `src/hooks/`           |
| 타입          | `src/pages/{Page}/types/`      | `src/types/`           |

- 페이지 자체는 `src/pages/{Page}/{Page}.tsx`, 테스트는 같은 폴더의 `{Page}.test.tsx`.
- 한 컴포넌트에서만 쓰는 props 인터페이스는 그 컴포넌트 파일 안에 둠. `types/`는 페이지 안의
  **여러 파일이 공유하는** 타입 자리임.
- 페이지 전용이던 것이 두 번째 페이지에서 쓰이는 순간 공용 위치로 올림. 미리 공용으로 만들어
  두지 않음.
- 표의 폴더는 필요할 때 만듦. 없는 폴더가 §2 트리에 보이지 않는 것은 문서 불일치가 아님(§1).
- `src/posts/`, `src/routes/`처럼 이미 자기 폴더를 가진 도메인 코드는 이 표의 대상이 아님.
