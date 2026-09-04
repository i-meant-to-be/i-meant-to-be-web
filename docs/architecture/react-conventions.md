# React Conventions

React 컴포넌트 코드를 **어떻게 쓰는지**에 대한 규칙. 파일을 **어디에 두는지**는
[`project-structure.md`](project-structure.md) §3, Tailwind 클래스는
[`styling.md`](styling.md)가 소유함.

## 1. 컴포넌트 선언

컴포넌트는 함수 선언문으로 쓰고 그 자리에서 기본 내보내기 함.

```tsx
// O
export default function PostPage() { ... }

// X
const PostPage = () => { ... };
export default PostPage;
```

함수 선언은 호이스팅되므로 보조 컴포넌트를 파일 아래쪽에 둘 수 있고, 스택 트레이스와 React
DevTools에 이름이 남음.

props 타입은 같은 파일 위쪽에 `{Component}Props` 인터페이스로 둠.

## 2. 컴포넌트 본문 순서

1. props 구조 분해
2. 훅 (`useState`, `useRef`, 커스텀 훅)과 `useEffect`
3. 파생 값
4. 이벤트 핸들러 `const handleX` (§3)
5. 분리한 className 상수 (`styling.md` §3)
6. 조기 반환
7. `return ( ... )`

## 3. 이벤트 핸들러

TSX 안에 함수를 인라인으로 쓰지 않음. 컴포넌트 함수 상단에 `const handle...`로 분리하고
JSX에는 이름만 넘김. 이름은 `handle` + 대상/동작 (`handleShareClick`).

```tsx
// O
const handleShareClick = async () => { ... };
return <button onClick={handleShareClick}>공유</button>;

// X
return <button onClick={async () => { ... }}>공유</button>;
```

### 3-1. 목록 안에서 항목별 값이 필요할 때

`map` 콜백 파라미터를 닫아야 하면 핸들러 팩토리를 상단에 두거나, 자식이 값을 되돌려 주게 함.

```tsx
const handleCategorySelect = (category: Category | null) => () =>
  setSelected(category);

{categories.map((category) => (
  <CategoryTab ... onSelect={handleCategorySelect(category)} />
))}
```

## 4. useEffect

effect 콜백과 cleanup은 모두 기명 함수로 씀. 이름이 곧 그 effect가 왜 있는지에 대한 설명이
되고, 프로파일러와 스택 트레이스에 남음.

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

이벤트 핸들러(§3)와 `useMemo`/`useCallback`의 짧은 계산식에는 적용하지 않음.
