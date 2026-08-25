import { useEffect, useRef, useState } from 'react';
import { IoCheckmarkSharp, IoShareSocialSharp } from 'react-icons/io5';
import BorderButton from '../../../components/BorderButton';

const RESET_DELAY_MS = 2000;

export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimeoutRef.current), []);

  const handleClick = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => setCopied(false), RESET_DELAY_MS);
  };

  return (
    <button type="button" onClick={handleClick} aria-label="게시글 링크 복사">
      <BorderButton color="on-cream">
        <span className="grid">
          <span
            className={`col-start-1 row-start-1 flex flex-row items-center justify-center gap-2 ${
              copied ? 'invisible' : ''
            }`}
          >
            <IoShareSocialSharp className="h-full" aria-hidden="true" />
            공유
          </span>
          <span
            className={`col-start-1 row-start-1 flex flex-row items-center justify-center gap-2 ${
              copied ? '' : 'invisible'
            }`}
          >
            <IoCheckmarkSharp className="h-full" aria-hidden="true" />
            복사됨
          </span>
        </span>
      </BorderButton>
    </button>
  );
}
