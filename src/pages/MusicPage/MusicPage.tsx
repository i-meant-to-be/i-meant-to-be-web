import Layout from '../../components/Layout';

export default function MusicPage() {
  return (
    <Layout>
      <div className="relative w-full aspect-video">
        <iframe
          src="https://www.youtube-nocookie.com/embed/Tj-4gZ9fuGE?si=ZCnRzURS_Hn4vzsg"
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen={true}
          className="absolute top-0 left-0 w-full h-full bg-black"
        ></iframe>
      </div>
    </Layout>
  );
}
