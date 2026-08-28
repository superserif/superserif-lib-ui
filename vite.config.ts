import { defineConfig } from 'vite';
export default defineConfig({
  root: 'playground',
  publicDir: '../public',
  resolve: { alias: { '@ssui': '/../src' } },
  server: { port: 4402, strictPort: true },
});
