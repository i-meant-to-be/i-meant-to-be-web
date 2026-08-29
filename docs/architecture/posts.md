# Posts

이 문서는 블로그 게시물의 저작 계약을 정의한다 — 파일 위치·네이밍, frontmatter,
본문 작성 규칙, 이미지 처리 정책. `src/` 폴더 구조 자체는
[`project-structure.md`](project-structure.md), 라우팅/SEO 연동은
[`routing-and-seo.md`](routing-and-seo.md)를 기준으로 해석한다.

## 1. 파일 위치와 네이밍

- 게시물 원고(`.md`)는 `src/posts/content/`에만 둔다. `src/posts/` 루트에는 로더
  코드(`index.ts`, `parsePost.ts`, `extractHeadings.ts`, `formatDate.ts`)만 있다.
- 파일명 형식: `{4자리 순번}-{영문 슬러그}.md` (예: `0001-hello-world.md`).
- 파일명(확장자 제외)이 그대로 URL id가 된다: `/post/{id}`. 슬러그는 소문자 kebab-case
  영문만 쓴다.
- `src/posts/index.ts`가 `import.meta.glob('./content/*.md', { query: '?raw', eager: true })`로
  전체를 문자열로 로드해 `getAllPosts` / `getPostById`를 제공한다. 이 로딩 로직은
  `routing-and-seo.md` §3-1(동적 라우트 SEO)과 함께 해석한다.

## 2. frontmatter 계약

파서는 `src/posts/parsePost.ts` (순수 함수, Node 스크립트와 공유 가능).

| 필드          | 필수 | 형식                    | 설명                                                        |
| ------------- | ---- | ----------------------- | ---------------------------------------------------------- |
| `title`       | O    | 문자열                  | 페이지 `<h1>`과 SEO 제목으로 쓰인다                          |
| `date`        | O    | `YYYY-MM-DD`            | 유효한 날짜여야 한다. 목록 정렬 기준(내림차순)               |
| `description` | X    | 문자열                  | 없으면 본문 첫 문단에서 자동 발췌. SEO 설명으로도 쓰인다     |
| `tags`        | X    | `[태그1, 태그2]`        | 없으면 빈 배열                                              |
| `draft`       | X    | `true` / `false`        | `true`면 목록·sitemap·색인에서 제외 (`noindex`)             |

## 3. 본문 작성 규칙

- **본문 제목은 `##`(depth 2)부터 시작한다.** `#`(depth 1)을 쓰지 않는다.
  `src/pages/PostDetailPage/PostDetailPage.tsx`가 `title`로 페이지 `<h1>`을 이미
  렌더하므로, 본문에 `#`를 쓰면:
  - 한 문서에 `<h1>`이 여러 개 생겨 문서 개요가 깨진다 (접근성·SEO 저하).
  - 본문 `#` 스타일(`text-3xl`/`4xl`)이 페이지 제목(`text-4xl`/`5xl`)과 크기가 겹쳐
    시각적 위계가 무너진다.
  - 목차(`extractHeadings`, 최대 depth 3)의 한 단계를 불필요하게 소비한다.
- frontmatter `title`과 같은 내용의 제목을 본문 맨 위에 다시 쓰지 않는다 — 중복이다.
  본문은 `##`부터 시작하거나 바로 문단으로 시작한다.

## 4. 이미지 정책

### 4-1. 저장 위치

```
public/posts/<게시물-id>/<이미지-이름>.<확장자>
```

- 예: `public/posts/0001-hello-world/architecture-diagram.png`
- 게시물별로 폴더를 나눈다. 게시물을 삭제하거나 파일명(id)을 바꾸면 이미지 폴더도
  함께 옮긴다.
- `public/favicons/`와 같은 정적 애셋 패턴을 따른다. 서빙 경로는 파일 경로와 동일하다:
  `/posts/<id>/<이름>.<확장자>`.

### 4-2. 네이밍

- 소문자 kebab-case 영문. 공백·한글·대문자 금지.
- 내용을 서술하는 이름 (`screenshot-1.png`가 아니라 `gradle-build-scan.png`).
- 외부에서 가져온 이미지의 무의미한 파일명(UUID 등)은 저장하면서 개명한다.

### 4-3. 본문에서 참조

```markdown
![캐시 적중 시 작업 흐름](/posts/0003-efficient-ci-with-github-actions-jetpack-compose/cache-hit-flow.png)
```

- 항상 `/posts/...`로 시작하는 **절대경로**를 쓴다. 게시물 `.md`는 `?raw` 문자열로
  로드되어 Vite 애셋 파이프라인을 타지 않으므로 상대경로(`./foo.png`)는 런타임에
  해석되지 않는다.
- `alt` 텍스트를 반드시 채운다 (접근성).

### 4-4. 외부 이미지 금지

- 서드파티 호스트(`velog.velcdn.com`, 이미지 CDN, 블로그 등)의 이미지를 본문에서
  직접 링크(핫링크)하지 않는다. 반드시 내려받아 `public/posts/<id>/`에 저장하고 로컬
  경로로 참조한다.
- 이유: 원본이 사라지면 링크가 깨진다(link rot). 외부 요청은 방문자 IP를 제3자에게
  노출한다. 이미지 크기·포맷을 통제할 수 없다.

### 4-5. 최적화

빌드타임 이미지 최적화 파이프라인이 없다. 커밋 전에 웹에 바로 쓸 수 있는 상태로
가공한다.

- 다이어그램·스크린샷: PNG. 사진: JPG. 벡터: SVG.
- 최대 가로 약 1600px. 파일당 300KB 이하를 목표로 한다.
- 이미지 총량이 크게 늘면 Git LFS 도입을 재검토한다 (현재는 불필요).

### 4-6. SPA 로딩 특성

`public/`의 이미지는 JS 번들에 포함되지 않는다. `<img>`가 실제로 렌더되는 시점
(= 해당 게시물 상세 페이지 진입)에만 브라우저가 내려받고, `loading="lazy"`로 뷰포트
근처에 올 때까지 더 미룬다. 블로그 목록·홈 진입 시에는 게시물 이미지가 로드되지 않는다.

이 특성을 유지하려면 이미지를 `import` 문이나 `import.meta.glob`으로 끌어오지 않는다 —
그 순간 번들에 포함된다.

### 4-7. 빌드 검증

`scripts/check-post-images.mjs`가 `npm run build` 첫 단계로 실행되어 본문의 모든 이미지
참조를 검사한다. 다음 중 하나라도 있으면 빌드가 실패한다:

- `/posts/...` 절대경로가 가리키는 `public/` 파일이 존재하지 않음
- `http(s)://` 외부 URL (§4-4 위반)
- `/`로 시작하지 않는 상대경로 (런타임에 해석 불가)

## 5. 범위 밖

- frontmatter `thumbnail` / OG 이미지: `parsePost`가 읽지 않고 `Seo`의 `override`가
  `title`/`description`/`noindex`만 받는다. 지원하려면 코드 변경이 선행되어야 한다.
