<template>
  <a-layout-sider
    class="admin-sidebar"
    :width="240"
    :collapsed="collapsed"
    :trigger="null"
    collapsible
  >
    <!-- 品牌区 -->
    <div class="sidebar-brand" @click="router.push('/')">
      <div class="brand-icon">
        <DashboardOutlined />
      </div>
      <Transition name="fade">
        <div v-if="!collapsed" class="brand-text">
          <span class="brand-name">Xaiver Space</span>
          <span class="brand-sub">管理后台</span>
        </div>
      </Transition>
    </div>

    <!-- 导航菜单 -->
    <div class="sidebar-nav">
      <div v-for="group in menuGroups" :key="group.key" class="nav-group">
        <!-- 分组标题 -->
        <div
          class="group-header"
          :class="{ collapsed: collapsed }"
          @click="toggleGroup(group.key)"
        >
          <component :is="group.icon" v-if="collapsed" class="group-icon" />
          <span v-if="!collapsed" class="group-label">{{ group.label }}</span>
          <span v-if="!collapsed" class="group-arrow" :class="{ open: openGroups.has(group.key) }">
            <DownOutlined />
          </span>
        </div>

        <!-- 分组菜单项 -->
        <Transition name="slide">
          <div v-show="openGroups.has(group.key) || collapsed" class="group-items">
            <div
              v-for="item in group.items"
              :key="item.key"
              class="nav-item"
              :class="{ active: selectedKeys.includes(item.key) }"
              @click="router.push(item.key)"
            >
              <component :is="item.icon" class="item-icon" />
              <span v-if="!collapsed" class="item-label">{{ item.label }}</span>
              <span v-if="item.badge && !collapsed" class="item-badge">{{ item.badge }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 底部折叠按钮 -->
    <div class="sidebar-footer">
      <a-button type="text" class="collapse-btn" @click="toggleCollapse">
        <template #icon>
          <MenuFoldOutlined v-if="!collapsed" />
          <MenuUnfoldOutlined v-else />
        </template>
        <span v-if="!collapsed">收起菜单</span>
      </a-button>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  BarChartOutlined,
  EditOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CommentOutlined,
  MailOutlined,
  TeamOutlined,
  SafetyOutlined,
  LinkOutlined,
  ControlOutlined,
  HomeOutlined,
  IdcardOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const openGroups = reactive(new Set(['dashboard', 'content', 'user', 'site']));

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function toggleGroup(key) {
  if (openGroups.has(key)) {
    openGroups.delete(key);
  } else {
    openGroups.add(key);
  }
}

const menuGroups = [
  {
    key: 'dashboard',
    label: '概览',
    icon: DashboardOutlined,
    items: [
      { key: '/', label: '首页', icon: HomeOutlined },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    icon: FileTextOutlined,
    items: [
      { key: '/log', label: '博客看板', icon: BarChartOutlined },
      { key: '/log/list', label: '博客列表', icon: FileTextOutlined },
      { key: '/log/edit', label: '博客编辑', icon: EditOutlined },
      { key: '/log/type', label: '博客类目', icon: AppstoreOutlined },
      { key: '/log/comment', label: '评论管理', icon: CommentOutlined },
      { key: '/message', label: '留言管理', icon: MessageOutlined },
    ],
  },
  {
    key: 'user',
    label: '用户管理',
    icon: UserOutlined,
    items: [
      { key: '/user/list', label: '用户列表', icon: TeamOutlined },
      { key: '/user/admin', label: '管理员', icon: SafetyOutlined },
    ],
  },
  {
    key: 'site',
    label: '站点管理',
    icon: SettingOutlined,
    items: [
      { key: '/friendLink', label: '友链', icon: LinkOutlined },
      { key: '/config', label: '配置', icon: ControlOutlined },
      { key: '/home-manage', label: '主页管理', icon: HomeOutlined },
      { key: '/about', label: 'About', icon: IdcardOutlined },
      { key: '/music', label: '音乐', icon: CustomerServiceOutlined },
    ],
  },
];

const selectedKeys = computed(() => {
  const cleanPath = route.path.split('?')[0];
  const allKeys = menuGroups.flatMap(g => g.items.map(i => i.key));
  const sorted = [...allKeys].sort((a, b) => b.length - a.length);
  const match = sorted.find(p => cleanPath === p || cleanPath.startsWith(p + '/'));
  return match ? [match] : [];
});
</script>

<style lang="scss" scoped>
// 蓝白配色常量
$sidebar-bg: #f8f9fc;
$sidebar-brand-bg: #1677ff;
$sidebar-brand-text: #ffffff;
$sidebar-active-bg: #e6f4ff;
$sidebar-active-text: #1677ff;
$sidebar-active-border: #1677ff;
$sidebar-hover-bg: #f0f2f5;
$sidebar-text: #4a5568;
$sidebar-text-secondary: #8b95a5;
$sidebar-group-label: #6b7a90;
$sidebar-border: #e8ecf1;
$sidebar-item-radius: 8px;

.admin-sidebar {
  min-height: 100vh;
  background: $sidebar-bg !important;
  border-right: 1px solid $sidebar-border;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  // 品牌区
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 18px;
    margin: 12px 12px 8px;
    background: $sidebar-brand-bg;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;

    &:hover {
      filter: brightness(1.05);
    }

    .brand-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 20px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      overflow: hidden;

      .brand-name {
        font-size: 15px;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
      }
      .brand-sub {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.75);
        white-space: nowrap;
      }
    }
  }

  // 导航区
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 4px 10px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
  }

  .nav-group {
    margin-bottom: 4px;

    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      margin: 8px 2px 4px;
      font-size: 11px;
      font-weight: 600;
      color: $sidebar-group-label;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      user-select: none;
      border-radius: 6px;
      transition: all 0.15s ease;

      &:hover {
        background: $sidebar-hover-bg;
      }

      &.collapsed {
        justify-content: center;
        padding: 8px 0;

        .group-icon {
          font-size: 18px;
        }
      }

      .group-label {
        flex: 1;
      }

      .group-arrow {
        font-size: 10px;
        transition: transform 0.2s ease;
        color: $sidebar-text-secondary;

        &.open {
          transform: rotate(180deg);
        }
      }
    }

    .group-items {
      overflow: hidden;
    }
  }

  // 菜单项
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    margin: 1px 2px;
    border-radius: $sidebar-item-radius;
    cursor: pointer;
    color: $sidebar-text;
    font-size: 13.5px;
    font-weight: 450;
    transition: all 0.15s ease;
    position: relative;

    .item-icon {
      flex-shrink: 0;
      font-size: 17px;
      color: $sidebar-text-secondary;
      transition: color 0.15s ease;
    }

    .item-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 10px;
      background: $sidebar-active-bg;
      color: $sidebar-active-text;
      font-weight: 600;
    }

    &:hover {
      background: $sidebar-hover-bg;
      color: $sidebar-text;

      .item-icon {
        color: $sidebar-active-text;
      }
    }

    &.active {
      background: $sidebar-active-bg;
      color: $sidebar-active-text;
      font-weight: 600;

      .item-icon {
        color: $sidebar-active-text;
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: $sidebar-active-border;
        border-radius: 0 2px 2px 0;
      }
    }
  }

  // 底部
  .sidebar-footer {
    padding: 10px;
    border-top: 1px solid $sidebar-border;

    .collapse-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: $sidebar-text-secondary;
      font-size: 13px;
      border-radius: 8px;
      padding: 8px;

      &:hover {
        background: $sidebar-hover-bg;
        color: $sidebar-text;
      }
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
