import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { Analytics, track } from '@vercel/analytics/react';

function RouteTracker() {
  useEffect(() => {
    // 라우트 변경 시마다 pageview 전송
    const unsubscribe = router.subscribe((state) => {
      track('pageview', { path: state.location.pathname });
    });

    return () => unsubscribe();
  }, []);

  return null;
}

export function App() {
  return (
    <StrictMode>
      <RouterProvider router={router} />
      <RouteTracker />
      <Analytics scriptSrc="/assets/js/va.js" endpoint="/api/va/event" />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
