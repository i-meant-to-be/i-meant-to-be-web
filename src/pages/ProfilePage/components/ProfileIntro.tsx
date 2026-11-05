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
        <p className="mt-3 md:mt-4">
          대표 경험으로 뒷받침할 수 있는 강점과 관심 직무를 짧게 작성하세요.
        </p>
      </section>
    </header>
  );
}
