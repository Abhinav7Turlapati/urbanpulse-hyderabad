import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to parse .geojson files as JSON in Vite/Rollup
const geojsonPlugin = () => ({
  name: 'vite-plugin-geojson',
  transform(src: string, id: string) {
    if (id.endsWith('.geojson')) {
      return {
        code: `export default ${JSON.stringify(JSON.parse(src))};`,
        map: null
      };
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), geojsonPlugin()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-map': ['maplibre-gl'],
          'vendor-charts': ['recharts'],
          'vendor-react': ['react', 'react-dom']
        }
      }
    }
  }
});
