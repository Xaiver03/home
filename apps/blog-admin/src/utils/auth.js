// 管理端不持有中央 access token；产品会话由 blog-api 的 host-only HttpOnly
// cookie 承载，前端只读取非敏感 CSRF cookie。
export function getToken() {
  return null;
}

export function setToken() {}

export function removeToken() {}

export function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const item = document.cookie.split('; ').find((entry) => entry.startsWith('__Host-home_csrf='));
  return item ? decodeURIComponent(item.slice('__Host-home_csrf='.length)) : null;
}
