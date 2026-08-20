# 블로그 구현 계획 (방안 1 · 빌드타임 정적 번들)

## 1. 요약

`src/posts/{tech,life}/*.md` 에 frontmatter를 가진 마크다운을 두고, Vite의 `import.meta.glob`으로
**빌드 시점에** 전부 번들에 포함시킵니다. 런타임 네트워크 요청과 서버가 모두 없는 구조입니다.

헤더 탭은 **홈 / 기술 / 일상 / 음악** 4개로 확장되고, 라우트는 목록(`/tech`, `/life`)과
상세(`/posts/:category/:slug`)로 나뉩니다.

핵심 설계 원칙 세 가지입니다.

1. **데이터 접근을 `listPosts()` / `loadPost()` 두 함수로 캡슐화한다.**
   나중에 방안 2(GitHub 저장소 + Vercel Function)로 전환할 때 페이지 컴포넌트를 건드리지 않기 위한 이음새입니다.
2. **`import.meta.glob` 호출은 파일 한 곳에만 둔다.**
   나머지 로직(frontmatter 파싱, 정렬, 필터)은 전부 순수 함수로 분리해 테스트 가능하게 만듭니다.
3. **새 색상, 둥근 모서리, 그림자를 도입하지 않는다.**
   마크다운 렌더링조차 기존 5개 색상 토큰과 각진 테두리만으로 표현합니다. (3장 참고)

---

## 2. 사전 결정 사항과 근거

### 2-1. `@tailwindcss/typography`(prose)를 쓰지 않습니다

가장 손쉬운 마크다운 스타일링 수단이지만, `prose`는 자체 회색 계열 팔레트(`--tw-prose-body`,
`--tw-prose-headings` 등)와 둥근 코드 블록, 부드러운 본문 색을 함께 들여옵니다.
이 프로젝트는 `cream` / `on-cream` / `indigo` 3계열만으로 구성되어 있어 정면으로 충돌합니다.
대신 `ReactMarkdown`의 `components` 맵에 요소별 클래스를 명시적으로 지정합니다. (5-6 참고)

### 2-2. `gray-matter` 대신 자체 파서를 씁니다

`gray-matter`는 `Buffer` 등 Node 전용 API에 의존해 브라우저 번들에서 폴리필이 필요합니다.
이 블로그의 frontmatter 스키마는 6개 필드로 고정되어 있으므로, 약 50줄짜리 전용 파서가
의존성 추가와 폴리필 설정보다 가볍고 테스트하기도 쉽습니다. 잘못된 frontmatter를 **빌드/테스트 단계에서
바로 잡아낼 수 있다는 점**도 이점입니다.

### 2-3. `eager: true`로 시작합니다

`import.meta.glob('./**/*.md', { eager: false })`를 쓰면 목록 페이지에서 메타데이터를 얻기 위해
모든 마크다운 청크를 개별 요청해야 합니다(포스트 N개 = 요청 N회). frontmatter가 본문 파일 안에 있기 때문입니다.

따라서 초기에는 `eager: true`로 전부 메인 번들에 인라인합니다. 포스트가 수십 편 수준이면
마크다운 원문 총량은 수십 KB에 불과해 문제가 되지 않고, 런타임 요청이 완전히 0이 됩니다.

> **전환 기준:** `src/posts/**` 의 총 용량이 약 200KB를 넘어가면,
> `prebuild` 스크립트로 `posts.index.json`(메타데이터만)을 생성하고 본문은 `eager: false`로
> 지연 로딩하도록 바꿉니다. 이때도 `listPosts()` / `loadPost()` 시그니처는 그대로 유지되므로
> 페이지 컴포넌트 수정은 없습니다.

### 2-4. 기존 `src/posts/0001.md` 는 이동합니다

