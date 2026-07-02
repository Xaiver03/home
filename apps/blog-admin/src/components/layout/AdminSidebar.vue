<template>
  <a-layout-sider
    class="admin-sidebar"
    :width="220"
    :collapsed="collapsed"
    :trigger="null"
    collapsible
  >
    <div class="sidebar-header">
      <span v-if="!collapsed" class="title">管理后台</span>
      <a-button type="text" @click="toggleCollapse">
        <template #icon>
          <MenuFoldOutlined v-if="!collapsed" />
          <MenuUnfoldOutlined v-else />
        </template>
      </a-button>
    </div>

    <a-menu
      mode="inline"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      :inline-collapsed="collapsed"
      :items="menuItems"
      @click="handleClick"
      @openChange="handleOpenChange"
    />
  </a-layout-sider>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const openKeys = ref([]);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

const menuItems = [
  {
    key: '/',
    icon: () => h(DashboardOutlined),
    label: '首页',
    title: '首页',
  },
  {
    key: 'content',
    icon: () => h(FileTextOutlined),
    label: '内容管理',
    title: '内容管理',
    children: [
      { key: '/log', label: '博客看板', title: '博客看板' },
      { key: '/log/list', label: '博客列表', title: '博客列表' },
      { key: '/log/edit', label: '博客编辑', title: '博客编辑' },
      { key: '/log/type', label: '博客类目', title: '博客类目' },
      { key: '/log/comment', label: '评论管理', title: '评论管理' },
      { key: '/message', label: '留言管理', title: '留言管理' },
    ],
  },
  {
    key: 'user',
    icon: () => h(UserOutlined),
    label: '用户管理',
    title: '用户管理',
    children: [
      { key: '/user/list', label: '用户列表', title: '用户列表' },
      { key: '/user/admin', label: '管理员列表', title: '管理员列表' },
    ],
  },
  {
    key: 'site',
    icon: () => h(SettingOutlined),
    label: '站点管理',
    title: '站点管理',
    children: [
      { key: '/friendLink', label: '友链', title: '友链' },
      { key: '/config', label: '配置', title: '配置' },
      { key: '/home-manage', label: '主页管理', title: '主页管理' },
      { key: '/about', label: 'About管理', title: 'About管理' },
      { key: '/music', label: '音乐', title: '音乐' },
    ],
  },
];

const selectedKeys = computed(() => {
  const cleanPath = route.path.split('?')[0];
  // 最长前缀匹配
  const candidates = [
    '/log/comment',
    '/log/type',
    '/log/edit',
    '/log/list',
    '/log',
    '/message',
    '/user/list',
    '/user/admin',
    '/friendLink',
    '/config',
    '/home-manage',
    '/about',
    '/music',
    '/',
  ];
  const match = candidates.find((p) => cleanPath === p || cleanPath.startsWith(p + '/'));
  return match ? [match] : [];
});

watch(
  selectedKeys,
  (keys) => {
    const key = keys[0];
    if (!key) return;
    const groupMap = {
      '/log': 'content',
      '/log/list': 'content',
      '/log/edit': 'content',
      '/log/type': 'content',
      '/log/comment': 'content',
      '/message': 'content',
      '/user/list': 'user',
      '/user/admin': 'user',
    };
    const group = groupMap[key];
    if (group && !openKeys.value.includes(group)) {
      openKeys.value = [...openKeys.value, group];
    }
  },
  { immediate: true }
);

function handleClick({ key }) {
  router.push(key);
}

function handleOpenChange(keys) {
  openKeys.value = keys;
}
</script>

<style lang="scss" scoped>
.admin-sidebar {
  min-height: 100vh;
  background: $main-background-color;
  border-right: 1px solid $secondary-text-color;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid $secondary-text-color;

    .title {
      font-size: $normal-font-size;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  :deep(.ant-menu) {
    flex: 1;
    border-right: none;
    background: transparent;
  }
}
</style>
