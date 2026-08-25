import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';

export default function PostPage() {
  return (
    <Layout>
      <Seo path={routes.POST} />
      <h1>공사 중</h1>
    </Layout>
  );
}
