import routes from './route';

interface RouteSeo {
  title: string;
  description: string;
  noindex?: boolean;
}

const seo: Record<string, RouteSeo> = {
  [routes.ROOT]: {
    title: 'imeanttobe',
    description:
      '소프트웨어와 철학을 공부한 강시운의 개인 웹사이트. 안드로이드 개발, 커피, 그리고 음악에 대해 씁니다.',
  },
  [routes.POST]: {
    title: '게시글',
    description:
      '안드로이드와 Jetpack Compose, Kotlin, CI, 그리고 철학까지 — 공부하고 만든 것들에 대한 기록.',
  },
  [routes.MUSIC]: {
    title: '음악',
    description:
      '힙합과 R&B, 재즈, 일렉트로닉 위주로 듣습니다. 좋아하는 아티스트와 앨범을 모아둔 곳.',
  },
};

export default seo;
