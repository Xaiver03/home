<script setup>
import { notification, Modal } from 'ant-design-vue';
import {
  ExclamationCircleOutlined,
  MenuOutlined,
  BulbOutlined,
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons-vue';
import { createVNode } from 'vue';
const router = useRouter();
const route = useRoute();
const store = useNuxtStore();
const config = useRuntimeConfig();
// --主题切换模块--
const colorTheme = ref(['Light', 'Dark']);
let currentThemeIndex = ref(0);
let currentTheme = ref(colorTheme.value[0]);
const themeChange = (newVal) => {
  // 改变主题事件
  currentTheme.value = newVal;
  currentThemeIndex.value = colorTheme.value.findIndex((item) => item == newVal);
  store.setThemeMode(newVal);
};
const getLocalTheme = () => {
  // 获取本地主题
  const theme = localStorage.getItem('theme');
  if (theme) {
    currentTheme.value = theme;
    currentThemeIndex.value = colorTheme.value.findIndex((item) => item == theme);
  } else {
    currentTheme.value = 'Dark';
    currentThemeIndex.value = 1;
  }
};
// --导航模块--
const primaryLinks = [
  {
    title: '首页',
    label: '首页',
    path: 'https://xaiverdeng.site/#top',
    key: 'homepage',
    external: true,
  },
  {
    title: '博客',
    label: '博客',
    path: '/',
    key: '/',
  },
  {
    title: '文章',
    label: '文章',
    path: '/log/article',
    key: '/log/article',
  },
  {
    title: '关于我',
    label: '关于我',
    path: '/about',
    key: '/about',
  },
  {
    title: '留言板',
    label: '留言板',
    path: '/message',
    key: '/message',
  },
];
const naviData = reactive(primaryLinks.map((item) => ({ ...item }))); // 导航数据
const mobileNavItems = [
  { ...primaryLinks[0], icon: HomeOutlined },
  { ...primaryLinks[1], icon: BookOutlined },
  { ...primaryLinks[2], icon: ReadOutlined },
  { ...primaryLinks[3], icon: UserOutlined },
  { ...primaryLinks[4], icon: MessageOutlined },
];
let naviDrawer = ref(false);
const expandedKeys = ref([]);
const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(`${path}/`);
};
const goTo = (path, external) => {
  if (external || /^https?:\/\//i.test(path)) {
    window.location.href = path;
    return;
  }
  router.push(path);
  naviDrawer.value = false;
};
const toggleTheme = () => {
  currentThemeIndex.value = currentThemeIndex.value ? 0 : 1;
  themeChange(colorTheme.value[currentThemeIndex.value]);
};
const findNavItem = (key, nodes) => {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNavItem(key, node.children);
      if (found) return found;
    }
  }
  return null;
};
const changePath = ([key]) => {
  if (!key) {
    expandedKeys.value = [];
    return;
  }
  const regex = /^root-/;
  if (regex.test(key)) {
    if (!expandedKeys.value.includes(key)) {
      expandedKeys.value = [key];
    }
  } else {
    const item = findNavItem(key, naviData);
    if (item) {
      goTo(item.path || key, item.external);
    } else {
      goTo(key);
    }
  }
};
// #region --用户模块--
let loginStatus = ref(false); // 用户登录状态
const userData = reactive({}); // 用户数据
const claimOpen = ref(false);
const claimMail = ref('');
const claimCode = ref('');
const claimBusy = ref(false);
const claimMessage = ref('');
const claimRequired = computed(() => route.query.auth_error === 'identity_binding_required');
const getUserData = () => {
  // 产品会话由 blog-api 的 host-only cookie 承载；没有会话时静默保持访客状态。
  api.getUserDataByToken().then((res) => {
    if (res.code >= 0 && res.data) {
      loginStatus.value = true;
      Object.assign(userData, res.data);
    }
  }).catch(() => {
    loginStatus.value = false;
  });
};
const login = () => {
  api.startLogin();
};
const quit = () => {
  // 退出登录
  Modal.confirm({
    title: '确认退出吗',
    icon: createVNode(ExclamationCircleOutlined),
    content: '退出将清除您的个人数据在此电脑',
    okText: '退出',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      return api.logout().then(() => {
        loginStatus.value = false;
        Object.keys(userData).forEach((key) => delete userData[key]);
        notification.open({
          message: '提示📢',
          description: '退出成功♻️等待你的再次到来',
          placement: 'top',
          duration: 3,
        });
      }).catch(() => {
        notification.error({
          message: '退出失败',
          description: '中央退出暂时不可用，请稍后重试',
          placement: 'top',
          duration: 4,
        });
      });
    },
  });
};
const requestClaimCode = async () => {
  if (!claimMail.value) {
    claimMessage.value = '请输入原账号邮箱';
    return;
  }
  claimBusy.value = true;
  claimMessage.value = '';
  try {
    await api.requestClaimCode({ mail: claimMail.value });
    claimMessage.value = '验证码已发送，请查收邮件';
  } catch (error) {
    claimMessage.value = error?.msg || error?.message || '验证码发送失败';
  } finally {
    claimBusy.value = false;
  }
};
const submitClaim = async () => {
  if (!claimMail.value || !claimCode.value) {
    claimMessage.value = '请输入邮箱和验证码';
    return;
  }
  claimBusy.value = true;
  claimMessage.value = '';
  try {
    await api.claimIdentity({ kind: 'user', mail: claimMail.value, proofType: 'code', proof: claimCode.value });
    claimOpen.value = false;
    await getUserData();
    await router.replace({ query: {} });
    notification.success({ message: '绑定成功', description: '旧账号已连接到统一身份' });
  } catch (error) {
    claimMessage.value = error?.msg || error?.message || '绑定失败，请确认验证码';
  } finally {
    claimBusy.value = false;
  }
};
// #endregion

