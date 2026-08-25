import { useEffect, useRef, useState } from 'react';
import {
  IoCheckmarkSharp,
  IoCloseSharp,
  IoShareSocialSharp,
} from 'react-icons/io5';
import BorderButton from '../../../components/BorderButton';

const RESET_DELAY_MS = 2000;

type Status = 'idle' | 'copied' | 'failed';

export default function ShareButton() {
  const [status, setStatus] = useState<Status>('idle');
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimeoutRef.current), []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => setStatus('idle'), RESET_DELAY_MS);
  };

  return (
    <button type="button" onClick={handleClick} aria-label="게시글 링크 복사">
      <BorderButton color="on-cream">
        <span className="grid">
          <span
            className={`col-start-1 row-start-1 flex flex-row items-center justify-center gap-2 ${
              status === 'idle' ? '' : 'invisible'
            }`}
          >
            <IoShareSocialSharp className="h-full" aria-hidden="true" />
            공유
          </span>
          <span
            className={`col-start-1 row-start-1 flex flex-row items-center justify-center gap-2 ${
              status === 'copied' ? '' : 'invisible'
            }`}
          >
            <IoCheckmarkSharp className="h-full" aria-hidden="true" />
            복사됨
          </span>
          <span
            className={`col-start-1 row-start-1 flex flex-row items-center justify-center gap-2 ${
              status === 'failed' ? '' : 'invisible'
            }`}
          >
            <IoCloseSharp className="h-full" aria-hidden="true" />
            복사 실패
          </span>
        </span>
      </BorderButton>
    </button>
  );
}
