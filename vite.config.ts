import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/PvZ/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境关闭 sourcemap 减小体积
    minify: 'terser',
    chunkSizeWarningLimit: 1000, // 提升警告阈值到 1000kB
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'] // 移除更多的调试日志
      },
      format: {
        comments: false // 移除所有注释
      }
    },
    rollupOptions: {
      output: {
        // 手动分包逻辑
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('phaser')) {
              return 'phaser'; // Phaser 独立打包，因为它很大
            }
            return 'vendor'; // 其他第三方库打包到 vendor
          }
        },
        // 资源文件名优化
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
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
