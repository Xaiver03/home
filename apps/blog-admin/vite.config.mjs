import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default ({ mode }) => {
  return defineConfig({
    base: mode === "dev" ? "/" : "/admin/",
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router"],
        resolvers: [AntDesignVueResolver()],
      }),
      Components({
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `
            @use "@/assets/sass/variable.scss" as *;
            @use "@/assets/sass/mixin.scss" as *;
          `,
        },
      },
    },
    server: {
      port: 8083,
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:8086",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      minify: "terser",
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("ant-design-vue") || id.includes("@ant-design")) return "antd";
              if (id.includes("md-editor-v3") || id.includes("@vavt")) return "markdown";
              if (id.includes("json-editor") || id.includes("codemirror")) return "editor";
              if (id.includes("echarts") || id.includes("zrender")) return "charts";
              if (id.includes("vue")) return "vendor";
            }
          },
        },
      },
    },
  });
};
