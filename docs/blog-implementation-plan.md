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

---

## 8. 모호점 — 개발자 결정이 필요한 항목

앞 장에서 **제가 임의로 정한 사항**과 **아직 열려 있는 선택지**를 모았습니다.
각 항목은 `질문 → 대안 → 권장안 → 근거` 순이며, 결정이 바뀌면 수정해야 할 장을 함께 적었습니다.

전부 답하지 않아도 착수는 가능합니다. **Q1, Q5, Q8은 1~2단계 코드 형태를 직접 바꾸므로 착수 전에**,
나머지는 해당 단계에 들어가기 전에 정하면 됩니다.

### A. URL과 라우팅

#### Q1. 목록과 상세의 경로 구조를 어떻게 맞출까요? ⚠️ 착수 전 결정

3단계에서 목록은 `/tech`, 상세는 `/posts/tech/:slug` 로 잡았는데, **다시 읽어보니 일관성이 없습니다.**
같은 카테고리인데 접두사가 붙었다 말았다 합니다. 제가 근거 없이 섞어 쓴 부분입니다.

| 대안 | 목록 | 상세 |
|---|---|---|
| (a) 평면 중첩 | `/tech` | `/tech/:slug` |
| (b) 접두사 통일 | `/posts/tech` | `/posts/tech/:slug` |
| (c) 현행 계획 | `/tech` | `/posts/tech/:slug` |

**권장: (a) 평면 중첩**

- URL이 짧고 카테고리가 최상위 개념으로 드러납니다. 헤더 탭 = 최상위 경로라는 구조와도 맞습니다.
- `NavLink`의 기본 접두사 매칭이 그대로 동작해, **Q3에서 다룰 "상세 페이지에서 탭 활성화" 문제가 저절로 풀립니다.**
  (c)나 (b)는 별도 매칭 로직이 필요합니다.
- 위험은 카테고리 이름과 미래의 최상위 경로가 충돌할 수 있다는 점인데(`/about` 같은 페이지를 추가할 때),
  카테고리가 2~3개로 고정적이라 실질적 위험은 낮습니다.

→ 채택 시 5장 3단계의 `routes` 정의와 `postPath` 헬퍼, 4-2 표를 수정해야 합니다.

#### Q2. URL의 slug에 날짜를 포함할까요?

2-4에서 파일명을 `YYYY-MM-DD-slug.md` 로 정하고 slug를 파일명 그대로 쓰기로 했는데,
그러면 URL이 `/tech/2026-01-10-vite-glob-import` 가 됩니다. 길이와 심미성 문제가 있습니다.

- (a) 파일명 전체를 slug로 사용 — `/tech/2026-01-10-vite-glob-import`
- (b) 파일명에서 날짜 접두사를 제거해 slug 생성 — `/tech/vite-glob-import`
- (c) frontmatter에 `slug` 필드를 두어 명시 지정

**권장: (b) 날짜 접두사 제거**

- 파일 시스템에서는 날짜 정렬이 유지되고, URL은 짧고 읽기 좋습니다. 두 요구를 모두 만족합니다.
- 대가는 **날짜가 달라도 slug 본문이 같으면 충돌**한다는 점입니다.
  `listPosts` 초기화 시 카테고리 내 slug 중복을 검사해 에러를 던지면 조기에 잡을 수 있습니다.
- (c)는 유연하지만 필드가 하나 늘고 파일명과 URL이 어긋날 수 있어, 글이 많아진 뒤에 도입해도 늦지 않습니다.

한글 slug(`/tech/뷰-훅-정리`)는 인코딩 시 URL이 지저분해지므로 **영문 소문자와 하이픈만 권장**합니다.

#### Q3. 기존 `/post` 경로를 어떻게 처리할까요?

이미 배포된 경로이고 헤더에도 노출되어 있었습니다. 4-2에서 저는 아무 언급 없이 제거하기로 했습니다.

- (a) 그냥 제거
- (b) `/post` → `/tech` 로 리다이렉트 라우트 유지
- (c) `/post` 를 통합 목록(기술+일상 전체)으로 남김

**권장: (b) 리다이렉트**

