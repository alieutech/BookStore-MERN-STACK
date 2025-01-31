import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      "/books": {
        target: "http://localhost:3333", // Backend server 
        changeOrigin: true,
      },
    },
  },
  build: { 
    chunkSizeWarningLimit: 1000, // Increasing the chunk size limit to 1000KB
  },
});
