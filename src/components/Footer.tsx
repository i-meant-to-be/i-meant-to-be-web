import { IoLogoGithub, IoLogoInstagram } from 'react-icons/io5';

export default function Footer() {
  const handleGithubProfileClick = () =>
    window.open(import.meta.env.VITE_GITHUB_PROFILE_URL, '_blank', 'noopener');
  const handleInstagramClick = () =>
    window.open(import.meta.env.VITE_INSTAGRAM_URL, '_blank', 'noopener');
  const handleGithubRepoClick = () =>
    window.open(import.meta.env.VITE_GITHUB_REPO_URL, '_blank', 'noopener');

  return (
    <footer className="mt-32">
      <div className="flex flex-col space-y-3 items-start">
        <div className="flex flex-row space-x-1 text-on-cream">
          <button onClick={handleGithubProfileClick}>
            <IoLogoGithub size={32} className="hover:text-on-cream-enhanced" />
          </button>
          <button onClick={handleInstagramClick}>
            <IoLogoInstagram
              size={32}
              className="hover:text-on-cream-enhanced"
            />
          </button>
        </div>

        <div className="flex flex-wrap font-normal text-xs ">
          <p>이 웹 페이지는 </p>
          <button
            onClick={handleGithubRepoClick}
            className="underline hover:text-on-cream-enhanced hover:font-bold"
          >
            <p>이 GitHub 저장소</p>
          </button>
          <p>에서 개발, 관리 및 배포되고 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}
