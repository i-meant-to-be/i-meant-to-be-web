# 블로그 포스트 서버리스 운영 방안 (비용 0원 기준)

> 전제
>
> - 현재 스택: Vite + React 19 + react-router-dom (SPA), Vercel Hobby 배포, GitHub Actions CI
> - `src/posts/*.md` 에 마크다운을 두고 파서로 렌더링하던 구조
> - 탭 구성: 홈 / 블로그(기술) / 블로그(일상) / 음악 — 총 4개
> - 별도의 상시 구동 서버(WAS/DB 인스턴스)는 없음
> - 아래 각 서비스의 무료 한도는 2026년 상반기 기준이며, 정책은 변동될 수 있으므로 도입 시점에 재확인 필요

---

## 요약 비교

| | 1. 빌드타임 정적 번들 (Git as CMS) | 2. GitHub 저장소 + Vercel Function 프록시 | 3. 관리형 서버리스 DB (Supabase / Cloudflare D1) |
|---|---|---|---|
| 데이터 저장소 | 이 저장소의 `src/posts/**` | 콘텐츠 전용 GitHub 저장소(또는 브랜치) | Postgres / SQLite (관리형) |
| 글 발행 방식 | 커밋 → 재배포 | 커밋(또는 GitHub 웹 편집) → 즉시 반영 | 관리 화면 또는 SQL/API 호출 |
| 재배포 필요 | 필요 (자동, 1~2분) | 불필요 | 불필요 |
| 런타임 서버 코드 | 없음 | Vercel Function 1개 | Vercel Function 또는 클라이언트 직접 호출 |
| 비용 | 0원 (영구) | 0원 | 0원 (무료 한도 내) |
| 초기 구현 난이도 | 낮음 | 중간 | 중간~높음 |
| 운영 리스크 | 거의 없음 | GitHub API 레이트리밋 | 무료 플랜 정책 변경 / 프로젝트 자동 일시정지 |
| SEO / OG | 정적 SPA 한계 (별도 처리 필요) | 동일 | 동일 |

**결론: 방안 1을 기본으로 채택하고, 발행 편의성이 실제로 문제가 될 때 방안 2로 확장하는 경로를 권장합니다.**

---

## 방안 1 — 빌드타임 정적 번들 (Git as CMS) ✅ 권장

### 개요

마크다운을 저장소에 두고, Vite의 `import.meta.glob`으로 **빌드 시점에** 모든 포스트를 번들에 포함시킵니다.
글을 쓰는 행위 = 커밋 = 배포이며, 런타임에는 어떤 네트워크 요청도 발생하지 않습니다.

기존 구현과의 차이는 파일 위치와 로딩 방식입니다. `public/`에 두고 `fetch`로 읽으면
(a) 목록/메타데이터를 얻기 위한 인덱스 파일을 손으로 관리해야 하고
(b) 오타난 slug가 빌드 시점에 걸러지지 않습니다.
`src/posts/`에 두고 glob으로 읽으면 목록이 자동 생성되고 타입 검사도 받습니다.

### 디렉터리 설계

```
src/posts/
  tech/
    2026-01-10-vite-glob-import.md
    2026-02-03-react-19-migration.md
  life/
    2026-01-22-seoul-winter.md
```

각 파일은 frontmatter로 메타데이터를 갖습니다.

```markdown
---
title: Vite glob import로 마크다운 블로그 만들기
date: 2026-01-10
category: tech
tags: [vite, react]
summary: 빌드 타임에 포스트를 수집하는 방법.
draft: false
---

본문...
```

### 필요한 의존성

```bash
npm i react-markdown remark-gfm gray-matter
npm i -D rehype-highlight   # 코드 하이라이팅이 필요하면
```

- `react-markdown` + `remark-gfm`: 렌더링 (표, 체크박스, 자동 링크 지원)
- `gray-matter`: frontmatter 파싱