현재 파일은 frontmatter가 없고 카테고리 디렉터리에도 속하지 않습니다.
`src/posts/life/2025-07-08-first-post.md` 로 옮기고 frontmatter를 채웁니다.
파일명 규칙은 `YYYY-MM-DD-slug.md` 로 고정해 목록의 기본 정렬과 파일 시스템 정렬을 일치시킵니다.

---

## 3. 보존해야 할 디자인 컨벤션 (기존 코드에서 추출)

명시적으로 정의된 적은 없으나 코드 전반에서 일관되게 나타나는 규칙입니다.
**아래는 이번 구현에서 지켜야 할 제약으로 취급합니다.**

### 3-1. 색상 — `index.css`의 5개 토큰만 사용

| 토큰 | 값 | 용도 |
|---|---|---|
| `cream` | `#fafaf3` | 배경, 반전된 요소의 전경 |
| `on-cream` | `#3d3d3b` | 본문 텍스트 |
| `on-cream-enhanced` | `#1a1a1a` | 본문 텍스트 hover |
| `indigo` | `#0000a1` | 강조, 테두리, 채워진 버튼 배경 |
| `indigo-enhanced` | `#000054` | indigo 요소 hover |

**금지:** Tailwind 기본 팔레트(`text-gray-500`, `bg-slate-100`, `text-blue-600` 등) 사용,
새 `@theme` 색상 추가, 투명도 변형(`/50`), 그라디언트.
`MusicPage`의 `bg-black`은 iframe 로딩 중 레터박스 용도의 예외이며, 이를 선례로 삼지 않습니다.

### 3-2. 형태 — 각지고 단단하게

- **`rounded-*` 를 쓰지 않습니다.** 현재 저장소 전체에 단 한 번도 등장하지 않습니다.
- **`shadow-*`, `blur`, `opacity-*` 를 쓰지 않습니다.** 깊이 표현 없이 평면으로 유지합니다.
- 테두리는 `border-2` (모바일) / `md:border-4` (데스크톱), 항상 `border-indigo` 실선입니다.
- 구분선이 필요하면 `border-t-2 border-indigo` 를 씁니다.

### 3-3. 상태 표현 — 반전(inversion)과 enhanced 색상

`HeaderButton`이 확립한 패턴입니다.

- **선택됨 / 강조:** `bg-indigo text-cream` (채움) → hover 시 `bg-indigo-enhanced`
- **선택 안 됨 / 기본:** `bg-transparent text-indigo border-indigo` (외곽선) → hover 시에도 배경 유지
- **본문 링크:** `text-on-cream` → hover 시 `text-on-cream-enhanced` (`Footer` 패턴)
- 모든 상호작용 요소에 `transition-all` 을 붙입니다.

### 3-4. 타이포그래피와 레이아웃

- 폰트는 `Noto Sans KR` 하나. 별도 monospace를 도입하지 않고, 코드 블록도 반전 배경으로 구분합니다.
- 한글 줄바꿈에는 반드시 `break-keep` 을 씁니다 (`HomePage` 참고).
- 큰 텍스트는 `font-bold`, 반응형은 `md:` 로 크기를 키웁니다 (`text-3xl md:text-5xl`).
- 세로 리듬이 넉넉합니다: `Layout`은 `py-32 md:py-40`, `Header`는 `mb-32`, `Footer`는 `mt-32`.
  포스트 섹션 간 간격도 이 스케일(`space-y-16` 이상)에 맞춥니다.
- 폭은 `max-w-[1024px]` 단일 컬럼. 사이드바나 다단 그리드를 만들지 않습니다.

### 3-5. 아이콘

`react-icons/io5` 의 **Sharp 변형**만 사용합니다 (`IoPersonSharp`, `IoPencilSharp`, `IoMusicalNotesSharp`).
각진 컨벤션과 직결되는 선택이므로, 새 탭 아이콘도 `*Sharp` 로 고릅니다.
`aria-label`은 `NavLink`에, `aria-hidden="true"`는 아이콘에 붙이는 기존 방식을 유지합니다.

### 3-6. 코드 스타일

