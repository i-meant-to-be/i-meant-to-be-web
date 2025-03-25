import { IoLogoGithub, IoLogoInstagram } from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="pt-20">
      <div className="flex flex-col space-y-3 items-start">
        <div className="flex flex-row space-x-1 text-on-cream">
          <button
            onClick={() =>
              window.open(import.meta.env.VITE_GITHUB_PROFILE_URL, '_blank')
            }
          >
            <IoLogoGithub size={32} className="hover:text-on-cream-enhance" />
          </button>
          <button
            onClick={() =>
              window.open(import.meta.env.VITE_INSTAGRAM_URL, '_blank')
            }
          >
            <IoLogoInstagram
              size={32}
              className="hover:text-on-cream-enhance"
            />
          </button>
        </div>

        <div className="flex flex-wrap font-normal text-xs ">
          <p>이 웹 페이지는 </p>
          <button
            onClick={() =>
              window.open(import.meta.env.VITE_GITHUB_REPO_URL, '_blank')
            }
            className="underline hover:text-on-cream-enhance hover:font-bold"
          >
            <p>이 GitHub 저장소</p>
          </button>
          <p>에서 개발, 관리 및 배포되고 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}
