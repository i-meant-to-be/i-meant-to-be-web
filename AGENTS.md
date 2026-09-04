# AGENTS.md

이 파일은 이 저장소에서 작업하는 모든 AI 코딩 에이전트(Claude Code, Codex 등)의 실행
진입점이다. 사람 기여자에게는 `README.md`가 같은 역할을 한다.

## 1. 문서 권위

이 저장소의 문서는 다음 순서로 해석한다.

1. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (와 이 문서가 편입한
   `docs/architecture/*.md`)
2. 이 문서 `AGENTS.md`
3. [`docs/workflows/*.md`](docs/workflows/)
4. `README.md`

`docs/ARCHITECTURE.md`는 이 프로젝트의 기술 스택, 핵심 불변조건과 코드 사실을 정의한다. 이
문서는 그 위에서 에이전트가 실제로 어떻게 작업을 수행해야 하는지(절차, 검증, 확인 게이트)를
정의한다. 코드/아키텍처 사실과 충돌하면 `docs/ARCHITECTURE.md`가 우선한다.

## 2. 설계 원칙

> 이 섹션(§2 설계 원칙)에 담긴 원칙은 이 저장소에서 이루어지는 모든 작업에서 일반적인
> 프로젝트 내 헌법 문서(`CONSTITUTION.md`)에 준하는 수준으로 고려되어야 한다.
>
> 이 섹션(§2 설계 원칙)은 사용자의 명시적 허용 없이는 그 어떤 경우에도 수정하지 않는다.
> 이 제한은 오직 이 섹션(§2 설계 원칙)에만 적용되며, 이 문서의 다른 섹션에는 적용되지
> 않는다.

- 코드를 작성하거나 계획을 세울 때는 가장 단순하고 직관적이며 이해하기 쉬운 방안을
  우선한다 (OCCAM'S RAZOR).
- 복잡성을 추가하는 방안은, 그 방안 외에는 사실상 대안이 없는 경우에만 고려한다.
- 확장성이나 재사용성을 이유로 지금 필요하지 않은 추상화를 미리 도입하지 않는다.

## 3. 코드를 변경하기 전에

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)를 먼저 읽는다. 이 문서 §5 "작업별 필수
  읽기" 표에 따라 관련 세부 문서를 추가로 읽는다.
- 커밋이나 PR을 만들 때는
  [`docs/workflows/pull-request.md`](docs/workflows/pull-request.md)를 따른다.

## 4. 검증

- 실제로 실행한 검증과 실행하지 않은 검증을 구분해서 보고한다. 실행하지 않은 검증을
  통과했다고 말하지 않는다.
- 코드를 변경했으면 최소한 `npm run lint`, `npm run test`를 실행한다. `index.html`,
  `vercel.json`, 라우팅/SEO 관련 변경은 `npm run build`(타입체크 포함)도 함께 실행한다 —
  CI는 이 검증을 하지 않는다 (`docs/workflows/pull-request.md` §7).

## 5. 실행 범위

- 커밋 요청은 원격 push 권한을 포함하지 않는다. push나 PR 생성 전에는 실제 diff와 검증
  결과를 확인한 뒤 명시적으로 확인받는다.
- `404.html` 생성 계약, `.env`, `.gitignore`처럼 되돌리기 어렵거나 사용자가 직접
  건드린 파일은 원인이 불분명하면 먼저 보고하고 임의로 되돌리지 않는다.
