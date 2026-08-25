# Project Structure

이 문서는 현재 `src/` 구조와 파일 소유권을 정의한다. 라우팅과 SEO 연동은
[`routing-and-seo.md`](routing-and-seo.md), 스타일 토큰은 [`styling.md`](styling.md)를
기준으로 해석한다.

## 1. 해석 원칙

- 이 문서는 현재 실제 구조만 설명한다. 아직 만들어지지 않은 목표 구조를 앞서 정의하지 않는다.
- 폴더가 비어 있거나 최소 구현이어도 그 자체를 문서 불일치로 보지 않는다.
- 구조가 실제로 바뀌면(파일 추가/이동) 이 문서를 함께 갱신한다.

## 2. 디렉터리 구조

```text
src/
├── components/                  # 여러 페이지가 공유하는 컴포넌트
│   ├── Layout.tsx                 # Header + children + Footer 조립, 공통 여백/배경
│   ├── Header.tsx                 # 상단 네비게이션 (NavLink 기반)
│   ├── HeaderButton.tsx           # Header 내부 버튼 UI (선택 상태 스타일)
│   ├── Footer.tsx                  # 하단 외부 링크(GitHub, Instagram)
│   └── Seo.tsx                     # 라우트별 <head> 태그 렌더링 (routing-and-seo.md 참고)
├── pages/                        # 라우트 1개 = 페이지 폴더 1개
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   └── components/            # HomePage 전용 컴포넌트
│   │       └── TextButton.tsx
│   ├── PostPage/
│   │   └── PostPage.tsx           # 현재 placeholder ("공사 중"), noindex 처리됨
│   └── MusicPage/
│       └── MusicPage.tsx
├── posts/                        # 준비 중 — 아직 PostPage와 연결되지 않은 Markdown 원고
│   └── 0001.md
├── routes/
│   ├── route.ts                   # 라우트 경로 상수 (ROOT/POST/MUSIC)
│   ├── router.tsx                 # createBrowserRouter 등록
│   └── seo.ts                     # 라우트별 SEO 데이터 단일 소스
├── index.css                     # Tailwind 진입점 + @theme 토큰
└── main.tsx                      # React root, HelmetProvider, RouterProvider, Analytics 조립
```

## 3. 컴포넌트 배치 규칙

| 컴포넌트 성격          | 위치                                  |
| ----------------------- | -------------------------------------- |
| 2개 이상 페이지가 공유   | `src/components/`                     |
| 특정 페이지에서만 사용   | `src/pages/{Page}/components/`        |
| 페이지 자체              | `src/pages/{Page}/{Page}.tsx` (같은 폴더에 `{Page}.test.tsx`) |

## 4. 아직 연결되지 않은 것

- `src/posts/0001.md` — 테스트용 Markdown 원고. `PostPage`는 아직 이 파일을 읽지 않고 고정
  문자열("공사 중")만 렌더링한다. `posts/`의 콘텐츠를 실제로 렌더링하도록 연결하기 전까지
  `PostPage`는 `noindex` 상태를 유지해야 한다 (`routing-and-seo.md` §3 참고).
