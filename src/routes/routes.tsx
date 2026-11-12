import type { RouteObject } from 'react-router-dom';
import routes from './route';
import ScrollToTop from './ScrollToTop';
import RouteError from './RouteError';

/**
 * 라우트 정의의 단일 소스. 브라우저(`router.tsx`)와 프리렌더
 * (`src/entry-server.tsx`)가 같은 배열을 공유한다.
 */
const routeObjects: RouteObject[] = [
  {
    id: 'root',
    element: <ScrollToTop />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <p role="status">불러오는 중…</p>,
    children: [
      {
        path: routes.ROOT,
        id: 'HomePage',
        lazy: async () => {
          const module = await import('../pages/HomePage/HomePage');
          return { Component: module.default };
        },
      },
      {
        path: routes.PROFILE,
        id: 'ProfilePage',
        lazy: async () => {
          const module = await import('../pages/ProfilePage/ProfilePage');
          return { Component: module.default };
        },
      },
      {
        path: routes.POST,
        id: 'PostPage',
        lazy: async () => {
          const module = await import('../pages/PostPage/PostPage');
          return { Component: module.default };
        },
      },
      {
        path: routes.POST_DETAIL,
        id: 'PostDetailPage',
        lazy: async () => {
          const [module, { loader }] = await Promise.all([
            import('../pages/PostDetailPage/PostDetailPage'),
            import('../posts/loader'),
          ]);
          return { Component: module.default, loader };
        },
      },
      {
        path: routes.MUSIC,
        id: 'MusicPage',
        lazy: async () => {
          const module = await import('../pages/MusicPage/MusicPage');
          return { Component: module.default };
        },
      },
      {
        path: '*',
        id: 'NotFoundPage',
        lazy: async () => {
          const module = await import('../pages/NotFoundPage/NotFoundPage');
          return { Component: module.default };
        },
      },
    ],
  },
];

export default routeObjects;
