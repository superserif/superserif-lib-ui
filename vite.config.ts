import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Dev + docs site (playground). The library itself builds with vite.lib.config.ts.
export default defineConfig({
  root: 'playground',
  publicDir: '../public',
  resolve: { alias: { '@ssui': '/../src' } },
  server: { port: 4402, strictPort: true },
  build: {
    outDir: '../dist-playground',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'playground/index.html'),
        starter: resolve(__dirname, 'playground/starter.html'),
        prototype: resolve(__dirname, 'playground/prototype.html'),
      },
    },
  },
});