- 라우트 한 줄(`<Route path="/post" element={<Navigate to={routes.TECH} replace />} />`)이면 되는데,
  기존 링크나 북마크가 깨지는 것을 막습니다. 비용 대비 효과가 큽니다.
- 다만 현재 `/post` 는 "공사 중" 스텁이라 **외부에 공유된 링크가 실제로 있을 가능성은 낮습니다.**
  없다고 확신하시면 (a)로 충분합니다.
- (c)는 탭이 5개로 늘거나 헤더에 없는 숨은 페이지가 생겨 구조가 흐려집니다.

#### Q4. 정의되지 않은 경로(`/foo`)에 대한 404 페이지를 만들까요?

5단계에서 "없는 slug"의 404만 다루었고, **전역 catch-all은 계획에서 빠져 있었습니다.**
현재는 react-router 기본 에러 화면이 노출되며, 이 화면은 프로젝트 디자인과 전혀 무관합니다.

- (a) 이번 범위에 포함 — `path: '*'` 라우트 + `NotFoundPage`
- (b) 다음 작업으로 미룸

**권장: (a) 포함**

- 없는 slug 처리를 위해 어차피 "존재하지 않습니다 + 복귀 링크" UI를 만들게 됩니다.
  이를 `NotFoundPage` 컴포넌트로 빼서 두 곳에서 재사용하면 추가 비용이 거의 없습니다.
- 라우트를 4개에서 6개로 늘리는 변경이라, 지금 하지 않으면 나중에 라우터를 다시 건드려야 합니다.

### B. 데이터 모델

#### Q5. `category`의 단일 출처를 어디로 할까요? ⚠️ 착수 전 결정

2단계에서 저는 **디렉터리와 frontmatter 양쪽에 category를 두고 불일치를 에러로 잡는** 방식을 택했습니다.
검증은 되지만, 같은 정보를 두 곳에 적어야 하는 중복입니다.

- (a) 디렉터리에서 파생, frontmatter에서 `category` 필드 제거
- (b) frontmatter만 사용, 디렉터리는 평평하게(`src/posts/*.md`)
- (c) 양쪽 유지 + 불일치 검증 (현행 계획)

**권장: (a) 디렉터리에서 파생**

- 글쓴이가 적어야 할 필드가 하나 줄고, **불일치라는 오류 상태 자체가 사라집니다.**
  검증 코드도 필요 없어집니다.
- 카테고리 이동이 "파일을 다른 폴더로 옮기기"라는 직관적 조작이 됩니다.
- (b)는 파일이 늘어날수록 탐색이 어렵고, (c)는 제가 검증 로직을 넣으려다 만든 불필요한 중복입니다.

→ 채택 시 5장 1단계의 frontmatter 스키마에서 `category` 를 빼고, 2단계의 불일치 검증 항목을 삭제합니다.

#### Q6. `summary`가 없을 때 목록에 무엇을 보여줄까요?

4-1에서 `summary`를 선택 필드로 두었는데, 없을 때의 동작을 정하지 않았습니다.

- (a) 필수 필드로 승격 — 없으면 에러
- (b) 본문 앞 N자를 자동 추출
- (c) 요약 영역을 생략하고 제목·날짜만 표시

**권장: (a) 필수 필드로 승격**

- (b)의 자동 추출은 마크다운 문법(`#`, `>`, 코드 블록)을 걷어내야 해서 생각보다 지저분하고,
  결과물의 품질도 들쭉날쭉합니다.
- 목록 화면의 정보량이 글마다 달라지면 3장의 "일관된 형태" 지향과 어긋납니다.
- 한 줄 요약을 직접 쓰는 부담은 크지 않고, 오히려 글의 초점을 잡는 데 도움이 됩니다.

#### Q7. `draft` 글의 노출 범위는 어디까지일까요?

2단계에서 `import.meta.env.DEV`면 목록에 포함한다고만 적었는데, 다음이 미결입니다.

- 상세 페이지 직접 URL 접근도 개발 환경에서만 허용할지
- Vercel **프리뷰 배포**(PR 브랜치)에서는 어떻게 할지 — 프리뷰는 프로덕션 빌드라 `DEV`가 `false`입니다
- 애초에 초안을 커밋할지, 로컬에만 두고 완성 후 커밋할지

