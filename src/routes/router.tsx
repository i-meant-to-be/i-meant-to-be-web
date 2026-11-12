import { createBrowserRouter, matchRoutes } from 'react-router-dom';
import routeObjects from './routes';
export default async function createRouter() {
  for (const { route } of matchRoutes(routeObjects, window.location) ?? []) {
    if (typeof route.lazy === 'function') {
      try {
        Object.assign(route, await route.lazy(), { lazy: undefined });
      } catch {
        // Let the router retry and render its error boundary if loading fails.
      }
    }
  }
  const router = createBrowserRouter(routeObjects);
  if (!router.state.initialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = router.subscribe((state) => {
        if (state.initialized) {
          unsubscribe();
          resolve();
        }
      });
    });
  }
  return router;
}
