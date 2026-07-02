import { reactive, computed, watch } from 'vue';

const STORAGE_KEY = 'blog-admin-tab-storage';

function generateId() {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [],
        activeTabId: parsed.activeTabId || null,
      };
    }
  } catch {
    // ignore
  }
  return { tabs: [], activeTabId: null };
}

function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
    })
  );
}

const initial = loadState();

const state = reactive({
  tabs: initial.tabs,
  activeTabId: initial.activeTabId,
  dirtyTabs: new Set(),
});

watch(
  () => ({ tabs: state.tabs, activeTabId: state.activeTabId }),
  (next) => saveState(next),
  { deep: true }
);

export function useTabStore() {
  const tabs = computed(() => state.tabs);
  const activeTabId = computed(() => state.activeTabId);

  const openTab = (tabData) => {
    const existing = state.tabs.find(
      (t) => t.path === tabData.path && t.type === tabData.type
    );
    if (existing) {
      existing.timestamp = Date.now();
      state.activeTabId = existing.id;
      return existing.id;
    }

    const now = Date.now();
    const newTab = {
      ...tabData,
      id: generateId(),
      timestamp: now,
      pinned: tabData.pinned || false,
      closable: tabData.closable !== false,
    };
    state.tabs.push(newTab);
    state.activeTabId = newTab.id;
    return newTab.id;
  };

  const switchTab = (id) => {
    const tab = state.tabs.find((t) => t.id === id);
    if (!tab) return;
    tab.timestamp = Date.now();
    state.activeTabId = id;
  };

  const closeTab = (id) => {
    const tab = state.tabs.find((t) => t.id === id);
    if (tab?.closable === false) return;

    const filtered = state.tabs.filter((t) => t.id !== id);
    if (state.activeTabId === id) {
      const closedIndex = state.tabs.findIndex((t) => t.id === id);
      const nextTab = filtered[Math.min(closedIndex, filtered.length - 1)];
      state.activeTabId = nextTab ? nextTab.id : null;
    }
    state.dirtyTabs.delete(id);
    state.tabs = filtered;
  };

  const pinTab = (id, pinned) => {
    const tab = state.tabs.find((t) => t.id === id);
    if (tab) tab.pinned = pinned;
  };

  const closeOtherTabs = (id) => {
    state.tabs = state.tabs.filter((t) => t.id === id || t.pinned || t.closable === false);
    state.activeTabId = id;
  };

  const closeTabsToRight = (id) => {
    const index = state.tabs.findIndex((t) => t.id === id);
    if (index === -1) return;
    state.tabs = state.tabs.filter((t, i) => i <= index || t.pinned || t.closable === false);
  };

  const updateTabTitle = (id, title) => {
    const tab = state.tabs.find((t) => t.id === id);
    if (tab) tab.title = title;
  };

  const setTabDirty = (id, dirty) => {
    if (dirty) state.dirtyTabs.add(id);
    else state.dirtyTabs.delete(id);
  };

  const isTabDirty = (id) => state.dirtyTabs.has(id);

  const getTabById = (id) => state.tabs.find((t) => t.id === id);

  const resetTabs = () => {
    state.tabs = [];
    state.activeTabId = null;
    state.dirtyTabs.clear();
  };

  return {
    tabs,
    activeTabId,
    openTab,
    switchTab,
    closeTab,
    pinTab,
    closeOtherTabs,
    closeTabsToRight,
    updateTabTitle,
    setTabDirty,
    isTabDirty,
    getTabById,
    resetTabs,
  };
}