> `gray-matter`는 Node 전용 API(`Buffer`)를 참조하므로 브라우저 번들에서 문제가 될 수 있습니다.
> Vite 플러그인에서 빌드 타임에 파싱해 JSON으로 넘기거나, `front-matter` 같은 브라우저 안전 대안을 쓰는 편이 안전합니다.

### 로더 스케치

```ts
// src/posts/loadPosts.ts
export type Category = 'tech' | 'life';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: Category;
  tags: string[];
  summary: string;
};

export type Post = PostMeta & { body: string };

// eager: false → 목록은 즉시, 본문은 필요할 때 코드 스플리팅으로 로드
const modules = import.meta.glob('./**/*.md', {
  query: '?raw',
  import: 'default',
});

const slugOf = (path: string) =>
  path.replace(/^\.\//, '').replace(/\.md$/, ''); // 'tech/2026-01-10-...'

export async function loadPost(slug: string): Promise<Post | null> {
  const entry = modules[`./${slug}.md`];
  if (!entry) return null;

  const raw = (await entry()) as string;
  const { data, content } = parseFrontmatter(raw);

  return { ...(data as PostMeta), slug, body: content };
}

export async function listPosts(category?: Category): Promise<PostMeta[]> {
  const posts = await Promise.all(
    Object.keys(modules).map((p) => loadPost(slugOf(p))),
  );

  return posts
    .filter((p): p is Post => p !== null && !p.draft)
    .filter((p) => !category || p.category === category)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ body: _body, ...meta }) => meta);
}
```

목록 페이지에서 본문 전체를 파싱하는 게 부담이 되는 규모(수백 편 이상)라면,
Vite 플러그인 또는 `prebuild` 스크립트로 `posts.index.json`을 생성해 목록만 따로 읽게 바꾸면 됩니다.
포스트가 수십 편 수준이라면 위 방식으로 충분합니다.

### 라우팅 변경

```ts
// src/routes/route.ts
const routes = {
  ROOT: '/',
  TECH: '/tech',
  LIFE: '/life',
  POST: '/posts/:category/:slug',
  MUSIC: '/music',
};
```

`Header`에는 기술/일상 두 개의 `HeaderLink`가 추가됩니다.
현재 `Header.test.tsx`가 버튼 구성을 검증하고 있으므로 함께 수정이 필요합니다.

### SPA 새로고침 대응

`createBrowserRouter`를 쓰므로 `/posts/tech/xxx`로 직접 진입하면 404가 납니다. 저장소 루트에 `vercel.json`을 추가하세요.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 장점

- 비용, 레이트리밋, 콜드스타트, 벤더 종속이 전부 없음
- 포스트가 Git 히스토리에 남아 버전 관리·롤백·PR 리뷰가 됨
- CDN 정적 파일이라 가장 빠름
- 현재 구조에서 가장 적은 변경으로 도달 가능

### 단점 / 완화책

- **글 발행에 커밋이 필요** → GitHub 웹 에디터나 모바일 앱으로도 가능. 배포는 1~2분.
- **이미지 관리** → `public/posts/<slug>/` 에 함께 넣거나, 용량이 커지면 Cloudflare R2 무료 한도(10GB) 활용
- **SEO/OG 태그** → SPA라 크롤러가 본문을 못 읽음. 필요해지면
  ① `vite-plugin-ssg` 류로 프리렌더 ② Vercel Function에서 `?_escaped_fragment_` 대신 User-Agent 분기로 메타태그만 주입 ③ 장기적으로 Next.js/Astro 이전
  중 선택. **지금 당장은 필수가 아니며, 방안 2·3도 동일한 한계를 갖습니다.**

---

## 방안 2 — 콘텐츠 전용 GitHub 저장소 + Vercel Function 프록시

### 개요

포스트 마크다운을 **별도의 공개 저장소**(예: `i-meant-to-be/blog-contents`)에 두고,
웹앱은 런타임에 그 내용을 읽어옵니다. 글을 올리면 **재배포 없이 즉시** 반영됩니다.
GitHub 저장소가 사실상 무료 CMS 겸 스토리지 역할을 합니다.

### 왜 프록시가 필요한가

