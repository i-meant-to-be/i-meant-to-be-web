import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  IoCheckmarkSharp,
  IoCloseSharp,
  IoShareSocialSharp,
} from 'react-icons/io5';
import BorderButton from '../../../components/BorderButton';

const RESET_DELAY_MS = 2000;

/** 세 상태 레이어를 같은 칸에 겹쳐 두고 보이는 하나만 남긴다 — 버튼 폭이 흔들리지 않는다. */
const STATUS_LAYER =
  'col-start-1 row-start-1 flex flex-row items-center justify-center gap-2';

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

  const statusLayerClassName = (layer: Status) =>
    clsx(STATUS_LAYER, status !== layer && 'invisible');

  return (
    <button
      type="button"
      onClick={handleShareClick}
      aria-label="게시글 링크 복사"
    >
      <BorderButton color="on-cream">
        <span className="grid">
          <span className={statusLayerClassName('idle')}>
            <IoShareSocialSharp className="h-full" aria-hidden="true" />
            공유
          </span>
          <span className={statusLayerClassName('copied')}>
            <IoCheckmarkSharp className="h-full" aria-hidden="true" />
            복사됨
          </span>
          <span className={statusLayerClassName('failed')}>
            <IoCloseSharp className="h-full" aria-hidden="true" />
            복사 실패
          </span>
        </span>
      </BorderButton>
    </button>
  );
}
