import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 8080 est pris par Docker (designpulse)
        changeOrigin: true,
      },
    },
  },
});