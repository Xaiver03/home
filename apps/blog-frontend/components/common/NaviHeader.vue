<script setup>
import { notification, Modal, Upload } from 'ant-design-vue';
import {
  ExclamationCircleOutlined,
  UploadOutlined,
  MenuOutlined,
  BulbOutlined,
  HomeOutlined,
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
    path: 'https://xiangleideng.site/#top',
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
    title: '留言板',
    label: '留言板',
    path: '/message',
    key: '/message',
  },
  {
    title: '关于我',
    label: '关于我',
    path: '/about',
    key: '/about',
  },
];
const naviData = reactive(primaryLinks.map((item) => ({ ...item }))); // 导航数据
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
let userImageStatus = ref(true); // 用户头像加载状态
let loginStatus = ref(false); // 用户登录状态
let userData = reactive({}); // 用户数据
let editUserMsgShow = ref(false); // 用户信息编辑框的显示/隐藏
let userUpdateData = reactive({}); // 编辑用户信息数据
let userUpdateLoading = ref(false); // 用户编辑加载
let imageFileList = ref([]); // 图片上传数组
const handleImageError = () => {
  // 头像加载失败回调
  userImageStatus.value = false;
};
const getUserData = () => {
  // 获取用户数据（静默处理：过期/无效token不弹通知，直接清理）
  const token = utils.getCookie('token');
  if (!utils.isNullOrEmpty(token)) {
    // 若登录了
    api.getUserDataByToken().then((res) => {
      if (res.code >= 0 && res.data) {
        // 信息获取成功
        loginStatus.value = true;
        Object.assign(userData, res.data);
      } else {
        // 信息获取失败，静默清理，不打扰用户
        utils.removeCookie('token'); // 去除token
        loginStatus.value = false;
        userData = {};
      }
    });
  }
};
let sendCodeRest = ref(0); // 发送验证码按钮的休息时长
const sendMailCode = () => {
  // 发送验证码
  if (utils.isNullOrEmpty(userData.mail) || !utils.isValidEmail(userData.mail)) {
    // 若为空或者不是邮箱格式
    notification.open({
      message: '⏰提示',
      description: '请输入有效的邮箱📨',
      placement: 'top',
      duration: 3,
    });
    return;
  }
  sendCodeRest.value = 60; // 60秒的休息时间
  const sendCodeInterval = setInterval(() => {
    if (--sendCodeRest.value <= 0) {
      clearInterval(sendCodeInterval);
    }
  }, 1000);
  api.getLoginCode({ mail: userData.mail }).then((res) => {
    utils.analysisData(res);
  });
};
const login = () => {
  // 登录
  api
    .login({
      mail: userData.mail,
      code: userData.code,
    })
    .then((res) => {
      if (utils.analysisData(res)) {
        loginStatus.value = true;
        Object.assign(userData, res.data);
        utils.setCookie('token', userData.token);
        fileHeaders.authorization = `Bearer ${userData.token}`;
      }
    });
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
      utils.removeCookie('token'); // 去除token
      utils.removeCookie('id'); // 去除token
      utils.removeCookie('mail'); // 去除token
      loginStatus.value = false;
      userData = {};
      notification.open({
        message: '提示📢',
        description: '退出成功♻️等待你的再次到来',
        placement: 'top',
        duration: 3,
      });
      fileHeaders.authorization = `Bearer ${utils.getCookie('token')}`;
    },
  });
};
const updateUserData = () => {
  // 更新用户信息
  if (utils.isNullOrEmpty(userUpdateData.mail) || !utils.isValidEmail(userUpdateData.mail)) {
    // 若为空或者不是邮箱格式
    notification.open({
      message: '⏰提示',
      description: '请输入有效的邮箱📨',
      placement: 'top',
      duration: 3,
    });
    return;
  }
  userUpdateLoading.value = true;
  api.updateUserData(Object.assign({}, userUpdateData)).then((res) => {
    userUpdateLoading.value = false;
    if (utils.analysisData(res)) {
      Object.assign(userData, userUpdateData);
    }
  });
};
let fileHeaders = reactive({
  authorization: `Bearer ${utils.getCookie('token')}`,
}); // 封面图片上传header
let avatarTimestamp = ref(null);
const beforeFileUpload = (file) => {
  if (file.size > 30 * 1024 * 1024) {
    // 若文件大小大于30MB
    notification.open({
      message: '⚠️提示',
      description: '文件大小需小于30MB💾',
      placement: 'top',
      duration: 3,
    });
    return false || Upload.LIST_IGNORE;
  }
};
const handleUploadImageChange = (info) => {
  // 上传图片状态改变回调
  if (['done', 'error'].includes(info.file.status) && info.file.response) {
    if (utils.analysisData(info.file.response)) {
      avatarTimestamp.value = new Date();
    }
  }
};
// #endregion

onMounted(() => {
  getLocalTheme();
  getUserData();
});
</script>

<template>
  <header id="navi-header" class="site-nav-shell">
    <nav class="site-nav-capsule" aria-label="主导航">
      <button
        class="brand-mark"
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
          type="button"
          @click="toggleTheme"
          :title="`切换到 ${colorTheme[currentThemeIndex ? 0 : 1]}`"
        >
          <BulbOutlined />
          <span>{{ currentTheme }}</span>
        </button>
        <button
          class="tool-button menu-button"
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
  font-weight: 680;
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
  font-weight: 680;
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
  font-weight: 720;

  :deep(.anticon) {
    font-size: 1.55rem;
  }
}

.menu-button {
  display: none;
  padding: 0;
  border-radius: $radius-capsule;
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
    padding-top: 0.8rem;
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
    gap: 0.15rem;
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
</style>
