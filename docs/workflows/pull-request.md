# Commit and PR Workflow

커밋/PR 절차서. 정책이 [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)와 충돌하면 그 문서가
우선함.

혼자 개발하는 저장소라 이슈 트래킹을 강제하지 않음. 이슈 번호는 브랜치 이름, 커밋 메시지, PR
제목·본문 어디에도 요구하지 않음.

## 1. 브랜치 이름

```text
label/작업 내용 요약
```

`label`은 §2의 값 중 하나, 요약은 하이픈으로 구분한 영문 소문자. 예: `feat/seo-indexing-and-docs`

## 2. 커밋 메시지 형식

```text
label: message
```

| label      | 의미                                  |
| ---------- | ------------------------------------- |
| `docs`     | 문서 작업                             |
| `chore`    | 파일 이동/삭제, 의존성 추가 등 비개발 |
| `feat`     | 기능 개발                             |
| `fix`      | 오류 해결                             |
| `refactor` | 기능 변경 없는 코드 수정              |
| `design`   | UI 변경                               |
| `test`     | 테스트 코드 수정                      |

다른 라벨은 쓰지 않음. 하나의 커밋이 여러 라벨에 걸치면 라벨별로 나눔.

## 3. 커밋 크기

커밋당 파일 개수는 권장 10개 이하, 최대 15개. 초과하면 논리적 경계로 나눔.

## 4. PR 제목 형식

```text
[LABEL] title
```

`LABEL`은 §2의 라벨을 대문자로 표기함. 여러 라벨이 섞이면 비중이 가장 큰 변경 하나를 고름.
예: `[FEAT] SEO 라우팅 및 위키 초기 구조 추가`

## 5. PR 본문

`.github/PULL_REQUEST_TEMPLATE.md`의 섹션을 채움.

- `# 🚩 연관 이슈` — 이슈 트래킹을 쓰지 않는 한 비워 둠.
- `# 📝 작업 내용` — 원래 요청이 아니라 실제 diff 기준 요약.

## 6. 아키텍처 문서 동기화

`docs/ARCHITECTURE.md` 또는 `docs/architecture/*.md`가 다루는 내용에 영향을 주는 변경이 있으면
PR 전에 해당 문서도 함께 갱신함. 코드와 문서가 어긋난 채로 PR을 올리지 않음.

## 7. 커밋/PR 전 검증

CI(`.github/workflows/CI.yml`)는 PR 시점에 다음만 실행함.

```bash
npm run test
npm run lint
```

`npm run build`(타입체크 포함)는 CI에 없음. 타입 오류를 배포 전에 잡으려면 로컬에서 직접
실행해야 함.

## 8. Push/PR 생성 — 확인 게이트

커밋 요청은 원격 push 권한을 포함하지 않음. push나 PR 생성 전에 무엇을 push하는지(브랜치,
커밋, 대상 브랜치)를 알리고 명시적 확인을 받음. 변경 내용과 검증 결과를 실제로 확인한 뒤에
물어보며, 미리 묻지 않음.
