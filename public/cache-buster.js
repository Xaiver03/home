// 强制缓存失效工具
// Force Cache Invalidation Tool

(function() {
  'use strict';

  // 获取当前时间戳
  const timestamp = Date.now();

  console.log(`🧹 缓存清理器启动 - ${new Date().toLocaleString()}`);

  // 1. 清理所有localStorage（保留必要的用户设置）
  function clearLocalStorage() {
    const keysToKeep = ['userSettings', 'theme', 'volume']; // 保留的关键配置
    const allKeys = Object.keys(localStorage);

    allKeys.forEach(key => {
      if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
        localStorage.removeItem(key);
      }
    });

    console.log('🗑️ localStorage已清理（保留用户设置）');
  }

  // 2. 清理sessionStorage
  function clearSessionStorage() {
    sessionStorage.clear();
    console.log('🗑️ sessionStorage已清理');
  }

  // 3. 清理所有缓存
  async function clearAllCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log(`🔍 发现缓存: ${cacheNames.join(', ')}`);

        const deletePromises = cacheNames.map(cacheName => {
          console.log(`🗑️ 清理缓存: ${cacheName}`);
          return caches.delete(cacheName);
        });

        await Promise.all(deletePromises);
        console.log('✅ 所有缓存已清理');
      } catch (error) {
        console.error('❌ 清理缓存失败:', error);
      }
    }
  }

  // 4. 注销所有Service Worker
  async function unregisterServiceWorkers() {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`🔍 发现Service Worker: ${registrations.length}个`);

        const unregisterPromises = registrations.map(registration => {
          console.log(`🗑️ 注销Service Worker: ${registration.scope}`);
          return registration.unregister();
        });

        await Promise.all(unregisterPromises);
        console.log('✅ 所有Service Worker已注销');
      } catch (error) {
        console.error('❌ 注销Service Worker失败:', error);
      }
    }
  }

  // 5. 强制刷新所有资源（添加时间戳）
  function addCacheBusterToResources() {
    // 添加时间戳到所有外部资源
    const resources = document.querySelectorAll('link[href], script[src], img[src]');

    resources.forEach(resource => {
      const url = resource.href || resource.src;
      if (url && !url.includes('?')) {
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}v=${timestamp}`;

        if (resource.href) resource.href = newUrl;
        if (resource.src) resource.src = newUrl;
      }
    });

    console.log(`🔄 已为${resources.length}个资源添加缓存破坏参数`);
  }

  // 6. 强制刷新页面（禁用缓存）
  function forceReload() {
    console.log('🔄 强制刷新页面（禁用缓存）');

    // 延迟执行确保所有清理完成
    setTimeout(() => {
      // 尝试使用location.reload(true)强制从服务器重新加载
      if (window.location.reload) {
        window.location.reload(true); // 强制从服务器重新加载
      } else {
        // 兜底方案：添加时间戳参数
        const url = new URL(window.location);
        url.searchParams.set('_cb', timestamp);
        window.location.href = url.toString();
      }
    }, 1000);
  }

  // 主清理函数
  async function performFullCacheReset() {
    console.log('🚀 开始完整缓存重置...');

    try {
      // 按顺序执行清理
      clearLocalStorage();
      clearSessionStorage();
      await clearAllCaches();
      await unregisterServiceWorkers();
      addCacheBusterToResources();

      console.log('✅ 缓存重置完成，即将刷新页面...');
      forceReload();

    } catch (error) {
      console.error('❌ 缓存重置过程中出错:', error);
      // 即使出错也强制刷新
      forceReload();
    }
  }

  // 暴露到全局，供手动调用
  window.performFullCacheReset = performFullCacheReset;

  // 检查是否需要自动执行
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('force-refresh') === 'true') {
    console.log('🎯 检测到强制刷新参数，自动执行缓存重置...');
    performFullCacheReset();
  }

  console.log('💡 可手动调用 performFullCacheReset() 进行完整缓存重置');

})();