import routes from './route';

interface RouteSeo {
  title: string;
  description: string;
  noindex?: boolean;
}

const seo: Record<string, RouteSeo> = {
  [routes.ROOT]: {
    title: 'imeanttobe',
    description: 'I meant to be <T>.',
  },
  [routes.POST]: {
    title: '게시글',
    description: '흥미로울 게시글들 목록.',
  },
  [routes.MUSIC]: {
    title: '음악',
    description: '내가 좋아하는 음악.',
  },
};

export default seo;
