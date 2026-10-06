import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite/student',
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'framer-motion',
      'recharts',
      'katex',
      'marked'
    ]
  }
});

