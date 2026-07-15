import { createApp } from "vue";
// 引入app组件
import App from "./App.vue";
// 引入路由
import router from "./router";
// 引入Sass的入口文件
import "./assets/sass/index.scss";
// 引入vuex
import store from "./store";
// 引入接口
import api from "./api/api.js";
import { getToken, setToken } from "./utils/auth";
import { applyThemeVars, getStoredTheme } from "@xld/design-tokens";

// 在 app 挂载前立即初始化主题 CSS 变量，防止首屏样式闪烁
applyThemeVars(getStoredTheme());

// 刷新后若 cookie 丢失但 localStorage 仍有 token，则恢复 cookie
const persistedToken = getToken();
if (persistedToken) {
  setToken(persistedToken);
}

const app = createApp(App);
// --全局变量--
app.config.globalProperties.GLOBAL = import.meta.env; // 引入全局环境变量
app.config.globalProperties.$api = api; // 引入axios全局变量

app.use(router).use(store).mount("#app");
