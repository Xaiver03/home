export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event);
  const accept = getRequestHeader(event, 'accept') || '';

  // 页面 HTML 不长期缓存，避免发布后旧 HTML 继续引用已不存在的 Nuxt build meta。
  // 静态 JS/CSS/字体资源不匹配 text/html，不受此规则影响。
  if (accept.includes('text/html') && !requestUrl.pathname.startsWith('/api/')) {
    setResponseHeader(event, 'cache-control', 'no-store, max-age=0');
  }
});
