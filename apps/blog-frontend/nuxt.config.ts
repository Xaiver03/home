import { config } from 'dotenv'

console.log('config',process.env.NUXT_PUBLIC_ENV);

config({ path: `../.env.${process.env.NUXT_PUBLIC_ENV}` })

const defaultApiUrl =
  process.env.NUXT_PUBLIC_ENV === 'dev'
    ? 'http://localhost:8086/api'
    : 'https://xiangleideng.site/api';
const defaultStorageUrl = process.env.NUXT_PUBLIC_ENV === 'dev' ? '' : '/uploads';

export default defineNuxtConfig({
  // 局域网其他设备可查看
  devServer: {
    host: "0.0.0.0",
    // port: 8500
  },
  ssr: true,
  compatibilityDate: "2025-10-06",
  app: {
    baseURL: '/blog/',
    head: {
      title: process.env.NUXT_PUBLIC_SITE_NAME || "邓湘雷の博客",
      meta: [
        {
          name: "description",
          content: process.env.NUXT_PUBLIC_SITE_DESC || "邓湘雷的个人博客，分享技术、生活与思考",
        },
      ],
    },
  },
  devtools: { enabled: true },
  runtimeConfig: {
    // 运行时配置项（全局变量）
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || defaultApiUrl, // 后台url
      storageUrl: process.env.NUXT_PUBLIC_STORAGE_URL || defaultStorageUrl,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "", // 本站地址
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || "邓湘雷の博客", // 站点名称
      siteDesc: process.env.NUXT_PUBLIC_SITE_DESC || "邓湘雷的个人博客，分享技术、生活与思考", // 站点描述
    },
  },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxtjs/tailwindcss",
    "@ant-design-vue/nuxt",
    "@vueuse/motion/nuxt",
  ],
  sitemap: {
    siteUrl: process.env.NUXT_PUBLIC_BASE_URL || "https://xiangleideng.site",
    defaults: {
      changefreq: "weekly",
      priority: 0.7,
    },
    urls: async () => {
      const { getSitemapUrls } = await import("./server/utils/sitemap-urls");
      return await getSitemapUrls();
    },
  },
  robots: {
    robotsTxt: false,  // 禁用 robots.txt 生成（因为使用了 baseURL）
    rules: [
      {
        UserAgent: "*",
        Allow: "/",
        Disallow: [],
      },
    ],
    sitemap: `${process.env.NUXT_PUBLIC_BASE_URL}/sitemap.xml`,
  },
  css: [
    "@/assets/scss/index.scss", // 引入 SCSS 入口文件
  ],
  plugins: [{ src: "@/plugins/mdEditorEmoji.client.js", mode: "client" }],
  nitro: {
    externals: {
      inline: ["tslib"],
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1200,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: '@use "~/assets/scss/variables.scss" as *;', // 在所有 SCSS 文件中引入变量文件
        },
      },
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000, // 轮询间隔 ms
      },
    },
  },
  hooks: {
    "build:before": () => {
      console.log(
        "-----process.env.NUXT_PUBLIC_ENV-----\n",
        process.env.NUXT_PUBLIC_ENV
      ); // 打印环境
      console.log(
        "-----process.env.NUXT_PUBLIC_API_URL-----\n",
        process.env.NUXT_PUBLIC_API_URL
      ); // 打印环境
    },
  },
});
