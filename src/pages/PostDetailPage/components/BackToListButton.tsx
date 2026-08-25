import clsx from 'clsx';
import { Link } from 'react-router-dom';
import BorderButton from '../../../components/BorderButton';
import routes from '../../../routes/route';

interface BackToListButtonProps {
  className?: string;
}

export default function BackToListButton({ className }: BackToListButtonProps) {
  return (
    <Link to={routes.POST} className={clsx(className)}>
      <BorderButton color="on-cream">← 목록으로 돌아가기</BorderButton>
    </Link>
  );
}
