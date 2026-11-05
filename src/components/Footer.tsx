import { IoLogoGithub, IoLogoInstagram } from 'react-icons/io5';
import IconButton from './IconButton';

export default function Footer() {
  const handleGithubRepoClick = () =>
    window.open(import.meta.env.VITE_GITHUB_REPO_URL, '_blank', 'noopener');

  return (
    <footer className="mt-32">
      <div className="flex flex-col space-y-3 items-start">
        <div className="flex flex-row space-x-1 text-on-cream">
          <IconButton
            label="GitHub"
            url={import.meta.env.VITE_GITHUB_PROFILE_URL}
            icon={IoLogoGithub}
          />
          <IconButton
            label="Instagram"
            url={import.meta.env.VITE_INSTAGRAM_URL}
            icon={IoLogoInstagram}
          />
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
