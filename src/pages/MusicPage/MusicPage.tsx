import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';

export default function MusicPage() {
  return (
    <Layout>
      <Seo path={routes.MUSIC} />
      <h1 className="sr-only">음악</h1>
      <div className="relative w-full aspect-video">
        <iframe
          src="https://www.youtube-nocookie.com/embed/Tj-4gZ9fuGE?si=ZCnRzURS_Hn4vzsg"
          title="음악 플레이리스트 YouTube 영상"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen={true}
          className="absolute top-0 left-0 w-full h-full bg-black"
        ></iframe>
      </div>
    </Layout>
  );
}