onMounted(() => {
  getLocalTheme();
  getUserData();
  if (claimRequired.value) claimOpen.value = true;
});
</script>

<template>
  <header id="navi-header" class="site-nav-shell">
    <nav class="site-nav-capsule" aria-label="主导航">
      <button
        class="brand-mark"
        data-pointer-surface="nav"
        type="button"
        @click="goTo('/')"
        :aria-current="isActive('/') ? 'page' : undefined"
      >
        <span>灯下灯</span>
      </button>

      <div class="entry-switch" role="list" aria-label="博客入口切换">
        <button
          v-for="item in primaryLinks"
          :key="item.key"
          class="nav-item primary"
          data-pointer-surface="nav"
          :class="{ active: !item.external && isActive(item.path) }"
          type="button"
          role="listitem"
          @click="goTo(item.path, item.external)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="nav-tools">
        <button
          class="tool-button"
          data-pointer-surface="nav"
          type="button"
          @click="toggleTheme"
          :title="`切换到 ${colorTheme[currentThemeIndex ? 0 : 1]}`"
        >
          <BulbOutlined />
          <span>{{ currentTheme }}</span>
        </button>
        <button
          class="tool-button auth-button"
          data-pointer-surface="nav"
          type="button"
          @click="loginStatus ? quit() : login()"
        >
          <span>{{ loginStatus ? '退出登录' : '统一登录' }}</span>
        </button>
        <button
          class="tool-button menu-button"
          data-pointer-surface="nav"
          type="button"
          @click="naviDrawer = !naviDrawer"
          title="打开导航"
        >
          <MenuOutlined />
        </button>
      </div>
    </nav>
    <a-drawer
      v-model:open="naviDrawer"
      class="navi-top-drawer"
      title="灯下灯"
      placement="top"
      height="auto"
    >
      <a-tree
        @select="changePath"
        v-model:expandedKeys="expandedKeys"
        :tree-data="naviData"
      ></a-tree>
    </a-drawer>
    <a-modal v-model:open="claimOpen" title="绑定已有博客账号" :footer="null" :mask-closable="false">
      <p>这次登录需要确认你仍然持有旧账号。请输入旧邮箱并获取一次性验证码，系统不会按邮箱自动合并账号。</p>
      <a-input v-model:value="claimMail" placeholder="旧账号邮箱" autocomplete="email" />
      <div class="claim-code-row">
        <a-input v-model:value="claimCode" placeholder="邮箱验证码" autocomplete="one-time-code" />
        <a-button :loading="claimBusy" @click="requestClaimCode">获取验证码</a-button>
      </div>
      <p v-if="claimMessage" class="claim-message">{{ claimMessage }}</p>
      <a-button type="primary" block :loading="claimBusy" @click="submitClaim">完成绑定</a-button>
    </a-modal>
    <nav class="mobile-tab-bar" aria-label="移动端主导航">
      <button
        v-for="item in mobileNavItems"
        :key="`mobile-${item.key}`"
        class="mobile-tab-item"
        data-pointer-surface="nav"
        :class="{ active: !item.external && isActive(item.path) }"
        type="button"
        :aria-current="!item.external && isActive(item.path) ? 'page' : undefined"
        @click="goTo(item.path, item.external)"
      >
        <component :is="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.site-nav-shell {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1.2rem max(1.2rem, env(safe-area-inset-left)) 0;
  pointer-events: none;
}

.site-nav-capsule {
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  width: $nav-shell-width;
  min-height: 5.6rem;
  padding: 0.55rem;
  border: 1px solid $surface-border;
  border-radius: $radius-capsule;
  background: $surface-glass-strong;
  box-shadow: $surface-inner-highlight, $surface-shadow-soft;
  backdrop-filter: blur($surface-blur) saturate(180%);
}

button {
  font: inherit;
}

