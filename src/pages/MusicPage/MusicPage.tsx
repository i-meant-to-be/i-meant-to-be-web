import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';
import seo from '../../routes/seo';

export default function MusicPage() {
  return (
    <Layout>
      <Seo path={routes.MUSIC} />
      <h1 className="text-4xl font-bold break-keep md:text-5xl">음악</h1>
      <p className="mt-4 break-keep md:mt-6 md:text-lg">
        {seo[routes.MUSIC].description}
      </p>
      <div className="relative mt-8 w-full aspect-video md:mt-10">
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