- 기본 내보내기 함수 컴포넌트, `props`를 받아 첫 줄에서 `const { ... } = props;` 로 분해
  (`TextButton`만 인라인 분해를 쓰는데, 다수 패턴을 따릅니다)
- 조건부 클래스는 `clsx`
- 타입은 `type` 별칭 + `PropsWithChildren`
- 테스트는 컴포넌트와 같은 디렉터리에 `*.test.tsx` 로 배치

### 3-7. ⚠️ 블로그 도입 시 충돌하는 기존 전역 규칙 2가지

이번 구현에서 **반드시 처리해야 할** 부분입니다.

1. **`index.css`의 `p { white-space: pre-wrap; }`**
   `HomePage`의 긴 자기소개 문단을 위한 규칙이지만, 마크다운 본문에 그대로 적용되면
   소스의 소프트 줄바꿈이 전부 실제 줄바꿈으로 렌더링되어 문단이 깨집니다.
   → 포스트 본문 컨테이너에서 `[&_p]:whitespace-normal` 로 무력화합니다.
   (전역 규칙을 제거하면 `HomePage`가 깨지므로, 범위를 좁히는 방향으로 처리합니다.)

2. **`Layout`의 `select-none`**
   블로그 본문은 복사할 수 있어야 합니다.
   → 포스트 본문 컨테이너에 `select-text` 를 지정해 되돌립니다.

---

## 4. 수정 및 추가 예상 파일

### 4-1. 신규 파일

| 파일 | 주요 내용 |
|---|---|
| `src/posts/types.ts` | `Category`, `PostMeta`, `Post` 타입과 `CATEGORIES` 상수, 카테고리 한글 라벨 맵 |
| `src/posts/frontmatter.ts` | `parseFrontmatter(raw)` — `---` 블록을 파싱해 `{ data, content }` 반환. 필수 필드 누락 시 에러 |
| `src/posts/frontmatter.test.ts` | 정상 파싱, 인라인 배열(`tags`), 구분자 없음, 필수 필드 누락, `draft` 불리언 처리 |
| `src/posts/registry.ts` | **`import.meta.glob` 을 호출하는 유일한 파일.** 원문 문자열 맵을 내보냄 |
| `src/posts/posts.ts` | `listPosts(category?)`, `loadPost(category, slug)`, `getAdjacentPosts(...)`. registry + frontmatter 조합 |
| `src/posts/posts.test.ts` | registry를 `vi.mock`으로 대체해 정렬/필터/draft 제외 검증 |
| `src/posts/formatDate.ts` | `2026-01-10` → `2026년 1월 10일` |
| `src/posts/tech/.gitkeep` | 빈 디렉터리 유지 (glob이 0개 매치여도 빌드는 통과) |
| `src/posts/life/2025-07-08-first-post.md` | 기존 `0001.md` 이동 + frontmatter 추가 |
| `src/pages/PostListPage/PostListPage.tsx` | 카테고리별 목록. `category` prop을 받아 두 라우트가 공유 |
| `src/pages/PostListPage/components/PostListItem.tsx` | 제목 / 날짜 / 요약 / 태그 한 줄 항목 |
| `src/pages/PostListPage/PostListPage.test.tsx` | 목록 렌더링, 빈 카테고리 안내 문구 |
| `src/pages/PostPage/components/Markdown.tsx` | `ReactMarkdown` + `components` 맵. 마크다운 스타일이 모이는 단일 지점 |
| `src/pages/PostPage/components/PostHeader.tsx` | 제목, 날짜, 태그, 구분선 |
| `src/pages/PostPage/PostPage.test.tsx` | 존재하는 slug 렌더링, 없는 slug → NotFound 처리 |
| `src/components/Tag.tsx` | 태그 칩 (각진 외곽선 스타일) |
| `vercel.json` | SPA rewrite — `/posts/...` 직접 진입 시 404 방지 |
| `docs/writing-posts.md` | 글 작성 방법: 파일명 규칙, frontmatter 필드, 배포 흐름 |

