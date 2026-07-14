import { defineConfig as defineViteConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const viteConfig = defineViteConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
  },
});

export default defineViteConfig(() => {
  const observabilityClientConfig =
    process.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG ??
    process.env.REACT_APP_VERCEL_OBSERVABILITY_CLIENT_CONFIG ??
    process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG ??
    '';

  const observabilityBasePath =
    process.env.VITE_VERCEL_OBSERVABILITY_BASEPATH ??
    process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH ??
    process.env.VERCEL_OBSERVABILITY_BASEPATH ??
    '';

  return mergeConfig(mergeConfig(viteConfig, vitestConfig), {
    define: {
      'process.env.REACT_APP_VERCEL_OBSERVABILITY_CLIENT_CONFIG':
        JSON.stringify(observabilityClientConfig),
      'process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH': JSON.stringify(
        observabilityBasePath,
      ),
    },
  });
});

console.log('Observability environment:', {
  vite: Boolean(process.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG),
  react: Boolean(process.env.REACT_APP_VERCEL_OBSERVABILITY_CLIENT_CONFIG),
  raw: Boolean(process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG),
});
