import Footer from '../../components/Footer';
import TextButton from './components/TextButton';

function splitTextByWords(text: string) {
  const words = text
    .split(' ')
    .map((word, index) => <p key={index}>{`${word}\u00A0`}</p>);
  return words;
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen select-none bg-slate-100">
      <div className="relative z-10 flex flex-col items-start px-10 py-32 font-noto-sans-kr text-on-cream md:px-20 md:py-40 ">
        <div className="flex flex-wrap text-3xl font-extrabold leading-[1.8] md:text-5xl">
          {splitTextByWords('안녕하세요. 제 이름은')}
          <TextButton
            text={'강시운'}
            url={import.meta.env.VITE_INSTAGRAM_URL}
          />
          {splitTextByWords('이에요. 저는 현재 중앙대학교에서 주전공으로 ')}
          <TextButton
            text={'소프트웨어'}
            url={import.meta.env.VITE_GITHUB_PROFILE_URL}
          />
          {splitTextByWords(
            '를, 복수전공으로 철학을 배우고 있습니다. 제 MBTI는 INTP예요. 저는 음악 듣는 걸 좋아해요. 좋아하는 아티스트도 많습니다. 그래도 만약 누군가 저에게 그 중 단 한 명만 뽑으라고 한다면, 아마 톰 미쉬를 고르지 않을까 싶어요. 플레이리스트는 보통 힙합 및 R&B 등 흑인음악, 재즈 그리고 일렉트로닉 위주로 구성하고 있습니다. 그리고 저는',
          )}
          <TextButton text={'커피'} url={import.meta.env.VITE_NAVER_MAP_URL} />
          {splitTextByWords(
            '를 아주 좋아합니다. 집에서는 드립 커피를 직접 내려 마시고 있어요. 대한민국 각지에 있는 괜찮은 로스터리 카페들도 자주 찾아다니고 있습니다. 제 소개는 이 쯤에서 줄이겠습니다. 여기까지 찾아와주셔서 감사합니다. 좋은 하루 되세요.',
          )}
        </div>

        <Footer />
      </div>

      <div className="absolute inset-0 z-0 h-full w-full bg-primary-cream"></div>
    </div>
  );
}
