<template>
  <!-- 登录页全屏 -->
  <div v-if="isLoginPage" id="login-screen">
    <router-view />
  </div>

  <!-- 管理后台侧边栏 + Tab 布局 -->
  <a-layout v-else class="admin-layout">
    <AdminSidebar />
    <a-layout>
      <a-layout-header class="admin-header">
        <GlobalTabBar @close-dirty="onCloseDirty" />
      </a-layout-header>
      <a-layout-content>
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
</template>

<script setup>
import { onMounted, ref, watch, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import AdminSidebar from "./components/layout/AdminSidebar.vue";
import GlobalTabBar from "./components/layout/GlobalTabBar.vue";
import TabContentPanel from "./components/layout/TabContentPanel.vue";
import CloseTabDialog from "./components/layout/CloseTabDialog.vue";
import LightConfig from "@/assets/themeConfig/Light.json";
import DarkConfig from "@/assets/themeConfig/Dark.json";
import { useStore } from "vuex";
import { useAutoTab } from "./composables/useAutoTab";
import { useTabStore } from "./composables/useTabStore";

const store = useStore();
const route = useRoute();

// 自动 Tab 系统
useAutoTab();

const isLoginPage = ref(false);

watch(
  () => route.path,
  (path) => {
    isLoginPage.value = path === "/login";
  },
  { immediate: true }
);

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
  if (theme) store.commit("SET_THEME", theme);
};

watch(
  () => store.state.themeMode,
  (newVal) => {
    localStorage.setItem("theme", newVal);
    const root = document.documentElement;
    const config = newVal == "Light" ? LightConfig : DarkConfig;
    for (let attribute in config) {
      root.style.setProperty(attribute, config[attribute]);
    }
  },
  { immediate: true, deep: true }
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
  background-color: $main-background-color;
}

.admin-layout {
  min-height: 100vh;
}

.admin-header {
  height: auto;
  padding: 0;
  background: $main-background-color;
  line-height: 1;
}

:deep(.ant-layout-content) {
  background: $main-background-color;
}
</style>
