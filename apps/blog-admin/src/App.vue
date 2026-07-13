<template>
  <a-config-provider :theme="antTheme">
    <!-- 登录页全屏 -->
    <div v-if="isLoginPage" id="login-screen">
      <router-view />
    </div>

    <!-- 管理后台侧边栏 + Tab 布局 -->
    <a-layout v-else class="admin-layout admin-app-shell">
      <AdminSidebar />
      <a-layout class="admin-main">
        <a-layout-header class="admin-header admin-chrome">
          <GlobalTabBar @close-dirty="onCloseDirty" />
        </a-layout-header>
        <a-layout-content class="admin-content">
          <TabContentPanel />
        </a-layout-content>
      </a-layout>
    </a-layout>

    <CloseTabDialog
      :visible="dirtyDialog.visible"
      :tab="dirtyDialog.tab"
      @save-and-close="onSaveAndClose"
      @close-without-save="onCloseWithoutSave"
      @cancel="dirtyDialog.visible = false"
    />
  </a-config-provider>
</template>

<script setup>
import { onMounted, ref, watch, getCurrentInstance, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { theme } from "ant-design-vue";
import AdminSidebar from "./components/layout/AdminSidebar.vue";
import GlobalTabBar from "./components/layout/GlobalTabBar.vue";
import TabContentPanel from "./components/layout/TabContentPanel.vue";
import CloseTabDialog from "./components/layout/CloseTabDialog.vue";
import {
  applyThemeVars as applyDesignThemeVars,
  getAntDesignTokens,
  normalizeThemeMode,
  persistTheme,
} from "@xld/design-tokens";
import { useStore } from "vuex";
import { useAutoTab } from "./composables/useAutoTab";
import { useTabStore } from "./composables/useTabStore";
import { getToken } from "@/utils/auth";

const { defaultAlgorithm, darkAlgorithm } = theme;

const store = useStore();
const route = useRoute();
const router = useRouter();

// 自动 Tab 系统
useAutoTab();

const isLoginPage = ref(false);

watch(
  () => route.path,
  (path) => {
    const onLogin = path === "/login";
    isLoginPage.value = onLogin;

    // 非登录页且未认证 → 强制跳转登录
    if (!onLogin && !getToken()) {
      router.replace({ name: "登录" });
    }
  },
  { immediate: true }
);

// Ant Design Vue 暗色主题
const isDark = computed(() => store.state.themeMode === "Dark");
const antTheme = computed(() => ({
  algorithm: isDark.value ? darkAlgorithm : defaultAlgorithm,
  token: getAntDesignTokens(store.state.themeMode),
}));

// --rem设置--
const reScreenSize = () => {
  let w = document.documentElement.clientWidth;
  if (w <= 768) {
    document.documentElement.style.fontSize = "5px";
    return;
  }
  let n =
    10 * (w / 1920) > 40
      ? 40 + "px"
      : 10 * (w / 1920) >= 7.4
        ? 10 * (w / 1920) + "px"
        : 7.4 + "px";
  document.documentElement.style.fontSize = n;
};

// --主题设置--
const setThemeMode = () => {
  const theme = localStorage.getItem("theme");
  if (theme) store.commit("SET_THEME", normalizeThemeMode(theme));
};

const applyThemeVars = (newVal) => {
  applyDesignThemeVars(persistTheme(newVal));
};

watch(
  () => store.state.themeMode,
  (newVal) => applyThemeVars(newVal),
  { immediate: true }
);

// 全局窗口改变事件
const resize = () => {
  reScreenSize();
  store.commit("WINDOW_SIZE_CHANGE", {
    height: window.innerHeight,
    width: window.innerWidth,
  });
};

const getGlobalConfig = async () => {
  const { proxy } = getCurrentInstance?.() || {};
  if (proxy?.$api?.getGlobalConfig) {
    await proxy.$api.getGlobalConfig().then((res) => {
      store.commit("SET_CONFIG", res);
    });
  }
};

// 关闭未保存 Tab 弹窗
const dirtyDialog = ref({
  visible: false,
  tab: null,
});

function onCloseDirty(tab) {
  dirtyDialog.value = { visible: true, tab };
}

function onSaveAndClose(tab) {
  dirtyDialog.value.visible = false;
  const tabStore = useTabStore();
  tabStore.setTabDirty(tab.id, false);
  tabStore.closeTab(tab.id);
}

function onCloseWithoutSave(tab) {
  dirtyDialog.value.visible = false;
  const tabStore = useTabStore();
  tabStore.setTabDirty(tab.id, false);
  tabStore.closeTab(tab.id);
}

onMounted(() => {
  getGlobalConfig();
  reScreenSize();
  setThemeMode();
  applyThemeVars(store.state.themeMode);
  window.addEventListener("load", reScreenSize);
  window.addEventListener("resize", resize);
});
</script>

<style lang="scss" scoped>
#login-screen {
  overflow: hidden;
  position: relative;
  height: 100vh;
  width: 100vw;
  background: var(--page-gradient, #ebece5);
}

.admin-layout {
  min-height: 100vh;
  background: var(--page-gradient, #ebece5);
  color: $main-text-color;
  font-family: $font-body;
}

.admin-main {
  min-width: 0;
  background: transparent;
}

.admin-header {
  height: auto;
  padding: 0;
  background: transparent;
  line-height: 1;
  position: sticky;
  top: 0;
  z-index: $z-sticky;
}

.admin-content {
  min-width: 0;
  background: transparent;
}
</style>
