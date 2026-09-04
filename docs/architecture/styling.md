# Styling

Tailwind CSS 4 컬러 토큰과 클래스 작성 규칙.

## 1. 컬러 토큰

`src/index.css`의 `@theme`에서 정의함. 새 색상은 컴포넌트에 hex를 하드코딩하지 않고 여기에
토큰으로 추가함.

| 토큰                | 값        | 용도                         |
| ------------------- | --------- | ---------------------------- |
| `cream`             | `#fafaf3` | 배경                         |
| `on-cream`          | `#3d3d3b` | 배경 위 기본 텍스트/아이콘   |
| `on-cream-enhanced` | `#1a1a1a` | `on-cream`의 hover/강조 상태 |
| `indigo`            | `#0000a1` | 강조색 (버튼, 선택 상태)     |
| `indigo-enhanced`   | `#000054` | `indigo`의 hover/강조 상태   |

`-enhanced` 접미사는 같은 역할의 색을 한 단계 진하게 쓸 때(주로 `hover:`)의 명명 규칙임. 새
강조색도 이 규칙을 따름.

## 2. 폰트

`--font-sans`는 `Noto Sans KR` 고정 (`index.html`에서 Google Fonts로 로드). 글꼴을 바꾸면
`index.html`의 `<link>`와 `index.css`의 `--font-sans`를 함께 갱신함.

## 3. 클래스 작성 규칙

- 조건부 클래스는 `clsx`를 씀.
- 유틸리티 클래스는 인라인으로 씀. 별도 CSS 파일이나 `@apply`로 추출하지 않음 (예외: §5).
- `p { white-space: pre-wrap; }` 같은 전역 base 스타일은 `src/index.css`의 `@layer base`
  에서만 관리함.
- 조건부 분기가 복잡한 `clsx`나 지나치게 긴 클래스 목록은 이름 있는 상수로 분리하고 JSX에는
  이름만 남김. 기준은 JSX 한 줄에서 무엇을 그리는 요소인지 바로 보이는가임 — 클래스가 길어
  태그와 자식이 묻히거나 삼항이 둘 이상 겹치면 분리함.

  ```tsx
  const tabClassName = clsx(
    'border-2 border-indigo px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm',
    selected
      ? 'bg-indigo text-cream hover:bg-indigo-enhanced'
      : 'bg-transparent text-indigo hover:bg-indigo/10',
  );
  ```

  props·state에 의존하면 컴포넌트 본문 안(`react-conventions.md` §2의 5번), 상태와 무관한
  순수 문자열이면 모듈 스코프에 둠.

## 4. 반응형 — 모바일 기본, `md:`가 데스크톱

모든 컴포넌트는 두 뷰포트를 함께 고려해 작성함.

- **모바일**: 접두사 없는 기본 유틸리티 (`text-sm`, `mt-4`, `p-4`)
- **데스크톱**: `md:` 접두사 (`md:text-base`, `md:mt-6`, `md:p-8`)

Tailwind 반응형 유틸리티는 `min-width` 기반이라 `md:*`가 기본값을 덮어씀. 반대로 쓰면 모바일에
데스크톱 스타일이 그대로 노출됨.

- 분기점은 `md:` 하나임. `sm:`을 임의로 끼워 넣지 않음.
- 크기·여백 유틸리티는 기본값과 `md:` 값을 짝으로 씀 (`mt-4 md:mt-6`). 두 뷰포트에서 같아야
  하는 스타일만 기본 클래스 하나로 둠.
- 역방향 분기(`max-md:`)는 쓰지 않음.

## 5. 예외 — 서드파티가 생성하는 클래스명

`rehype-highlight`처럼 라이브러리가 런타임에 `<span class="hljs-keyword">` 같은 클래스명을
직접 주입하면 `className` prop으로 타게팅할 수 없음. 이 경우에 한해 그 클래스명을 셀렉터로
쓰는 전용 CSS 파일을 해당 컴포넌트 옆에 두고 `import './x.css'`함
(예: `src/pages/PostDetailPage/components/highlight.css`).

- 우리가 작성하는 컴포넌트는 여전히 인라인 유틸리티 클래스를 씀.
- 색은 가능하면 `@theme` 토큰을 CSS 변수(`var(--color-indigo)`)로 참조함. 코드 하이라이팅처럼
  대상 자체가 여러 색을 구분해야 하는 경우에만 그 CSS 파일 안에 국한된 강조색을 정의할 수
  있음 — 예: `highlight.css`의 `--hljs-*`. 이때도 `indigo`와 조화로운 배색 근거를 남기고,
  남색 계열은 피해 시각적으로 구분되게 함.
