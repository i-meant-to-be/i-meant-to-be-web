import TextButton from './components/TextButton';

const instagramUrl = 'https://instagram.com/i.meant.to.be';
const naverMapUrl = 'https://naver.me/GL8WbbYq';
const gitHubUrl = 'https://github.com/i-meant-to-be';

function splitString(str: string) {
  return str
    .split('')
    .map((char, index) => (
      <p key={index}>
        {char === ' ' ? '\u00A0' : char === '\n' ? '\u000A' : char}
      </p>
    ));
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen select-none bg-slate-100">
      <div className="relative z-10 flex flex-wrap px-10 py-20 font-noto-sans text-4xl font-extrabold leading-[1.5] text-slate-200 md:px-20 md:py-40 md:text-6xl">
        {splitString('안녕하세요. 제 이름은 ')}
        <TextButton text={'■■■'} url={instagramUrl} />
        {splitString('이에요. 저는 중앙대학교에서 주전공으로 ')}
        <TextButton text={'컴퓨터공학'} url={gitHubUrl} />
        {splitString(
          '을, 복수전공으로 철학을 배우고 있어요.  제 MBTI는 INTP예요. 저는 음악 듣는 걸 좋아해요. 좋아하는 아티스트는 꽤 많긴 하지만, 누군가 저에게 단 한 명만 뽑으라고 한다면, 아마 톰 미쉬를 고를 것 같아요. 보통은 힙합과 R&B 등 흑인음악, 재즈와 일렉트로닉을 위주로 듣고는 해요. 그리고 ',
        )}
        <TextButton text={'커피'} url={naverMapUrl} />
        {splitString(
          '를 아주 좋아해요. 요즘은 집에서 드립 커피를 직접 내려 마시고 있어요. 마지막으로, 이 페이지는 디자인하기 귀찮아서 그냥 대충 볼드체로 갈겼어요. 제 소개는 짧지만 이 정도로 마무리할게요. 끝까지 읽어주신 당신께 감사해요. 중간에 다른 링크로 넘어가는 버튼을 몇 개 숨겨두었으니, 심심하면 찾아보셔도 좋을 것 같아요. 그럼, 좋은 하루 보내시기 바라요.',
        )}
      </div>

      <div className="absolute inset-0 z-0 h-full w-full bg-slate-700"></div>
    </div>
  );
}
