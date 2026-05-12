import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// the WP plugin loads exactly two files, so we shape the build output
// to land at hidden-deals.js + hidden-deals.css with stable names.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: '../plugin/hidden-deals/build',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'hidden-deals.js',
        chunkFileNames: 'hidden-deals.js',
        assetFileNames: (info) =>
          info.name?.endsWith('.css') ? 'hidden-deals.css' : 'assets/[name][extname]',
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});
