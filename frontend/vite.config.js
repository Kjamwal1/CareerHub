import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'https://careerhub25.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Maps @ to the src directory
    },
  },
  build: {
    rollupOptions: {
      external: [], // Explicitly include all dependencies (optional, should not be needed)
    },
  },
});