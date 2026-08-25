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

## 4. 예외 — 서드파티가 생성하는 클래스명

`rehype-highlight`(코드 하이라이팅)처럼 서드파티 라이브러리가 런타임에 직접 `<span
class="hljs-keyword">` 같은 클래스명을 주입하는 경우, React 컴포넌트의 `className` prop으로
타게팅할 수 없어 Tailwind 유틸리티로 대응이 불가능하다. 이런 경우에 한해 해당 클래스명을
셀렉터로 쓰는 전용 CSS 파일을 만들어 그 라이브러리를 쓰는 컴포넌트 옆에 두고 직접
`import './x.css'`한다 (예: `src/pages/PostDetailPage/components/highlight.css`).

- 이 예외는 서드파티가 클래스명을 직접 생성해 Tailwind로 타게팅 불가능한 경우에만 적용한다.
  우리가 작성하는 컴포넌트는 여전히 인라인 유틸리티 클래스를 쓴다.
- 가능하면 새 색상을 도입하지 않고 `src/index.css`의 `@theme` 토큰을 CSS 변수
  (`var(--color-indigo)` 등)로 참조한다. 코드 하이라이팅처럼 그 대상 자체가 여러 색을 구분해야
  하는 경우에 한해서만, 사이트 전역 브랜드 토큰(`@theme`)을 건드리지 않고 해당 CSS 파일
  안에 국한된 강조색을 따로 정의할 수 있다 — 예: `highlight.css`의 `--hljs-*` 변수. 이때도 주
  색상(`indigo`)과 조화로운 색상 이론(보색/스플릿 컴플리멘터리/삼각 배색 등)에 따라 근거를
  남기고, 남색 계열은 피해 `indigo`와 시각적으로 구분되게 한다.
