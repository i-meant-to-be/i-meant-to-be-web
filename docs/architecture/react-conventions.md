# React Conventions

이 문서는 React 컴포넌트 코드를 **어떻게 쓰는지**를 정의한다. 파일을 **어디에 두는지**는
[`project-structure.md`](project-structure.md) §3, Tailwind 클래스 작성 규칙은
[`styling.md`](styling.md)가 소유한다. 충돌하면 [`ARCHITECTURE.md`](../ARCHITECTURE.md)
§1의 순서를 따른다.

## 1. 컴포넌트 선언

컴포넌트는 **함수 선언문**으로 쓰고 그 자리에서 기본 내보내기 한다.

```tsx
// O
export default function PostPage() { ... }

// X — 상수형 선언 + 별도 export
const PostPage = () => { ... };
export default PostPage;
```

- 함수 선언은 호이스팅되므로 보조 컴포넌트를 파일 아래쪽에 둬도 되고, 스택 트레이스와
  React DevTools에 이름이 그대로 남는다.
- 저장소의 모든 컴포넌트가 이미 이 형태다. 새 코드도 예외를 두지 않는다.
- props 타입은 같은 파일 위쪽에 `{Component}Props` 인터페이스로 둔다. 여러 컴포넌트가
  공유하는 타입은 `project-structure.md` §3의 배치 규칙을 따른다.

## 2. 컴포넌트 본문 순서

읽는 사람이 "무엇을 받아서 → 무엇을 계산하고 → 무엇을 그리는지" 순으로 따라갈 수 있게
아래 순서를 지킨다.

1. props 구조 분해
2. 훅 (`useState`, `useRef`, 커스텀 훅) 과 `useEffect`
3. 파생 값 (`const visiblePosts = ...`)
4. 이벤트 핸들러 `const handleX` (§3)
5. 분리한 className 상수 (`styling.md` §3)
6. 조기 반환 (`if (headings.length === 0) return null;`)
7. `return ( ... )`

## 3. 이벤트 핸들러

**TSX 안에 함수를 인라인으로 쓰지 않는다.** 컴포넌트 함수 상단에 `const handle...`로
분리하고 JSX에서는 이름만 넘긴다.

```tsx
// O
const handleShareClick = async () => { ... };
return <button onClick={handleShareClick}>공유</button>;

// X
return <button onClick={async () => { ... }}>공유</button>;
```

- 이름은 `handle` + 대상/동작 (`handleShareClick`, `handleNextPageClick`).
- JSX가 "무엇을 그리는가"만 남아 마크업과 동작이 한눈에 분리된다.

### 3-1. 목록 안에서 항목별 값이 필요할 때

`map` 콜백 파라미터를 닫아야 해서 인라인 화살표를 피할 수 없어 보이는 경우가 있다. 이때는
**핸들러 팩토리**를 상단에 두거나, 자식이 값을 되돌려 주도록 설계한다.

```tsx
// O — 팩토리를 상단에 분리
const handleCategorySelect = (category: Category | null) => () =>
  setSelected(category);

{categories.map((category) => (
  <CategoryTab ... onSelect={handleCategorySelect(category)} />
))}

// O — 자식이 값을 되돌려 줌
const handleCategorySelect = (category: Category | null) => setSelected(category);

{categories.map((category) => (
  <CategoryTab ... category={category} onSelect={handleCategorySelect} />
))}
```

## 4. useEffect

**effect 콜백과 cleanup은 모두 기명 함수로 쓴다.**

```tsx
// O
useEffect(function cancelPendingReset() {
  return function clearResetTimeout() {
    clearTimeout(resetTimeoutRef.current);
  };
}, []);

// X
useEffect(() => () => clearTimeout(resetTimeoutRef.current), []);
```

- 이름이 곧 "이 effect가 왜 있는가"에 대한 설명이 된다. 주석 없이 의도가 남는다.
- React DevTools 프로파일러와 스택 트레이스에 익명 함수 대신 이름이 찍혀, effect가 여러 개인
  컴포넌트에서 어느 것이 도는지 바로 보인다.
- 이 규칙은 `useEffect`에만 적용한다. 이벤트 핸들러는 §3, `useMemo`/`useCallback`의 짧은
  계산식에는 강제하지 않는다.

## 5. 배치 — 다른 문서 참조

컴포넌트·훅·타입을 어느 폴더에 둘지는 [`project-structure.md`](project-structure.md) §3이
정의한다. 요약하면 페이지 전용은 `src/pages/{Page}/{components,hooks,types}/`,
둘 이상의 페이지가 공유하면 `src/{components,hooks,types}/`다.

## 6. 스타일 — 다른 문서 참조

조건부/긴 className 분리는 [`styling.md`](styling.md) §3, 모바일 기본 + `md:` 데스크톱
규칙은 `styling.md` §4가 정의한다.
