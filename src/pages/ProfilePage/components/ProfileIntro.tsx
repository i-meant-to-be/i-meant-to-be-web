import TextButton from '../../../components/TextButton';

export default function ProfileIntro() {
  const email = import.meta.env.VITE_CONTACT_EMAIL;

  return (
    <header>
      <p className="mb-3 text-sm text-indigo md:mb-4 md:text-base">프로필</p>
      <h1 className="text-3xl font-bold text-on-cream-enhanced md:text-5xl">
        강시운
      </h1>
      <p className="mt-3 text-sm text-on-cream/70 md:mt-4 md:text-base">
        Shawn Kang
      </p>
      <nav
        aria-label="프로필 외부 링크"
        className="mt-4 flex flex-wrap gap-4 md:mt-6 md:gap-6"
      >
        <TextButton
          text="GitHub"
          url={import.meta.env.VITE_GITHUB_PROFILE_URL}
        />
        {email && <TextButton text="Mail" url={`mailto:${email}`} />}
      </nav>
      <section aria-labelledby="profile-introduction" className="mt-8 md:mt-12">
        <h2 id="profile-introduction" className="text-xl font-bold md:text-2xl">
          소개
        </h2>
        <p className="mt-3 md:hidden">
          Android를 중심으로 앱 구조와 성능을 개선해왔습니다. React 경험을
          Compose 웹 카탈로그와 오프라인 앱 개발에 연결해, 사용자와 동료가 겪는
          문제를 해결했습니다.
        </p>
        <div className="hidden mt-3 md:mt-4 md:block space-y-2 md:space-y-3">
          <p className="font-semibold">
            안 되면 되게 하면 됩니다. 경계를 넘나드는 접근만이 이를 가능케
            한다고 생각합니다.
          </p>
          <p>
            Android에 강한 기반을 둔 개발자로서, 유연하고 확장성이 좋은
            아키텍처를 구성해왔고 비동기/병렬 처리 등을 통한 성능 개선을
            경험했습니다. React를 통해서는 Android로 해결하기 어려운 문제를 다룰
            수 있었고, React에서의 경험을 Android에 접목하기도 했습니다.
          </p>
          <p>
            토론을 좋아합니다. 사람들과 서로의 의견을 가감없이 나눌 때 즐거움을
            느끼고, 다양한 관점을 통해 당신과 나의 시선을 함께 넓혀갈 수 있다고
            믿습니다.
          </p>
        </div>
      </section>
    </header>
  );
}
