import axios from "./http";
import QS from "qs"; // 导入qs库来对请求参数进行处理

export default {
  // get方法 ?分割地址和参数方式传参 eg：www.baidu.com?id=1&name=2
  get: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .get(url + "?" + QS.stringify(params))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          // 修复：保留完整的错误对象而不是只取err.data
          console.error('API GET请求失败:', {url, params, error: err.message || err});
          reject(err.response?.data || err.message || err);
        });
    });
  },
  // get方法 参数放在地址中方式传参 eg：www.baidu.com/1/2?id=3
  getParamsIn: (url, params = [],query = {}) => {
    return new Promise((resolve, reject) => {
      let paramsStr = "";
      params.forEach((value) => {
        paramsStr += "/" + value;
      });
      axios
        .get(url + paramsStr+ "?" + QS.stringify(query))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error('API GET请求失败:', {url: url + paramsStr, params, query, error: err.message || err});
          reject(err.response?.data || err.message || err);
        });
    });
  },
  // post方法
  post: (url, data = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error('API POST请求失败:', {url, data, error: err.message || err});
          reject(err.response?.data || err.message || err);
        });
    });
  },
  // post方法 header添加：'Content-Type': 'multipart/form-data'
  postFormData: (url, data = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .post(url, data, {headers: {'Content-Type': 'multipart/form-data'}})
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error('API POST FormData请求失败:', {url, error: err.message || err});
          reject(err.response?.data || err.message || err);
        });
    });
  },
  // delete方法 ?分割地址和参数方式传参
  delete: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .delete(url + "?" + QS.stringify(params))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error('API DELETE请求失败:', {url, params, error: err.message || err});
          reject(err.response?.data || err.message || err);
        });
    });
  },
  // delete方法 参数放在地址中方式传参
  deleteParamsIn: (url, params = []) => {
    return new Promise((resolve, reject) => {
      let paramsStr = "";
      params.forEach((value) => {
        paramsStr += "/" + value;
      });
      axios
        .delete(url + paramsStr)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error('API DELETE请求失败:', {url: url + paramsStr, params, error: err.message || err});
          reject(err.response?.data || err.message || err);
        });
    });
  },
};
