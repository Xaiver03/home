//导入axios
import axios from "axios";
import router from "@/router/index";
import { notification } from "ant-design-vue";
import { getCsrfToken } from "@/utils/auth";

// --aixos默认设置--
axios.defaults.timeout = 30 * 1000; // 30秒 (修复：之前是5分钟，太长了)
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || ''; // 设置默认的请求地址

// --请求拦截器--
// 只携带产品会话 cookie，并为状态变更附加非敏感 CSRF token。
axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const csrf = getCsrfToken();
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
    return config;
  },
  (error) => {
    // 请求错误处理
    console.log("Request Error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 检查是否是 token 过期的错误
      if (error.response.status === 401) {
        // 清除信息
        notification.info({
          message: "登录过期",
          description: error.response.data.msg,
          duration: 3,
        });
          router.push("/login"); // 返回中央登录页
      }
    }
    return Promise.reject(error);
  }
);

// //导出我们建立的axios实例模块
export default axios;
