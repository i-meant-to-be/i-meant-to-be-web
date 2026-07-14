import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { Analytics } from '@vercel/analytics/react';

export function App() {
  return (
    <StrictMode>
      <RouterProvider router={router} />
      <Analytics
        configString={
          import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG
        }
      />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
