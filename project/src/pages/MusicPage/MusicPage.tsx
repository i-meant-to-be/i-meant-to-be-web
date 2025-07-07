import YouTube from 'react-youtube';
import Layout from '../../components/Layout';

export default function MusicPage() {
  return (
    <Layout>
      <div className="relative w-full pb-[56.25%]">
        <YouTube
          videoId="Tj-4gZ9fuGE"
          className="absolute top-0 left-0 w-full h-full"
          opts={{ width: '100%', height: '100%' }}
        />
      </div>
    </Layout>
  );
}
