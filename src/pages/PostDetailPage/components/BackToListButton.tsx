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
    <Link to={routes.POST} className={clsx(className)}>
      <BorderButton color="on-cream">
        <IoListSharp />
        목록
      </BorderButton>
    </Link>
  );
}
