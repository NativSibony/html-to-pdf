import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: './',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HTML to PDF Converter',
      formats: ['es', 'cjs'],
      fileName: (format) => `html2pdfx.${format}.js`,
    },
    rollupOptions: {
      external: ['html2canvas', 'jsPDF'],
      output: {
        extend: true,
        globals: { html2canvas: 'html2canvas', jsPDF: 'jsPDF' },
        manualChunks(id) {
          if (id.includes('node_modules')) return id.toString().split('node_modules/')[1].split('/')[0].toString();
        },
      },
    },
    minify: 'esbuild',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  plugins: [dts({ rollupTypes: true }), visualizer()],
});
