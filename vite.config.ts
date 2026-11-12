import { readFile } from 'node:fs/promises';
import { parsePost } from './src/posts/parsePost.ts';
import { defineConfig as defineViteConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const viteConfig = defineViteConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'post-metadata',
      async load(id) {
        if (!id.endsWith('.md?post-meta')) return;
        const file = id.slice(0, -'?post-meta'.length);
        this.addWatchFile(file);
        const { meta } = parsePost(await readFile(file, 'utf8'));
        return `export default ${JSON.stringify(meta)}`;
      },
    },
  ],
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

export default mergeConfig(viteConfig, vitestConfig);
