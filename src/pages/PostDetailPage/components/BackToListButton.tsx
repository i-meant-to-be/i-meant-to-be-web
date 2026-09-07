import clsx from 'clsx';
import { Link } from 'react-router-dom';
import BorderButton from '../../../components/BorderButton';
import routes from '../../../routes/route';
import { IoListSharp } from 'react-icons/io5';

interface BackToListButtonProps {
  className?: string;
}

export default function BackToListButton({ className }: BackToListButtonProps) {
  return (
    <Link
      to={routes.POST}
      aria-label="게시글 목록으로 돌아가기"
      className={clsx(className)}
    >
      <BorderButton color="on-cream">
        <IoListSharp aria-hidden="true" />
        <span className="hidden md:inline">목록</span>
      </BorderButton>
    </Link>
  );
}
