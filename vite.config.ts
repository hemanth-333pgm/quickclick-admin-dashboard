import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    proxy:
      command === 'serve'
        ? {
            '/api': {
              target: 'https://quickclick-backend-136h.onrender.com',
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
