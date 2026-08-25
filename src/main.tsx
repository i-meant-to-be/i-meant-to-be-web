import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import router from './routes/router';
import { Analytics } from '@vercel/analytics/react';

export function App() {
  return (
    <StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
      <Analytics
        configString={
          import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG
        }
      />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
