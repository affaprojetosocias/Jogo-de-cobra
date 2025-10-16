import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  esbuild: {
    target: 'es2018'
  },
  build: {
    target: 'es2018'
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
});