### 4-2. 수정 파일

| 파일 | 변경 내용 |
|---|---|
| `src/routes/route.ts` | `POST` → `TECH`, `LIFE`, `POST_DETAIL` 로 재편. `postPath(category, slug)` 헬퍼 추가 |
| `src/routes/router.tsx` | 목록 2개 + 상세 1개 라우트 등록, `errorElement` 지정 |
| `src/components/Header.tsx` | 탭 3개 → 4개. 홈(좌) / 기술·일상·음악(우) |
| `src/components/Header.test.tsx` | `cases` 배열을 4개로 갱신 (테스트가 `cases.length`로 링크 수를 검증하므로 자동 반영) |
| `src/pages/PostPage/PostPage.tsx` | "공사 중" 스텁 → `useParams` 기반 실제 상세 페이지 |
| `src/index.css` | 변경 없음이 목표. 필요 시 `@layer base`에 `word-break: keep-all` 정도만 |
| `package.json` | `react-markdown`, `remark-gfm` 추가 |
| `README.md` | 포스트 작성 방법 링크 한 줄 추가 |

### 4-3. 추가 의존성

```bash
npm i react-markdown remark-gfm
```

`rehype-raw`(HTML 삽입)와 `rehype-highlight`(코드 하이라이팅)는 **도입하지 않습니다.**
전자는 XSS 표면을 넓히고, 후자는 외부 테마의 색상 팔레트를 끌고 들어와 3-1과 충돌합니다.

---

## 5. 구현 작업과 순서

각 단계는 그 자체로 `npm run test && npm run lint && npm run build`가 통과하는 상태로 끝납니다.
커밋도 단계 단위로 나누길 권장합니다.

### 1단계 — 타입과 frontmatter 파서 (UI 없음)

`src/posts/types.ts`, `frontmatter.ts`, `formatDate.ts` 와 각각의 테스트를 작성합니다.
UI와 무관한 순수 로직이라 가장 먼저 안정화할 수 있습니다.

frontmatter 스키마를 여기서 확정합니다.

```markdown
---
title: 제목
date: 2026-01-10
category: tech
tags: [vite, react]
summary: 목록에 보일 한 줄 요약.
draft: false
---
```

파서 요구사항입니다.

- 파일 최상단의 `---` … `---` 블록만 인식, 나머지는 본문으로 반환
- `key: value` 한 줄 파싱. `tags`는 `[a, b]` 인라인 배열만 지원 (YAML 전체를 구현하지 않음)
- `draft` 는 `true` 문자열일 때만 `true`
- `title` / `date` / `category` 누락 시 **어느 파일인지 담은 에러 메시지**와 함께 throw
- `category` 가 `tech` | `life` 가 아니면 throw
- 값의 따옴표는 있으면 벗겨냄

### 2단계 — registry와 데이터 접근 함수

`registry.ts` 에 glob을 격리합니다.

```ts
// src/posts/registry.ts — import.meta.glob을 호출하는 유일한 파일
const modules = import.meta.glob('./{tech,life}/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// { 'tech/2026-01-10-foo': '---\ntitle: ...' } 형태로 정규화
export const rawPosts: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, raw]) => [
    path.replace(/^\.\//, '').replace(/\.md$/, ''),
    raw as string,
  ]),
);
```

`posts.ts` 는 이 맵을 받아 파싱·정렬·필터만 수행합니다.

- `listPosts(category?)`: `draft` 제외(단, `import.meta.env.DEV`에서는 포함하고 목록에 초안 표식), `date` 내림차순
- `loadPost(category, slug)`: 없으면 `null` 반환 (throw 하지 않음 — 라우팅에서 404 UI로 처리)
- `getAdjacentPosts(category, slug)`: 이전/다음 글. 상세 페이지 하단 내비게이션용
- **frontmatter의 `category` 와 디렉터리가 불일치하면 에러** — 오타를 빌드 단계에서 잡습니다

