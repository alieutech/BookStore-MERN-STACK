import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where the dev server forwards API requests. In docker-compose this is the backend service.
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:3333';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/books': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/auth': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/reports': {
        target: apiTarget,
        changeOrigin: true,
      },
      // API only: the order pages in the app live under /my-orders and /admin/orders
      '/orders': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increasing the chunk size limit to 1000KB
  },
});