**권장: 초안은 커밋하되, 노출은 `DEV`에서만 (목록·상세 모두)**

- 초안을 커밋해두면 기기 간 이동과 백업이 되고, 이게 Git 기반 운영의 이점입니다.
- 프리뷰까지 열려면 별도 환경변수가 필요한데, 1인 블로그에서 프리뷰로 초안을 검토할 일은 드물어
  복잡도 대비 효용이 낮습니다. 필요해지면 그때 `VITE_SHOW_DRAFTS` 를 추가하면 됩니다.
- **구현 주의:** vitest 환경에서도 `DEV`가 `true`라 초안이 섞여 들어옵니다.
  `listPosts(category, { includeDrafts })` 처럼 **인자로 받고 호출부에서 `import.meta.env.DEV`를 주입**해야
  테스트가 환경에 흔들리지 않습니다.

#### Q8. frontmatter 검증을 어디서 강제할까요? ⚠️ 착수 전 결정

6장에 "필수 필드가 빠지면 **빌드가 실패한다**"를 수락 조건으로 적었는데, **다시 검토하니 그대로는 성립하지 않습니다.**
`tsc -b` 와 `vite build` 는 마크다운 내용을 검사하지 않고, 파서의 `throw` 는 해당 함수가 호출되는
**런타임 시점**에 터집니다. 즉 잘못된 글을 올리면 빌드는 성공하고 방문자에게 빈 화면이 보입니다.

- (a) 모든 포스트를 순회 검증하는 테스트를 추가 (`posts.validation.test.ts`)
- (b) `prebuild` npm 스크립트로 Node에서 검증 후 실패 시 exit 1
- (c) 파서가 throw하지 않고 해당 글만 건너뛰며 콘솔 경고

**권장: (a) 순회 검증 테스트 + (c)의 완충**

- (a)는 파일 하나 추가로 끝나고, CI가 이미 PR마다 `npm run test` 를 돌리고 있어 **추가 설정 없이 게이트가 생깁니다.**
  `import.meta.glob` 이 vitest에서도 동작하므로 실제 포스트 전체를 검사할 수 있습니다.
- 동시에 런타임 파서는 (c)처럼 **글 하나의 오류가 사이트 전체를 죽이지 않도록** 방어하는 편이 안전합니다.
  잘못된 글은 목록에서 빠지고 나머지는 정상 동작합니다.
- (b)는 확실하지만 CI에 없는 단계가 로컬 빌드에만 걸려 흐름이 갈라집니다. (a)로 충분합니다.

→ 채택 시 4-1에 검증 테스트 파일을 추가하고, 6장의 해당 수락 조건 문구를 "테스트가 실패한다"로 고칩니다.

#### Q9. 같은 날짜의 글이 둘 이상일 때 순서는?

`date`에 시간이 없어 동일 날짜 글의 정렬이 불안정합니다. 계획에 빠져 있던 부분입니다.

**권장: 2차 정렬 키로 slug 역순 사용**

- 결과가 항상 결정적이어서 빌드마다 순서가 달라지지 않습니다.
- frontmatter에 시각까지 적게 하는 것은 과합니다. 하루 두 편 이상 쓰는 빈도라면 그때 고려하면 됩니다.

### C. 디자인 세부

#### Q10. 코드 블록에 monospace를 허용할까요?

3-4에서 저는 "폰트는 `Noto Sans KR` 하나, 별도 monospace를 도입하지 않는다"고 단언했습니다.
**이건 기존 코드에서 추출한 규칙이 아니라 제 추정입니다.** 기존 저장소에는 코드 블록 자체가 없었습니다.

- (a) `font-mono` 허용 (Tailwind 기본 시스템 스택)
- (b) `Noto Sans KR` 유지

**권장: (a) `font-mono` 허용**

- 기술 카테고리가 생기는 만큼 코드가 본문에 자주 등장하는데, 비고정폭으로는 들여쓰기와 정렬이 무너집니다.
- 3장의 실제 제약은 **색상과 형태**이지 서체 수가 아닙니다.
  `font-mono`는 시스템 폰트라 새 웹폰트 로드도, 새 색상도 없어 컨벤션을 건드리지 않습니다.
