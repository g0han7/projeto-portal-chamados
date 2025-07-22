import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Strict JSX parsing
    jsx: 'automatic',
    jsxDev: true,
  },
  build: {
    // Strict build settings to catch JSX errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Fail build on JSX syntax errors
        if (warning.code === 'PARSE_ERROR') {
          throw new Error(warning.message);
        }
        warn(warning);
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
