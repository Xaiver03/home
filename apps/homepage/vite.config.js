/* eslint-disable no-undef */
import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa"; // PWA已重新启用，但排除API路径
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // PWA已重新启用，但完全排除API路径
      VitePWA({
        registerType: "prompt",
        workbox: {
          skipWaiting: false,
          clientsClaim: false,
          cleanupOutdatedCaches: true,

          navigateFallback: '/index.html',
          navigateFallbackDenylist: [
            /^\/api/,      // API 路径
            /^\/admin/,    // 管理后台
            /^\/blog/,     // 博客前台
            /^\/about/,    // 博客-关于
            /^\/link/,     // 博客-友链
            /^\/log/,      // 博客-文章
            /^\/message/,  // 博客-留言
            /^\/reward/,   // 博客-赞赏
            /^\/_nuxt/,    // Nuxt 静态资源
            /^\/music/,    // 音乐 API
            /^\/static/,   // 静态资源
            /^\/uploads/,  // 上传文件
          ],

          // 缓存静态资源，但完全排除API
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 5000000,

          runtimeCaching: [
            // 只缓存 homepage 自己的静态资源，排除 /mgmt/ /blog/ /api/ 等路径
            {
              urlPattern: /^(?!.*\/(mgmt|blog|api|music|static)\/).*(.*?)\.(js|css)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24小时
                },
              },
            },
            {
              urlPattern: /^(?!.*\/(mgmt|blog|api|music|static)\/).*(.*?)\.(png|jpe?g|svg|gif|ico|webp)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30天
                },
              },
            },
            // 移除API缓存规则，让API请求完全绕过Service Worker
          ],
        },

        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          start_url: "/",
          display: "standalone",
          background_color: "#424242",
          theme_color: "#424242",
          icons: [
            {
              src: "/images/icon/192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: process.env.PORT || 3015,
      open: true,
      host: true,
      proxy: {
        // 代理博客前台（本地测试时为 3008，开发环境为 3004）
        '/blog': {
          target: process.env.VITE_BLOG_FRONTEND_PORT
            ? `http://localhost:${process.env.VITE_BLOG_FRONTEND_PORT}`
            : 'http://localhost:3004',
          changeOrigin: true,
        },
        // 代理音乐 API 到 3005 端口
        '/music': {
          target: process.env.VITE_MUSIC_API_PORT
            ? `http://localhost:${process.env.VITE_MUSIC_API_PORT}`
            : 'http://localhost:3005',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/music/, ''),
        },
        // 代理博客 API 到 8085 端口
        '/api': {
          target: process.env.VITE_BLOG_API_PORT
            ? `http://localhost:${process.env.VITE_BLOG_API_PORT}`
            : 'http://localhost:8085',
          changeOrigin: true,
        },
        // 代理博客管理后台到 8083 端口
        '/mgmt': {
          target: process.env.VITE_BLOG_ADMIN_PORT
            ? `http://localhost:${process.env.VITE_BLOG_ADMIN_PORT}`
            : 'http://localhost:8083',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mgmt/, '/admin'),
        },
      },
      fs: {
        // 允许访问项目根目录之外的文件（解决路径中有空格的问题）
        strict: false,
        allow: ['..']
      }
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData: `@use "./src/style/global.scss" as *;`,
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
    },
  });
