import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const iife = process.env.FORMAT === 'iife';

// Two passes: `vite build -c vite.lib.config.ts` (ESM: index + auto, .d.ts, ssui.css)
//             `FORMAT=iife vite build -c vite.lib.config.ts` (single script for <script src>)
export default defineConfig({
  define: { __SSUI_VERSION__: JSON.stringify(pkg.version) },
  plugins: iife ? [] : [dts({ rollupTypes: true, tsconfigPath: './tsconfig.lib.json', outDir: 'dist' })],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: !iife,
    sourcemap: true,
    cssCodeSplit: false,
    minify: 'esbuild',
    target: 'es2022',
    lib: iife
      ? { entry: 'src/auto.ts', name: 'SSUI', formats: ['iife'], fileName: () => 'ssui.iife.js' }
      // `styles` only exists to emit dist/ssui.css; its js stub is deleted after the build
      : { entry: { index: 'src/index.ts', auto: 'src/auto.ts', styles: 'src/styles/entry.ts' }, formats: ['es'], fileName: (_f, name) => `${name}.js` },
    rollupOptions: {
      output: { assetFileNames: (a) => (a.name?.endsWith('.css') ? 'ssui.css' : (a.name ?? 'asset')) },
    },
  },
});
