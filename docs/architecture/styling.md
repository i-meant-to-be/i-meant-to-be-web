# Styling

이 문서는 Tailwind CSS 4 컬러 토큰과 클래스 작성 규칙을 정의한다.

## 1. 컬러 토큰

`src/index.css`의 `@theme`에서 정의한다. 새 색상이 필요하면 컴포넌트에 하드코딩된 hex 값을
쓰지 않고 여기에 토큰을 추가한다.

| 토큰                  | 값        | 용도                              |
| ---------------------- | --------- | ------------------------------------ |
| `cream`                | `#fafaf3` | 배경                                 |
| `on-cream`             | `#3d3d3b` | 배경 위 기본 텍스트/아이콘           |
| `on-cream-enhanced`    | `#1a1a1a` | `on-cream`의 hover/강조 상태         |
| `indigo`               | `#0000a1` | 강조색 (버튼, 선택 상태)             |
| `indigo-enhanced`      | `#000054` | `indigo`의 hover/강조 상태           |

`-enhanced` 접미사는 같은 역할의 색을 하나 더 진하게 쓸 때(주로 `hover:`)의 명명 규칙이다.
새 강조색을 추가할 때도 이 접미사 규칙을 따른다.

## 2. 폰트

`--font-sans`는 `Noto Sans KR`로 고정되어 있다 (`index.html`에서 Google Fonts로 로드). 새
글꼴이 필요하면 `index.html`의 `<link>`와 `index.css`의 `--font-sans` 둘 다 갱신한다.

## 3. 클래스 작성 규칙

- 조건부 클래스는 `clsx`를 쓴다 (`HeaderButton.tsx` 참고).
- 유틸리티 클래스는 인라인으로 쓰고, 별도 CSS 파일이나 `@apply`로 추출하지 않는다 — 현재
  컴포넌트 수에서는 과한 추상화다.
- `p { white-space: pre-wrap; }` 같은 전역 base 스타일은 `src/index.css`의 `@layer base`
  에서만 관리한다.
