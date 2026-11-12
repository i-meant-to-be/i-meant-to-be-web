import { useEffect } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigation = useNavigation();

  useEffect(
    function scrollToPageTop() {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    },
    [pathname],
  );

  return (
    <>
      {navigation.state !== 'idle' && (
        <p
          role="status"
          className="fixed top-0 right-0 z-50 bg-cream p-2 text-sm"
        >
          불러오는 중…
        </p>
      )}
      <Outlet />
    </>
  );
}