브라우저에서 GitHub API를 직접 호출하면:

- 인증 없는 GitHub REST API는 **IP당 시간당 60회** 제한 → 공용 와이파이/모바일 IP에서 쉽게 소진됨
- 토큰을 프론트에 넣으면 그대로 노출됨

그래서 Vercel Function 하나를 두고, 서버 측에서 토큰을 붙이고(시간당 5,000회) 응답을 CDN에 캐싱합니다.
Vercel Hobby 플랜에서 Function은 무료 한도 내 사용 가능합니다.

### 구현 스케치

```
api/
  posts.ts        # 목록: contents API로 디렉터리 조회 + index.json 반환
  post.ts         # 단건: raw 마크다운 반환
```

```ts
// api/post.ts
export const config = { runtime: 'edge' };

const OWNER = 'i-meant-to-be';
const REPO = 'blog-contents';

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') ?? '';

  // 경로 탈출 방지: 화이트리스트 패턴만 허용
  if (!/^(tech|life)\/[a-z0-9-]+$/.test(slug)) {
    return new Response('Bad Request', { status: 400 });
  }

  const upstream = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${slug}.md`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.raw',
      },
    },
  );

  if (!upstream.ok) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(await upstream.text(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // CDN에 5분 캐싱, 만료 후에도 1일간은 옛 응답을 주면서 백그라운드 갱신
      'Cache-Control':
        'public, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
```

- `GITHUB_TOKEN`은 **읽기 전용 fine-grained PAT**(대상 저장소의 Contents: Read만)으로 발급해 Vercel 환경변수에 등록
- 캐싱 덕분에 실제 GitHub API 호출은 5분에 1회 수준으로 떨어져 레이트리밋 걱정이 사라짐
- 목록은 매 요청 디렉터리를 훑기보다, 콘텐츠 저장소에 `index.json`을 두고 그것만 읽는 편이 안정적
  (콘텐츠 저장소의 GitHub Actions로 커밋 시 자동 생성)

### 장점

- **재배포 없이 즉시 발행** — 모바일 GitHub 웹 에디터로 글을 올리면 최대 5분 내 반영
- 콘텐츠와 코드의 저장소가 분리되어 웹앱 커밋 히스토리가 깔끔해짐
- 여전히 Git 기반이라 버전 관리 이점을 유지
- 비용 0원

### 단점 / 리스크

- 런타임 의존성이 생김: GitHub API 장애 = 블로그 본문 장애 (단, `stale-while-revalidate`가 상당 부분 방어)
- 첫 로딩이 방안 1보다 느림 (콜드스타트 + 왕복 1회)
- 관리 대상(저장소, 토큰, Function)이 늘어남. 토큰 만료 갱신 필요
- 프리뷰/로컬 개발 시에도 토큰 세팅이 필요

### 발행 UX를 더 끌어올리고 싶다면

**Decap CMS**(구 Netlify CMS)를 `/admin` 경로에 정적으로 얹으면 웹 기반 편집 화면이 생깁니다.
GitHub OAuth 백엔드가 필요한데, 이것도 Vercel Function으로 직접 구현하면 추가 비용이 없습니다.
다만 유지보수 대상이 하나 더 늘어나므로, 글쓰기 빈도가 충분히 높아진 뒤에 도입하길 권합니다.

---

## 방안 3 — 관리형 서버리스 DB (Supabase 또는 Cloudflare D1)

### 개요

"DB 서버를 간단히 구현할 방법"에 해당하는 선택지입니다. 직접 서버를 띄우지 않고,
관리형 서버리스 DB의 무료 한도를 사용합니다.

| | Supabase (Postgres) | Cloudflare D1 (SQLite) |
|---|---|---|
| 무료 한도 | DB 500MB, 대역폭 5GB/월 | 5GB 저장, 읽기 500만 행/일 |
| 관리 UI | 있음 (Table Editor, SQL Editor) | 대시보드 + Wrangler CLI |
| 클라이언트 직접 호출 | 가능 (`@supabase/supabase-js` + RLS) | 불가 (Workers 경유 필요) |
| 인증/스토리지 | 기본 제공 | 별도 (R2, Access) |
| 주의점 | **7일간 요청 없으면 프로젝트 자동 일시정지** | Vercel과 별개 플랫폼이라 배포 경로 이원화 |

블로그 용도라면 Supabase 쪽이 관리 화면과 클라이언트 SDK 덕분에 손이 덜 갑니다.

### 스키마 예시

```sql
create table posts (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  category    text not null check (category in ('tech', 'life')),
  title       text not null,
  summary     text,
  body        text not null,          -- 마크다운 원문
  published   boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index posts_category_published_at_idx
  on posts (category, published_at desc);

-- 익명 사용자는 발행된 글만 읽을 수 있고, 쓰기는 불가
alter table posts enable row level security;

create policy "public read published"
  on posts for select
  to anon
  using (published = true);
```

`anon` 키는 공개되어도 되는 키이지만, **RLS를 반드시 켜야** 안전합니다. `service_role` 키는 절대 프론트에 두지 마세요.

### 장점

- 진짜 DB이므로 조회수, 태그, 검색, 예약 발행, 시리즈 같은 **관계형 기능 확장이 자유로움**
- 웹 관리 화면에서 즉시 발행/수정 — 커밋도, 배포도, GitHub도 불필요
- 이미지도 Supabase Storage(무료 1GB)로 같이 처리 가능

### 단점 / 리스크

- **가장 무겁습니다.** 현재 요구사항(포스트 4개 탭 렌더링) 대비 과한 인프라
- 콘텐츠가 Git 밖으로 나가 버전 관리·백업이 사라짐 → 별도 백업 Action을 만들어야 안심
- 무료 플랜의 자동 일시정지 정책: 방문이 뜸한 개인 블로그에서 실제로 걸릴 수 있음
  (Vercel Cron이나 GitHub Actions 스케줄로 주기적 핑을 보내 회피 가능하지만, 운영 부담이 늡니다)
- 글쓰기 UI를 직접 만들지 않으면 결국 Supabase 대시보드에서 마크다운을 붙여넣게 되는데,
  그건 GitHub 웹 에디터보다 나을 게 없음
- 무료 플랜 정책 변경 시 이전 비용이 가장 큼 (벤더 종속)

### 이럴 때 선택하세요

- 댓글, 좋아요, 조회수 같은 **쓰기 트래픽이 있는 기능**을 곧 붙일 계획이 확실할 때
- 여러 사람이 글을 쓰고, Git을 모르는 필자가 있을 때

---

## 권장 로드맵

1. **지금:** 방안 1 구현. `src/posts/{tech,life}/*.md` + frontmatter + `import.meta.glob`, 라우트 4개 확장, `vercel.json` rewrite 추가.
2. **글이 쌓이고 커밋-배포 사이클이 번거로워지면:** 콘텐츠를 별도 저장소로 옮겨 방안 2로 전환.
   프론트의 `loadPost`/`listPosts` 인터페이스를 그대로 유지하면 데이터 소스만 교체되므로 **페이지 컴포넌트는 손대지 않아도 됩니다.**
   → 그래서 1단계에서 로더를 반드시 별도 모듈로 분리해 두는 것이 중요합니다.
3. **댓글·조회수 등 동적 기능이 필요해지면:** 그 기능에 한해서만 방안 3(Supabase)을 도입.
   포스트 본문까지 DB로 옮길 필요는 없습니다.

### 세 방안에 공통으로 필요한 준비

- `Category = 'tech' | 'life'` 타입과 `PostMeta` 타입을 한 곳에 정의
- 데이터 접근을 `listPosts()` / `loadPost(slug)` 두 함수로 캡슐화 (전환 비용을 0에 가깝게 만드는 핵심)
- 마크다운 렌더링 컴포넌트(`<Markdown />`)를 데이터 소스와 분리
- SEO가 중요해지는 시점에 대한 계획 — 세 방안 모두 현재의 CSR 구조에서는 동일한 한계를 가집니다
