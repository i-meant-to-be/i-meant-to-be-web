import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { Analytics } from '@vercel/analytics/react';
import { pageview } from '@vercel/analytics';

function RouteTracker() {
  useEffect(() => {
    // 라우트 변경 시마다 pageview 전송
    const unsubscribe = router.subscribe((state) => {
      const matchedRoute = state.matches.at(-1)?.route.path ?? null;

      pageview({
        route: matchedRoute,
        path: state.location.pathname,
      });
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
      <Analytics
        scriptSrc="/monitoring/script.js"
        viewEndpoint="/monitoring/view"
        eventEndpoint="/monitoring/event"
      />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
