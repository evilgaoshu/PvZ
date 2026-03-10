import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@game': path.resolve(__dirname, 'src/game'),
      '@entities': path.resolve(__dirname, 'src/game/entities'),
      '@systems': path.resolve(__dirname, 'src/game/systems'),
      '@managers': path.resolve(__dirname, 'src/game/managers'),
      '@config': path.resolve(__dirname, 'src/game/config'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: true
  }
});