.brand-mark,
.nav-item,
.tool-button {
  min-height: 4.4rem;
  border: 0;
  color: $secondary-text-color;
  background: transparent;
  cursor: $hover-cursor;
  transition:
    transform $motion-fast,
    background $motion-fast,
    color $motion-fast,
    box-shadow $motion-fast;

  &:hover {
    color: $main-text-color;
    background: $surface-hover;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: none;
    box-shadow: $focus-ring;
  }
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 9.8rem;
  padding: 0 1.8rem;
  border-radius: $radius-capsule $radius-panel $radius-panel $radius-capsule;
  color: $main-text-color;
  font-family: $font-display;
  font-size: 1.72rem;
  font-weight: 600;
  white-space: nowrap;

  &[aria-current='page'] {
    background: $surface-hover;
    box-shadow: $surface-inner-highlight;
  }
}

.entry-switch,
.nav-tools {
  display: inline-flex;
  align-items: center;
}

.entry-switch {
  gap: 0.3rem;
  padding: 0.25rem;
  border-radius: $radius-capsule;
  background: $surface-control;
  box-shadow: inset 0 1px 4px color-mix(in srgb, $main-text-color 8%, transparent);
}

.nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.4rem;
  border-radius: $radius-capsule;
  font-size: 1.42rem;
  font-weight: 600;
  white-space: nowrap;

  &.primary {
    min-width: 7.2rem;
    color: $main-text-color;
  }

  &.active {
    color: $main-text-color;
    background: $surface-hover;
    box-shadow: $surface-inner-highlight, $surface-shadow-soft;
  }
}

.nav-tools {
  justify-self: end;
  gap: 0.45rem;
}

.tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-width: 4.4rem;
  padding: 0 1.3rem;
  border-radius: $radius-panel $radius-capsule $radius-capsule $radius-panel;
  font-size: 1.28rem;
  font-weight: 500;

  :deep(.anticon) {
    font-size: 1.55rem;
  }
}

.menu-button {
  display: none;
  padding: 0;
  border-radius: $radius-capsule;
}

.mobile-tab-bar {
  display: none;
}

@media (max-width: 1024px) {
  .site-nav-capsule {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .entry-switch {
    justify-self: center;
  }

  .menu-button {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .site-nav-shell {
    top: env(safe-area-inset-top);
    padding-top: calc(0.8rem + env(safe-area-inset-top));
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  .site-nav-capsule {
    width: calc(100vw - 1.6rem);
    min-height: 5rem;
    gap: 0.35rem;
    padding: 0.42rem;
  }

  .brand-mark {
    min-width: 0;
    padding: 0 1.15rem;
    font-size: 1.45rem;
  }

  .entry-switch {
    display: none;
  }

  .nav-item {
    min-height: 3.9rem;
    min-width: 5.6rem;
    padding: 0 0.9rem;
    font-size: 1.28rem;
  }

  .tool-button {
    min-width: 3.9rem;
    min-height: 3.9rem;
    padding: 0;
    border-radius: 999px;

    span {
      display: none;
    }
  }

  .site-nav-capsule {
    grid-template-columns: 1fr auto;
  }

  .mobile-tab-bar {
    pointer-events: auto;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: $z-sticky;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.65rem 0.8rem calc(0.65rem + env(safe-area-inset-bottom));
    border-top: 1px solid $surface-border;
    background: $surface-glass-strong;
    box-shadow: 0 -0.8rem 2.4rem rgba(35, 44, 38, 0.08);
    backdrop-filter: blur($surface-blur) saturate(180%);
  }

  .mobile-tab-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-width: 0;
    min-height: 5rem;
    padding: 0.35rem 0.15rem;
    border: 0;
    border-radius: $radius-control;
    background: transparent;
    color: $secondary-text-color;
    font-size: 1.05rem;
    font-weight: 500;
    line-height: 1.1;
    -webkit-tap-highlight-color: transparent;

    :deep(.anticon) {
      font-size: 1.9rem;
    }

    &.active {
      background: $surface-hover;
      color: $main-text-color;
      box-shadow: $surface-inner-highlight;
    }

    &:active {
      transform: scale(0.96);
    }

    &:focus-visible {
      outline: none;
      box-shadow: $focus-ring;
    }
  }
}

@media (prefers-reduced-transparency: reduce) {
  .site-nav-capsule {
    background: rgba(248, 250, 245, 0.96);
    backdrop-filter: none;
  }
}
</style>
<style lang="scss">
.navi-top-drawer {
  width: 100vw !important;

  .ant-drawer-header {
    border-bottom: none;
  }

  .ant-drawer-header-title {
    flex-direction: row-reverse;
  }

  .ant-drawer-body {
    padding-top: 0px;
  }

  .ant-tree-list-holder-inner {
    align-items: flex-end;
  }
}

.claim-code-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.claim-message {
  color: #65706a;
}
</style>
