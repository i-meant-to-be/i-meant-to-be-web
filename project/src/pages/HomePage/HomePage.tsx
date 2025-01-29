import Footer from '../../components/Footer';
import {
  GITHUB_PROFILE_URL,
  INSTAGRAM_URL,
  NAVER_MAP_URL,
} from '../../util/urls';
import GradientButton from './components/TextButton';

function splitTextByWords(text: string) {
  const words = text
    .split(' ')
    .map((word, index) => <p key={index}>{`${word}\u00A0`}</p>);
  return words;
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen select-none bg-slate-100">
      <div className="relative z-10 flex flex-col items-start px-10 py-32 font-noto-sans text-slate-200 md:px-20 md:py-40 ">
        <div className="flex flex-wrap text-3xl font-extrabold leading-[1.8] md:text-6xl">
          {splitTextByWords('안녕하세요. 제 이름은')}
          <GradientButton
            text={'강시운'}
            url={INSTAGRAM_URL}
            className="hover:text-slate-900"
          />
          {splitTextByWords('이에요. 저는 현재 중앙대학교에서 주전공으로 ')}
          <GradientButton
            text={'소프트웨어'}
            url={GITHUB_PROFILE_URL}
            className="hover:text-slate-900"
          />
          {splitTextByWords(
            '를, 복수전공으로 철학을 배우고 있습니다. 제 MBTI는 INTP예요. 저는 음악 듣는 걸 좋아해요. 좋아하는 아티스트도 많습니다. 그래도 만약 누군가 저에게 그 중 단 한 명만 뽑으라고 한다면, 아마 톰 미쉬를 고르지 않을까 싶어요. 플레이리스트는 보통 힙합 및 R&B 등 흑인음악, 재즈 그리고 일렉트로닉 위주로 구성하고 있습니다. 그리고 저는',
          )}
          <GradientButton
            text={'커피'}
            url={NAVER_MAP_URL}
            className="hover:text-slate-900"
          />
          {splitTextByWords(
            '를 아주 좋아합니다. 요즘은 집에서 드립 커피를 직접 내려 마시고 있어요. 짧지만 제 소개는 이 정도로 마무리할게요. 중간에 저와 관련된 외부 링크로 넘어가는 버튼을 몇 개 숨겨두었으니, 심심하면 찾아보셔도 좋을 것 같아요. 그럼, 여기까지 읽어주신 분들, 모두 좋은 하루 보내세요!',
          )}
        </div>

        <Footer />
      </div>

      <div className="absolute inset-0 z-0 h-full w-full bg-slate-700"></div>
    </div>
  );
}