테스트는 `vi.mock('./registry')` 로 고정된 원문 맵을 주입해 작성합니다.

### 3단계 — 라우팅과 헤더 (4탭)

`route.ts`:

```ts
const routes = {
  ROOT: '/',
  TECH: '/tech',
  LIFE: '/life',
  POST_DETAIL: '/posts/:category/:slug',
  MUSIC: '/music',
};

export const postPath = (category: Category, slug: string) =>
  `/posts/${category}/${slug}`;
```

`Header.tsx` 는 기존 `HeaderLink` 구조를 그대로 두고 항목만 늘립니다.

| 탭 | 라벨 | 아이콘 | 경로 |
|---|---|---|---|
| 홈 | `홈` | `IoPersonSharp` | `/` |
| 기술 | `기술 글` | `IoCodeSlashSharp` | `/tech` |
| 일상 | `일상 글` | `IoCafeSharp` | `/life` |
| 음악 | `음악` | `IoMusicalNotesSharp` | `/music` |

- 아이콘은 전부 `*Sharp` 변형입니다 (3-5).
- 모바일에서 `size-12` 버튼 4개 + `space-x-4`는 홈 버튼을 포함해도 약 260px로, 360px 화면에 여유 있게 들어갑니다.
  다만 **실기기 폭 320px에서 한 번 확인**이 필요합니다. 넘칠 경우 우측 그룹 간격만 `space-x-2 md:space-x-4`로 줄입니다.
- 상세 페이지(`/posts/tech/...`)에서도 해당 카테고리 탭이 선택 상태로 보여야 합니다.
  `NavLink`의 기본 매칭으로는 안 되므로, `HeaderLink`에 선택적 `isActiveWhen?: (pathname: string) => boolean`
  또는 `NavLink`의 `className`/render-prop 안에서 `useLocation()` 결과를 함께 판단하도록 확장합니다.

`Header.test.tsx` 의 `cases` 배열에 2개 항목을 추가하면, 링크 개수 검증(`cases.length`)은 자동으로 따라옵니다.
상세 경로에서의 탭 활성화 케이스도 테스트로 추가합니다.

### 4단계 — 목록 페이지

`PostListPage`는 `category` prop을 받아 `/tech`, `/life` 두 라우트가 공유합니다.

```tsx
<Route path={routes.TECH} element={<PostListPage category="tech" />} />
```

구성 요소입니다.

- 카테고리 제목: `text-3xl font-bold md:text-5xl` (`HomePage`의 스케일 재사용)
- 목록: `flex flex-col`, 항목 사이 `border-t-2 border-indigo` 구분선, 항목 간 `space-y-*` 대신
  각 항목에 `py-8`을 주어 구분선과 자연스럽게 맞춥니다
- 각 항목: 제목(`text-xl md:text-2xl font-bold`, hover 시 `text-indigo-enhanced`) → 날짜(`text-xs`)
  → 요약(`text-sm break-keep`) → 태그
- 항목 전체를 `Link`로 감싸고 `transition-all` 적용
- **빈 상태:** 포스트가 없을 때 `아직 작성된 글이 없습니다.` 를 본문 스타일로 표시.
  기술 카테고리는 초기에 비어 있을 가능성이 높으므로 필수입니다.

`Tag.tsx` 는 3-3의 외곽선 패턴을 따릅니다: `border-2 border-indigo text-indigo px-2 py-0.5 text-xs`.
둥근 모서리 없이 각진 칩입니다.

### 5단계 — 상세 페이지

```tsx
const { category, slug } = useParams();
```

- `category` 가 `tech` | `life` 가 아니거나 `loadPost`가 `null`이면 **NotFound 표시**
  (`Layout` 안에 "존재하지 않는 글입니다." + 목록으로 돌아가는 링크)
