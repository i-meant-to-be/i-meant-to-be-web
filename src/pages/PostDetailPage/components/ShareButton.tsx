import { useEffect, useRef, useState } from 'react';
import {
  IoCheckmarkSharp,
  IoCloseSharp,
  IoShareSocialSharp,
} from 'react-icons/io5';
import BorderButton from '../../../components/BorderButton';

const RESET_DELAY_MS = 2000;

const STATUS_CONTENT_CLASS_NAME =
  'flex flex-row items-center justify-center gap-2';

type Status = 'idle' | 'copied' | 'failed';

export default function ShareButton() {
  const [status, setStatus] = useState<Status>('idle');
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(function cancelPendingResetOnUnmount() {
    return function clearResetTimeout() {
      clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(
      () => setStatus('idle'),
      RESET_DELAY_MS,
    );
  };

  return (
    <button
      type="button"
      onClick={handleShareClick}
      aria-label="게시글 링크 복사"
    >
      <BorderButton color="on-cream">
        {status === 'idle' && (
          <span className={STATUS_CONTENT_CLASS_NAME}>
            <IoShareSocialSharp className="h-full" aria-hidden="true" />
            <span className="hidden md:inline">공유</span>
          </span>
        )}
        {status === 'copied' && (
          <span className={STATUS_CONTENT_CLASS_NAME}>
            <IoCheckmarkSharp className="h-full" aria-hidden="true" />
            <span className="hidden md:inline">복사됨</span>
          </span>
        )}
        {status === 'failed' && (
          <span className={STATUS_CONTENT_CLASS_NAME}>
            <IoCloseSharp className="h-full" aria-hidden="true" />
            <span className="hidden md:inline">복사 실패</span>
          </span>
        )}
      </BorderButton>
    </button>
  );
}
