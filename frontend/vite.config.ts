import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/books": {
        target: ["https://bookstore-mern-stack-qi7g.onrender.com/", "http://localhost:3333"], // Backend server 
        changeOrigin: true,
      },
    },
  },
  build: { 
    chunkSizeWarningLimit: 1000, // Increasing the chunk size limit to 1000KB
  },
});
