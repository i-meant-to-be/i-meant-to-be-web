import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(
    function scrollToPageTop() {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    },
    [pathname],
  );

  return <Outlet />;
}
