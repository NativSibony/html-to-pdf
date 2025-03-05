import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'HTML PDF Converter',
      fileName: 'html-pdf-converter',
    },
    rollupOptions: {
      output: {
        globals: {
          html2canvas: 'html2canvas',
          jsPDF: 'jsPDF',
        },
      },
    },
    minify: true,
    emptyOutDir: true,
    outDir: 'dist',
  },
  plugins: [dts()],
  worker: { format: 'es' },
});