- 오히려 고정폭 서체의 기계적인 인상은 "각지고 단단한" 방향과 잘 맞습니다.

#### Q11. 인라인 코드를 어떤 스타일로 표시할까요?

6단계에서 `bg-indigo text-cream`(반전)으로 잡았는데, 임의 선택이었습니다.
기술 글은 문장 중간에 인라인 코드가 빈번해서, 반전 블록이 촘촘히 박히면 본문이 시끄러워질 수 있습니다.

- (a) 반전 — `bg-indigo text-cream px-1` (현행 계획)
- (b) 외곽선 — `border-2 border-indigo text-indigo px-1`
- (c) 색상만 — `text-indigo font-mono`

**권장: (c) 색상만 + `font-mono`**

- 3-3의 반전 패턴은 **버튼·탭 같은 상호작용 요소의 선택 상태**를 뜻합니다.
  클릭할 수 없는 인라인 코드에 같은 표현을 쓰면 그 의미가 희석됩니다.
- 고정폭 서체 자체가 이미 충분한 시각적 구분이 되어, 읽기 흐름을 덜 끊습니다.
- 블록 코드(`pre`)는 계획대로 `border-2 border-indigo` 테두리로 감싸 인라인과 위계를 나눕니다.

#### Q12. 날짜 표기 형식은?

`formatDate` 를 `2026년 1월 10일` 로 잡았지만 임의 선택입니다.

- (a) `2026년 1월 10일`
- (b) `2026.01.10`
- (c) `2026 / 01 / 10`

**권장: (b) `2026.01.10`**

- 자릿수가 고정되어 목록에서 세로로 열이 맞습니다. (a)는 월·일에 따라 길이가 흔들립니다.
- 기존 `Footer` 처럼 한국어 문장체가 쓰이는 곳과 달리, 날짜는 **메타데이터 레이블**이라
  기계적인 표기가 3장의 인상과 더 잘 맞습니다.
- 접근성을 위해 `<time dateTime="2026-01-10">` 로 감싸는 것은 어느 안을 고르든 함께 적용합니다.

#### Q13. 새 탭의 아이콘과 라벨을 확정해주세요.

3단계 표의 `IoCodeSlashSharp`(기술) / `IoCafeSharp`(일상)와 라벨 `기술 글` / `일상 글` 은
**전적으로 제 임의 선택입니다.** 아이콘은 사이트 인상을 크게 좌우하므로 직접 고르시는 편이 좋습니다.

- 기술 후보: `IoCodeSlashSharp`, `IoTerminalSharp`, `IoHardwareChipSharp`
- 일상 후보: `IoCafeSharp`, `IoLeafSharp`, `IoSunnySharp`, `IoBookSharp`
- 기존 `IoPencilSharp`(게시글)이 놓이게 되므로, 둘 중 하나에 재사용할 수도 있습니다

**권장: 기술 `IoTerminalSharp`, 일상 `IoCafeSharp`, 라벨은 `기술` / `일상`**

- `IoTerminalSharp` 는 직사각 프레임이라 `HeaderButton` 의 사각 테두리 안에서 형태가 안정적입니다.
  `IoCodeSlashSharp` 는 사선 위주라 상대적으로 헐거워 보입니다.
- `IoCafeSharp` 는 `HomePage` 자기소개의 커피 이야기와 연결되어 개인적 맥락이 살아납니다.
- 라벨은 `aria-label` 로만 쓰이므로(화면에 보이지 않음) 짧고 명확한 편이 낫습니다.
  다만 스크린리더 사용자에게는 `기술`보다 `기술 글 목록`이 더 친절할 수 있어, 이 점은 취향에 맡깁니다.

#### Q14. 목록 항목에 태그를 노출할까요?

4단계에서 제목·날짜·요약·태그를 모두 넣기로 했는데, 항목당 4줄이면 정보 밀도가 높습니다.
`Tag` 컴포넌트를 만들 이유가 목록 표시뿐이라면 이번 범위에서 뺄 수도 있습니다.