- `PostHeader`: 제목(`text-3xl md:text-5xl font-bold break-keep`), 날짜, 태그, 아래에 `border-t-2 border-indigo`
- 본문 컨테이너에 **3-7의 두 가지 처리**를 반드시 적용합니다.

```tsx
<article className="select-text [&_p]:whitespace-normal break-keep leading-[1.8]">
  <Markdown>{post.body}</Markdown>
</article>
```

- 하단에 이전/다음 글 내비게이션 (`getAdjacentPosts`)
- 라우트 이동 시 스크롤이 유지되는 문제가 있으므로 `useEffect`로 `window.scrollTo(0, 0)` 처리

### 6단계 — 마크다운 스타일링

`Markdown.tsx` 한 파일에 요소별 클래스를 모읍니다. **여기가 마크다운 외형의 유일한 정의 지점입니다.**

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: (p) => <h2 className="mt-16 mb-4 text-2xl font-bold md:text-3xl" {...p} />,
    h2: (p) => <h3 className="mt-12 mb-4 text-xl font-bold md:text-2xl" {...p} />,
    p:  (p) => <p className="my-4 whitespace-normal leading-[1.8]" {...p} />,
    a:  (p) => <a className="text-indigo underline hover:text-indigo-enhanced transition-all" target="_blank" rel="noreferrer" {...p} />,
    ul: (p) => <ul className="my-4 list-disc pl-6" {...p} />,
    ol: (p) => <ol className="my-4 list-decimal pl-6" {...p} />,
    blockquote: (p) => <blockquote className="my-6 border-l-4 border-indigo pl-4" {...p} />,
    code: (p) => <code className="bg-indigo px-1 text-cream" {...p} />,
    pre: (p) => <pre className="my-6 overflow-x-auto border-2 border-indigo p-4 text-sm md:border-4" {...p} />,
    hr: () => <hr className="my-12 border-t-2 border-indigo" />,
    img: (p) => <img className="my-6 w-full" {...p} />,
    table: (p) => <table className="my-6 w-full border-collapse border-2 border-indigo" {...p} />,
    th: (p) => <th className="border-2 border-indigo bg-indigo px-3 py-2 text-left text-cream" {...p} />,
    td: (p) => <td className="border-2 border-indigo px-3 py-2" {...p} />,
  }}
>
```

- 마크다운의 `#`(h1)을 `<h2>`로 낮춥니다. 페이지의 `<h1>`은 `PostHeader`의 글 제목이어야 합니다.
  (참고: 현재 `TextButton`이 본문 중간에 `<h1>`을 쓰고 있어 문서 개요가 이미 어긋나 있습니다.
  이번 범위에서 고치지는 않되, 새로 만드는 페이지에서는 반복하지 않습니다.)
- `pre > code` 중첩 시 인라인 코드 스타일이 이중 적용되지 않도록, `code`에서 부모가 `pre`인지 분기합니다.
- 표는 좁은 화면에서 넘칠 수 있으므로 `overflow-x-auto` 래퍼로 감쌉니다.

### 7단계 — 배포 설정과 문서

`vercel.json` 을 추가합니다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

`createBrowserRouter` 사용 중이므로 이 설정 없이는 `/tech` 나 `/posts/life/xxx` 로 직접 접속하거나
새로고침할 때 404가 납니다. **1~6단계가 로컬에서 정상이어도 배포 후에만 드러나는 문제이므로 빠뜨리지 마세요.**

`docs/writing-posts.md` 에 글 작성 절차를 남깁니다: 파일명 규칙, frontmatter 필드 표,
`draft: true` 활용법, 커밋하면 Vercel이 자동 배포한다는 흐름.

---

## 6. 수락 조건

### 기능

