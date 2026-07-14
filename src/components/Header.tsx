import {
  IoMusicalNotesSharp,
  IoPencilSharp,
  IoPersonSharp,
} from 'react-icons/io5';
import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import routes from '../routes/route';
import HeaderButton from './HeaderButton';

type HeaderLinkProps = PropsWithChildren<{
  label: string;
  to: string;
}>;

function HeaderLink(props: HeaderLinkProps) {
  const { children, label, to } = props;

  return (
    <NavLink aria-label={label} to={to}>
      {({ isActive }) => (
        <HeaderButton onSelected={isActive}>{children}</HeaderButton>
      )}
    </NavLink>
  );
}

export default function Header() {
  return (
    <div className="flex flex-row justify-between mb-32">
      <HeaderLink label="홈" to={routes.ROOT}>
        <IoPersonSharp aria-hidden="true" className="size-full" />
      </HeaderLink>

      <section className="flex flex-row space-x-4">
        <HeaderLink label="게시글" to={routes.POST}>
          <IoPencilSharp aria-hidden="true" className="size-full" />
        </HeaderLink>

        <HeaderLink label="음악" to={routes.MUSIC}>
          <IoMusicalNotesSharp aria-hidden="true" className="size-full" />
        </HeaderLink>
      </section>
    </div>
  );
}
