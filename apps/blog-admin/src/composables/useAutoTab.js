import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTabStore } from './useTabStore';

// 不参与 Tab 系统的路由（登录页、手机端独立页面）
const EXACTLY_EXCLUDED_PATHS = new Set([
  '/login',
  '/log/phone-list',
  '/message/phone-list',
  '/message/phone-edit',
]);

// 路径 → Tab 配置（最长前缀匹配）
export const PATH_TO_TAB = {
  '/log': { title: '首页', type: 'dashboard' },
  '/log/list': { title: '博客列表', type: 'log' },
  '/log/edit': { title: '博客编辑', type: 'log' },
  '/log/type': { title: '博客类目', type: 'log' },
  '/log/comment': { title: '评论管理', type: 'log' },
  '/message': { title: '留言管理', type: 'message' },
  '/user/list': { title: '用户列表', type: 'user' },
  '/user/admin': { title: '管理员列表', type: 'user' },
  '/friendLink': { title: '友链', type: 'site' },
  '/config': { title: '配置', type: 'site' },
  '/home-manage': { title: '主页管理', type: 'site' },
  '/about': { title: 'About管理', type: 'site' },
  '/music': { title: '音乐', type: 'site' },
};

const SORTED_PATHS = Object.keys(PATH_TO_TAB).sort((a, b) => b.length - a.length);

function resolveTabConfig(path) {
  // 去掉查询参数，只匹配路径部分
  const cleanPath = path.split('?')[0];
  if (EXACTLY_EXCLUDED_PATHS.has(cleanPath)) return null;

  for (const base of SORTED_PATHS) {
    if (cleanPath === base || cleanPath.startsWith(base + '/')) {
      return { base, ...PATH_TO_TAB[base] };
    }
  }
  return null;
}

export function useAutoTab() {
  const route = useRoute();
  const tabStore = useTabStore();

  watch(
    () => route.path,
    () => {
      const config = resolveTabConfig(route.fullPath);
      if (!config) return;

      const existed = tabStore.tabs.value.find((t) => t.path === config.base);
      if (existed) {
        tabStore.switchTab(existed.id);
        // 若路径带查询参数（如 /log/edit?id=1），把完整路径同步到 tab，便于后续恢复
        if (route.fullPath !== existed.path && !existed.fullPath) {
          existed.fullPath = route.fullPath;
        }
      } else {
        tabStore.openTab({
          path: config.base,
          fullPath: route.fullPath,
          title: config.title,
          type: config.type,
          pinned: config.base === '/log', // 首页默认固定
          closable: config.base !== '/log',
        });
      }
    },
    { immediate: true }
  );
}
