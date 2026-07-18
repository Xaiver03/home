import { createApp } from "vue";
import "@/style/style.scss";
import App from "@/App.vue";
// 引入 pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// swiper
import "swiper/css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.directive('reveal', {
  mounted(el) {
    el.classList.add('reveal-item');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
  },
});

app.use(pinia);
app.mount("#app");

// PWA 更新机制
import { registerSW } from "virtual:pwa-register";

let updateSW;

if ('serviceWorker' in navigator) {
  updateSW = registerSW({
    onNeedRefresh() {
      // 当有新版本可用时触发
      console.log('💡 发现新版本，准备更新...');

      // 显示更新提示
      showUpdateDialog();
    },
    onOfflineReady() {
      console.log('✅ 应用可以离线使用');
      // 可选：显示离线准备就绪提示
      if (window.ElMessage) {
        window.ElMessage.success('应用已可离线使用');
      }
    },
    onRegisterError(error) {
      console.error('❌ PWA注册失败:', error);
    },
  });
}

// 显示更新对话框
function showUpdateDialog() {
  // 检查Element Plus是否可用
  if (window.ElMessageBox) {
    window.ElMessageBox.confirm(
      '发现新版本，是否立即更新？更新后页面将自动刷新。',
      '版本更新',
      {
        confirmButtonText: '立即更新',
        cancelButtonText: '稍后更新',
        type: 'info',
        dangerouslyUseHTMLString: false,
      }
    ).then(() => {
      // 用户确认更新
      if (updateSW) {
        updateSW(true); // 强制更新
      } else {
        // 兜底方案：直接刷新
        window.location.reload();
      }
    }).catch(() => {
      console.log('用户选择稍后更新');
    });
  } else {
    // Element Plus不可用时的兜底方案
    if (confirm('发现新版本，是否立即更新？更新后页面将自动刷新。')) {
      if (updateSW) {
        updateSW(true);
      } else {
        window.location.reload();
      }
    }
  }
}

// 手动检查更新（可导出供组件使用）
window.checkForUpdates = () => {
  if (updateSW) {
    console.log('🔄 手动检查更新...');
    // 触发更新检查
    updateSW(false);
  }
};

// 监听Service Worker状态变化
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  console.log('🔄 Service Worker已更新，页面即将刷新');

  // 显示更新完成提示后刷新
  if (window.ElMessage) {
    window.ElMessage.success({
      message: '更新完成，页面即将刷新',
      duration: 1000,
      onClose: () => window.location.reload()
    });
  } else {
    setTimeout(() => window.location.reload(), 1000);
  }
});

// 版本检查 - 将版本号暴露到全局
window.APP_VERSION = "4.1.6-pwa-fix";
console.log(`🚀 应用版本: ${window.APP_VERSION}`);

// 定期检查版本更新（每30分钟）
setInterval(() => {
  if (window.checkForUpdates) {
    console.log('⏰ 定期检查更新...');
    window.checkForUpdates();
  }
}, 30 * 60 * 1000); // 30分钟
