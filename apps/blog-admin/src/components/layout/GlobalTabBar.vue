<template>
  <div class="global-tab-bar">
    <div class="tabs-wrapper">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{
          active: tab.id === activeTabId,
          pinned: tab.pinned,
          dirty: isTabDirty(tab.id),
        }"
        @click.middle="!tab.closable || handleClose(tab, $event)"
        @click.left="switchTab(tab.id)"
        @contextmenu.prevent="showContextMenu($event, tab)"
      >
        <span class="dot" v-if="isTabDirty(tab.id)" />
        <span class="title">{{ tab.title }}</span>
        <PushpinFilled v-if="tab.pinned" class="pin-icon" />
        <CloseOutlined
          v-if="tab.closable"
          class="close-icon"
          @click.stop="handleClose(tab, $event)"
        />
      </div>
    </div>

    <!-- 右键菜单 -->
    <a-dropdown
      :trigger="['contextmenu']"
      :visible="contextMenu.visible"
      @visibleChange="onContextMenuVisibleChange"
    >
      <div
        class="context-menu-anchor"
        :style="{
          left: contextMenu.x + 'px',
          top: contextMenu.y + 'px',
        }"
      />
      <template #overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="refresh">刷新页面</a-menu-item>
          <a-menu-item key="close">关闭当前</a-menu-item>
          <a-menu-item key="closeOthers">关闭其他</a-menu-item>
          <a-menu-item key="closeToRight">关闭右侧</a-menu-item>
          <a-menu-divider />
          <a-menu-item key="togglePin">{{ contextMenu.tab?.pinned ? '取消固定' : '固定标签' }}</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CloseOutlined, PushpinFilled } from '@ant-design/icons-vue';
import { useTabStore } from '@/composables/useTabStore';

const router = useRouter();
const tabStore = useTabStore();

const tabs = tabStore.tabs;
const activeTabId = tabStore.activeTabId;
const isTabDirty = tabStore.isTabDirty;

const emit = defineEmits(['close-dirty']);

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null,
});

function switchTab(id) {
  const tab = tabStore.getTabById(id);
  if (!tab) return;
  router.push(tab.fullPath || tab.path);
}

function handleClose(tab, event) {
  if (event) event.preventDefault();
  if (tab.closable === false) return;
  if (isTabDirty(tab.id)) {
    emit('close-dirty', tab);
    return;
  }
  tabStore.closeTab(tab.id);
}

function showContextMenu(event, tab) {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tab,
  };
}

function onContextMenuVisibleChange(visible) {
  if (!visible) {
    contextMenu.value.visible = false;
  }
}

function handleMenuClick({ key }) {
  const tab = contextMenu.value.tab;
  contextMenu.value.visible = false;
  if (!tab) return;

  switch (key) {
    case 'refresh':
      router.replace('/__refresh__').then(() => {
        router.replace(tab.fullPath || tab.path);
      });
      break;
    case 'close':
      handleClose(tab);
      break;
    case 'closeOthers':
      tabStore.closeOtherTabs(tab.id);
      router.push(tab.fullPath || tab.path);
      break;
    case 'closeToRight':
      tabStore.closeTabsToRight(tab.id);
      break;
    case 'togglePin':
      tabStore.pinTab(tab.id, !tab.pinned);
      break;
  }
}
</script>

<style lang="scss" scoped>
.global-tab-bar {
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.28);
  background: $main-car-color;
  padding: 0 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  flex: 1;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 14px;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  line-height: 20px;
  color: $secondary-text-color;
  border: 1px solid transparent;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    background: $secondary-car-color;
    color: $main-text-color;
  }

  &.active {
    background: color-mix(in srgb, $main-color 12%, $main-car-color);
    border-color: color-mix(in srgb, $main-color 36%, transparent);
    color: $main-text-color;
    box-shadow: inset 0 -2px 0 $main-color;
  }

  &.dirty .title {
    font-style: italic;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $warn-color;
  }

  .title {
    white-space: nowrap;
  }

  .pin-icon {
    font-size: 12px;
    opacity: 0.7;
  }

  .close-icon {
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;

    &:hover {
      color: $warn-color;
    }
  }

  &:hover .close-icon {
    opacity: 1;
  }
}

.context-menu-anchor {
  position: fixed;
  width: 0;
  height: 0;
}
</style>
