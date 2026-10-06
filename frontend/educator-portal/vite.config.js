import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  cacheDir: '../node_modules/.vite/teacher',
  server: {
    host: '0.0.0.0',
    port: 5174,
    cors: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'framer-motion',
      'recharts'
    ]
  }
});
