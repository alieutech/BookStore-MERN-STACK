import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
    proxy: {
      "/books": {
        target: "http://localhost:3333", // Backend server 
        changeOrigin: true, 
      },
    },
  },
});
