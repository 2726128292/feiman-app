import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'unplugin-vue-dev-locator/vite'
import traeBadgePlugin from 'vite-plugin-trae-solo-badge'

// https://vite.dev/config/
export default defineConfig({
  base: '/feiman-app/',
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 核心单独打包（变化频率低）
          'vendor-vue': ['vue', 'vue-router'],
          // 图标库单独打包（lucide-vue-next 较大）
          'vendor-icons': ['lucide-vue-next'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'esbuild',
  },
  plugins: [
    vue(),
    Inspector(),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#app',
    }),
    // ====== 功能22：PWA 完整化配置 ======
    // 如需启用，请先安装依赖：npm install vite-plugin-pwa -D
    // import { VitePWA } from 'vite-plugin-pwa'
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'vue.svg'],
    //   manifest: {
    //     name: '费曼学习法',
    //     short_name: '费曼学习',
    //     description: '把知识讲明白，才是真的学会',
    //     theme_color: '#4F6EF7',
    //     background_color: '#f8fafc',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       { src: 'vue.svg', sizes: '192x192', type: 'image/svg+xml' },
    //       { src: 'vue.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
    //     ],
    //     categories: ['education', 'productivity'],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    //         handler: 'CacheFirst',
    //         options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
    //       },
    //     ],
    //   },
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ 定义 @ = src
    },
  },
})
