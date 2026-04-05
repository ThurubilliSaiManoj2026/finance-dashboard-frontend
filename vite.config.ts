import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ESM-safe path alias: fileURLToPath + URL replaces __dirname,
      // which is not available in native ESM ("type": "module" in package.json).
      // @types/node provides the URL and fileURLToPath types.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts':       ['recharts'],
          'utils':        ['date-fns', 'lucide-react', 'zustand'],
        },
      },
    },
  },
});