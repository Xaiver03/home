//导入axios
import axios from "axios";
import Cookies from "js-cookie";
import router from "@/router/index";
import { notification } from "ant-design-vue";
import { getToken, removeToken } from "@/utils/auth";

// --aixos默认设置--
axios.defaults.timeout = 30 * 1000; // 30秒 (修复：之前是5分钟，太长了)
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || ''; // 设置默认的请求地址

// --请求拦截器--
// 添加Authorization请求头，用于权限处理
axios.interceptors.request.use(
  (config) => {
    // 优先从 cookie 读取，若 cookie 丢失则回退 localStorage
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
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
        removeToken();
        notification.info({
          message: "登录过期",
          description: error.response.data.msg,
          duration: 3,
        });
        router.push("/login"); // 返回登录页
      }
    }
    return Promise.reject(error);
  }
);

// //导出我们建立的axios实例模块
export default axios;