- (a) 목록·상세 모두 태그 표시 (현행 계획)
- (b) 상세에만 표시, 목록은 제목·날짜·요약 3줄
- (c) frontmatter에 `tags` 를 두되 화면에는 아직 쓰지 않음

**권장: (b) 상세에만 표시**

- 목록은 "무엇에 관한 글인지"만 빠르게 훑는 화면이고, 그 역할은 제목과 요약이 이미 합니다.
- 태그 필터링 페이지가 없는 상태(7장에서 제외)에서 목록의 태그는 **클릭할 수 없는 장식**이라
  오히려 클릭 가능성을 오해하게 만듭니다.
- `Tag` 컴포넌트는 상세 페이지용으로 그대로 만들면 되고, 나중에 필터 기능이 생기면 목록에 추가합니다.

### D. 구현 방식과 프로세스

#### Q15. 새 테스트는 어느 스타일로 쓸까요?

저장소에 두 스타일이 공존합니다. 계획에서는 섞어 썼는데, 통일하는 편이 낫습니다.

- (a) `renderToStaticMarkup` + 마크업 문자열 매칭 (`Header.test.tsx`, `HeaderButton.test.tsx`)
- (b) Testing Library + 역할 기반 쿼리 (`HomePage.test.tsx`)

**권장: 페이지·상호작용은 (b), 순수 스타일 검증은 (a)**

- 목록·상세 페이지 테스트는 "링크가 올바른 곳을 가리키는가", "없는 글에 안내가 뜨는가" 같은
  **사용자 관점 검증**이라 (b)가 의도를 잘 드러냅니다.
- 반면 `HeaderButton` 처럼 클래스 조합 자체가 관심사인 경우는 (a)가 간결합니다.
  기존 두 테스트가 이미 이 구분을 따르고 있어, 새로 만드는 것도 같은 기준을 적용하면 일관됩니다.
- 파서·정렬 등 순수 함수는 렌더링 없이 일반 단위 테스트로 작성합니다.

#### Q16. 포스트 이미지는 어디에 둘까요?

계획에서 다루지 않았는데, 첫 글에 스크린샷 하나만 들어가도 바로 필요해집니다.

- (a) `public/posts/<slug>/image.png` — 마크다운에서 `/posts/<slug>/image.png` 로 절대 참조
- (b) `src/posts/<category>/<slug>/` 에 함께 두고 Vite가 번들링
- (c) 외부 스토리지(Cloudflare R2 등)

**권장: (a) `public/` 절대 경로**

- 마크다운 원문의 이미지 경로가 **빌드 도구와 무관한 평범한 URL**이 되어,
  나중에 방안 2(GitHub 저장소)로 콘텐츠를 옮길 때 경로를 그대로 쓸 수 있습니다.
- (b)는 마크다운 안의 상대 경로를 Vite가 해석하지 못해 별도 플러그인이나 변환이 필요합니다.
- (c)는 저장소 용량이 실제로 문제가 된 뒤에 고려하면 됩니다. 텍스트 위주 블로그라면 한동안 오지 않습니다.

#### Q17. PR을 어떻게 나눌까요?

5장에서 "단계 단위 커밋"만 적고 PR 단위는 정하지 않았습니다.
CI가 `develop` 대상 PR에서만 도는 구조라 이 결정이 검증 시점에 영향을 줍니다.

- (a) 7단계 전체를 하나의 PR로
- (b) 2개로 분할 — ①1~3단계(데이터 계층 + 라우팅/헤더) ②4~7단계(화면 + 배포 설정)
- (c) 단계마다 PR

**권장: (b) 2개로 분할**

- ①만 머지해도 사이트는 정상 동작합니다(탭이 늘고 목록은 빈 상태). **각 PR이 배포 가능한 단위**입니다.
- (a)는 신규 파일이 15개를 넘어 리뷰가 어렵고, (c)는 UI 없는 PR이 여럿 생겨 프리뷰 확인이 무의미해집니다.
- 단, 7단계의 `vercel.json` 은 ②가 아니라 **①에 포함**해야 합니다.
  ①에서 `/tech` 경로가 생기는 순간부터 직접 진입 404가 발생하기 때문입니다.
