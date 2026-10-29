import axios from 'axios';

// /api/auth/* 是 BFF 入口；业务 API 的全局 baseURL 是 /api，
// 直接复用全局 axios 会把地址拼成 /api/api/auth/*。
export const authClient = axios.create({ withCredentials: true });
