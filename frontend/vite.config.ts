import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const backendEnv = loadEnv(mode, path.resolve(__dirname, '../backend'), '');
  const backendPort =
    rootEnv.VITE_BACKEND_PORT || backendEnv.PORT || rootEnv.PORT || '8787';
  // eslint-disable-next-line no-console
  console.log(`[vite] Proxy /api → http://localhost:${backendPort}`);

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('axios')) return 'vendor-http';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
          },
        },
      },
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: `http://localhost:${backendPort}`, changeOrigin: true },
      },
    },
  };
});
