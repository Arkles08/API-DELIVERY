import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isCiPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const basePath = isCiPagesBuild && repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8010',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});
