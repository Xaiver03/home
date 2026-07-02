import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';

/**
 * 统一 Token 读写工具
 * 同时维护 cookie（兼容现有逻辑）和 localStorage（刷新后双保险）
 */
export function getToken() {
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (!token) return;
  // expires: 10 天，与后端 JWT 默认过期时间保持一致
  Cookies.set(TOKEN_KEY, token, { expires: 10, secure: false, sameSite: 'Lax' });
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
