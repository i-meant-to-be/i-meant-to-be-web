import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import routes from './route';
import PostPage from '../pages/PostPage/PostPage';
import PostDetailPage from '../pages/PostDetailPage/PostDetailPage';
import MusicPage from '../pages/MusicPage/MusicPage';

const router = createBrowserRouter([
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
]);

export default router;