- [ ] 헤더에 홈 / 기술 / 일상 / 음악 4개 탭이 보이고, 각 탭이 해당 경로로 이동한다
- [ ] `/tech`, `/life` 에서 해당 카테고리 글만 최신순으로 표시된다
- [ ] 목록 항목 클릭 시 `/posts/:category/:slug` 로 이동해 본문이 마크다운으로 렌더링된다
- [ ] 상세 페이지에서도 해당 카테고리 탭이 선택 상태로 표시된다
- [ ] 존재하지 않는 slug 접근 시 404 문구와 목록 복귀 링크가 표시된다 (빈 화면이나 크래시가 아님)
- [ ] 글이 없는 카테고리에서 안내 문구가 표시된다
- [ ] `draft: true` 인 글은 프로덕션 목록과 상세에 노출되지 않는다
- [ ] 상세 페이지 하단에 이전/다음 글 내비게이션이 동작한다
- [ ] 마크다운의 제목, 목록, 링크, 인용, 코드 블록, 표, 이미지가 모두 렌더링된다

### 디자인 컨벤션 (3장)

- [ ] `grep -rE "rounded|shadow-|text-(gray|slate|zinc|neutral|blue|red)" src/` 결과가 없다
- [ ] `index.css` 의 `@theme` 색상 토큰이 추가되지 않았다
- [ ] 새로 만든 모든 테두리가 `border-indigo` 이고 `border-2` / `md:border-4` 스케일을 따른다
- [ ] 새 아이콘이 `react-icons/io5` 의 `*Sharp` 변형이다
- [ ] 상호작용 요소에 `transition-all` 과 `*-enhanced` hover 색상이 적용되어 있다
- [ ] 한글 텍스트 블록에 `break-keep` 이 적용되어 있다

### 3-7 충돌 처리

- [ ] 여러 줄로 소프트 랩된 마크다운 문단이 **한 문단으로** 렌더링된다 (줄바꿈이 그대로 살아나지 않는다)
- [ ] 포스트 본문 텍스트를 마우스로 드래그해 선택·복사할 수 있다
- [ ] 위 두 변경이 `HomePage` 자기소개 문단의 기존 줄바꿈과 `select-none` 동작을 깨뜨리지 않는다

### 품질과 배포

- [ ] `npm run test` 통과. frontmatter 파서, `listPosts`/`loadPost`, 4탭 헤더에 대한 테스트가 존재한다
- [ ] `npm run lint` 경고 없이 통과
- [ ] `npm run build` 성공 (`tsc -b` 포함, 타입 에러 없음)
- [ ] 필수 frontmatter 필드가 빠진 마크다운을 추가하면 **테스트/빌드가 실패**한다
- [ ] `vercel.json` 이 존재하고, 배포 후 `/tech` 와 `/posts/life/xxx` 직접 진입·새로고침이 404 없이 동작한다
- [ ] 360px 폭에서 헤더 4탭이 넘치지 않는다

### 확장성 (방안 2로의 이음새)

- [ ] `import.meta.glob` 이 `registry.ts` 에만 존재한다
- [ ] 페이지 컴포넌트가 `listPosts()` / `loadPost()` 외의 데이터 접근 경로를 쓰지 않는다
- [ ] 파싱·정렬·필터 로직이 순수 함수로 분리되어 registry 없이 단독 테스트된다

---

## 7. 이번 범위에서 제외하는 것

의도적으로 빼는 항목입니다. 필요해지면 별도 이슈로 다룹니다.

- **SEO / OG 태그의 포스트별 동적 생성** — CSR 구조의 한계이며 프리렌더 도입이 선행되어야 합니다.
  덧붙여 현재 `index.html` 의 `<link href="/src/style.css">` 는 존재하지 않는 파일을 가리키고 있습니다
  (실제 CSS는 `main.tsx` 가 `index.css` 를 import). 무해하지만 정리 대상으로 기록해 둡니다.
- 태그별 필터링 페이지, 전문 검색
- 코드 신택스 하이라이팅 (3-1과 충돌하므로 전용 팔레트 설계가 선행되어야 함)
- 댓글, 조회수 (방안 3의 영역)
- RSS 피드 — 다만 정적 구조라 구현 난이도가 낮으므로 다음 후보로 적절합니다
