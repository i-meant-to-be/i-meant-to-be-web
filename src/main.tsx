import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import createRouter from './routes/router';
import { Analytics } from '@vercel/analytics/react';

export function App({
  router,
}: {
  router: Awaited<ReturnType<typeof createRouter>>;
}) {
  return (
    <StrictMode>
      <RouterProvider router={router} />
      <Analytics
        configString={import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG}
      />
    </StrictMode>
  );
}

async function bootstrap() {
  const router = await createRouter();
  const container = document.getElementById('root')!;
  if (container.hasChildNodes())
    hydrateRoot(container, <App router={router} />);
  else createRoot(container).render(<App router={router} />);
}
void bootstrap();
