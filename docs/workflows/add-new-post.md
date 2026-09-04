# 새 게시물 추가 워크플로우

외부 Markdown 1개를 블로그 게시물 컨벤션에 맞게 배치·검증하고 PR까지 여는 절차서.
컨벤션 자체는 [`docs/architecture/posts.md`](../architecture/posts.md)가 소유하며 충돌 시
`posts.md` / [`ARCHITECTURE.md`](../ARCHITECTURE.md)가 우선함.

## 입력

```
/imeanttobe-add-new-post <원본 Markdown 경로>
```

경로 인자가 없으면 먼저 요청함.

## 전제

- 원본은 완성본임 (모든 게시물은 발행 대상).
- 원본 frontmatter는 없다고 가정하고 새로 만듦 (있어도 무시).
- 이미지가 있으면 `<img src="PATH">` / `![alt](PATH)`의 `PATH`는 접근 가능한 실제 파일
  경로임 (절대경로 또는 원본 `.md` 기준 상대경로).

## 1. 원본 로드

- 경로 없으면 중단·보고.
- UTF-8로 읽음.
- 파일 mtime 기록 → 6단계 `date`.

## 2. id 결정 (사용자 확인)

- 순번 = `src/posts/content/`의 `NNNN-` 최대값 + 1, 4자리 zero-pad.
- slug 초안 = 첫 `# H1` 텍스트(없으면 원본 파일명) → 소문자 kebab-case ASCII. 비ASCII는
  음차하지 말고 사용자에게 영문 slug 확인.
- 순번 + slug 초안을 제시해 확정받음. id = `NNNN-<slug>`.

## 3. 제목 결정 (2와 함께 확인)

- 첫 `# H1` 텍스트(없으면 원본 파일명)를 `title` 후보로 제시해 확정받음.

## 4. 본문 정규화

- 3단계에서 첫 `# H1`을 `title`로 채택했으면 그 라인을 본문에서 삭제 (`posts.md` §3).
  H1이 없어 파일명을 `title`로 썼으면 삭제할 라인 없음.
- 위 처리 후, 코드펜스(``` ``` ```, `~~~`) 밖에 depth 1 `#` 제목이 하나라도 남으면
  코드펜스 밖 모든 제목을 +1 (5 초과분은 5로 clamp). 시프트 사실을 사용자에게 알림.
- 시프트 여부와 무관하게, 코드펜스 밖 제목 중 `######` 이상은 모두 `#####`로 낮춘다
  (`posts.md` §3).
- 결과 본문은 `##` 이하 제목으로 시작하거나 단락으로 시작해야 함 (`posts.md` §3). depth 1
  `#`로 시작하면 안 됨.

## 5. 이미지 이관

- 코드펜스 밖 `<img src="PATH">` · `![alt](PATH)` 수집.
- 각 `PATH`: 절대경로 또는 원본 `.md` 기준 상대경로로 실제 파일을 찾음. 못 찾으면 중단.
  `http(s)://`면 중단 (`posts.md` §4-4).
- 대상 파일명 (`posts.md` §4-2): 원본 basename이 소문자 kebab ASCII면 그대로, 아니면
  `alt`에서 kebab 생성, 그것도 안 되면 `image-1`, `image-2` …. 확장자는 원본 유지.
- `public/posts/<id>/<대상 파일명>`으로 복사.
- 본문 참조를 `![<alt>](/posts/<id>/<대상 파일명>)` 마크다운 형식으로 교체 (`<img>`도
  변환). `alt`가 비면 사용자에게 확인 후 채움.
- 300KB 초과 이미지는 사용자에게 알림 (`posts.md` §4-5).

## 6. frontmatter 생성

`posts.md` §2 계약. 원본 frontmatter는 버리고 새로 씀.

```
---
title: <3에서 확정>
description: <7 — 사용자 입력>
date: <1의 mtime, 로컬 시간대 YYYY-MM-DD>
category: <8 — 사용자 확정>
tags: [<9 — 사용자 확정>]
---
```

- `title` / `description` / 각 태그는 **한 줄**로 쓴다. 줄바꿈을 넣지 않는다.
- 값이 `"`·`'`·`[`·`{`·`#`·`&`·`*`·`!`·`|`·`>`·`@`·`` ` ``로 시작하거나, `: `(콜론+공백)
  또는 ` #`(공백+샵)을 포함하거나, 앞뒤 공백이 있으면 값 전체를 큰따옴표로 감싸고 내부의
  `\`와 `"`를 `\\`·`\"`로 escape한다. 그 외에는 그대로 쓴다.
- 태그는 §9 규칙상 단일 단어라 보통 인용이 필요 없다. `category`도 마찬가지다.

## 7. description

사용자에게 직접 입력받음. 후보 제안 안 함.

## 8. category

- `posts.md` §2의 필수 필드. 값은 `철학` 또는 `개발` 둘 중 하나뿐이다.
- 본문을 읽고 하나를 제안해 사용자 확정을 받음.
- 태그의 상위 분류이므로 같은 값을 §9의 태그에 중복해 넣지 않음.

## 9. tags

- 본문을 읽고 최대 5개 추천.
- 각 태그는 띄어쓰기·쉼표 없는 단일 단어 (`Kotlin`, `자료구조`, `JetpackCompose`).
- 사용자가 확정한 값을 씀.

## 10. 파일 배치

- frontmatter + 정규화 본문을 `src/posts/content/<id>.md`로 씀 (LF, UTF-8, 끝 개행 1개).
- 원본 파일은 건드리지 않음.

## 11. 검증

```bash
node scripts/check-post-images.mjs
npm run lint
npm run test
npm run build
```

실패 시 원인 수정. `npm run dev`로 `/post/<id>` 육안 확인 권장.

## 12. 커밋 & PR

[`pull-request.md`](pull-request.md)를 그대로 따름.

- 라벨 `feat` (`[FEAT]`).
- 게시물 `.md` + 이미지는 한 커밋. 문서 변경이 섞이면 라벨별로 분리 (`pull-request.md`
  §2·§3).
- Push / PR 생성 전 확인 게이트 (`pull-request.md` §8).
