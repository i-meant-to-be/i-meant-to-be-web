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
      '철학을 복수전공한 Android 개발자의 개인 웹 사이트. 개발, 커피, 그리고 음악에 대해 씁니다.',
  },
  [routes.POST]: {
    title: '게시글',
    description: '내가 공부하고 만든 것들에 대한 기록들.',
  },
  [routes.MUSIC]: {
    title: '음악',
    description: '내가 좋아하는 음악을 모아둔 곳.',
  },
};

export default seo;
