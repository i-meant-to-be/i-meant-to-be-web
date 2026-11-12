import Layout from '../components/Layout';
export default function RouteError() {
  return (
    <Layout>
      <p role="alert">페이지를 불러오지 못했습니다. 다시 시도해 주세요.</p>
      <a href="">새로고침</a>
    </Layout>
  );
}
