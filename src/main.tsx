import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
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

const container = document.getElementById('root')!;

// 프로덕션 빌드는 `scripts/prerender.mjs`가 미리 마크업을 채워둔다.
// `vite dev`처럼 비어 있는 경우에는 일반 CSR로 마운트한다.
if (container.hasChildNodes()) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
