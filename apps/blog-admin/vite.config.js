import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default ({ mode }) => {
  return defineConfig({
    base: mode === 'dev' ? '/' : '/mgmt/',
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        resolvers: [AntDesignVueResolver()],
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({ importStyle: false }),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/sass/variable.scss";
            @import "@/assets/sass/mixin.scss";
          `,
        },
      },
    },
    server: {
      port: 8083,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8086',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'vuex'],
            antd: ['ant-design-vue'],
          },
        },
      },
    },
  })
}
