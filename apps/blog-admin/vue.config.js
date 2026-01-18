const { defineConfig } = require("@vue/cli-service");
const Components = require("unplugin-vue-components/webpack");
const AutoImport = require("unplugin-auto-import/webpack");
const { AntDesignVueResolver } = require("unplugin-vue-components/resolvers");

module.exports = defineConfig({
  transpileDependencies: true,
  // Set public path for deployment under /mgmt/
  publicPath: process.env.NODE_ENV === 'pro' ? '/mgmt/' : '/',
  configureWebpack: {
    plugins: [
      // 自动按需引入 Ant Design Vue 组件
      Components({
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
      // 自动按需引入 message / notification 等 API
      AutoImport({
        resolvers: [AntDesignVueResolver()],
      }),
    ],
    // 优化chunk分割减少动态加载问题 - 更激进的合并策略
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        minSize: 0,
        maxSize: 10000000, // 10MB max size
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
            reuseExistingChunk: true
          },
          antd: {
            test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
            name: 'antd',
            chunks: 'all',
            priority: 20,
            enforce: true,
            reuseExistingChunk: true
          },
          pages: {
            test: /[\\/]src[\\/](pages|components)[\\/]/,
            name: 'pages',
            chunks: 'all',
            priority: 15,
            enforce: true,
            minChunks: 1,
            reuseExistingChunk: true
          },
          common: {
            minChunks: 1,
            name: 'common',
            chunks: 'all',
            priority: 5,
            enforce: true,
            reuseExistingChunk: true
          },
          // 新增：强制合并所有默认chunk
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
            name: 'common'
          }
        }
      }
    }
  },
  // 关闭控制台警告
  chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      });
      return definitions;
    });
  },
  css: {
    // 添加css配置，全局引入Sass全局变量和Sass全局函数
    loaderOptions: {
      // sass-loader
      scss: {
        additionalData: `
        @import '@/assets/sass/variable.scss';
        @import '@/assets/sass/mixin.scss';
        `,
      },
    },
  },
  // 关闭全屏报错覆盖
  devServer: {
    port: process.env.VUE_APP_PORT || 8080,
    client: {
      overlay: false,
    },
  },
});
