import type { RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import PostPage from '../pages/PostPage/PostPage';
import PostDetailPage from '../pages/PostDetailPage/PostDetailPage';
import MusicPage from '../pages/MusicPage/MusicPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
import routes from './route';

/**
 * 라우트 정의의 단일 소스. 브라우저(`router.tsx`)와 프리렌더
 * (`src/entry-server.tsx`)가 같은 배열을 공유한다.
 */
const routeObjects: RouteObject[] = [
  {
    path: routes.ROOT,
    element: <HomePage />,
  },
  {
    path: routes.POST,
    element: <PostPage />,
  },
  {
    path: routes.POST_DETAIL,
    element: <PostDetailPage />,
  },
  {
    path: routes.MUSIC,
    element: <MusicPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routeObjects;
