import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <Layout>
      <Seo path={pathname} />
      <h1 className="text-2xl font-bold md:text-3xl">
        페이지를 찾을 수 없어요.
      </h1>
      <nav className="mt-8 flex flex-wrap gap-4 md:mt-10" aria-label="돌아가기">
        <Link
          to={routes.ROOT}
          className="text-indigo underline hover:text-indigo-enhanced"
        >
          홈으로 돌아가기
        </Link>
        <Link
          to={routes.POST}
          className="text-indigo underline hover:text-indigo-enhanced"
        >
          게시글 목록으로 돌아가기
        </Link>
      </nav>
    </Layout>
  );
}
