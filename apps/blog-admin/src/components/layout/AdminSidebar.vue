<template>
  <a-layout-sider
    class="admin-sidebar"
    :width="collapsed ? 64 : 224"
    :collapsed="collapsed"
    :trigger="null"
    collapsible
  >
    <!-- 品牌区 —— 完全对齐 SSOS SidebarHeader -->
    <div class="sidebar-header">
      <a-tooltip :title="collapsed ? 'Xaiver Space' : ''" placement="right">
        <div class="brand-btn" @click="router.push('/')">
          <div class="brand-logo">
            <DashboardOutlined />
          </div>
          <div v-if="!collapsed" class="brand-info">
            <span class="brand-name">Xaiver Space</span>
            <span class="brand-desc">博客管理</span>
          </div>
        </div>
      </a-tooltip>
    </div>

    <!-- 导航区 -->
    <div class="sidebar-content">
      <div v-for="group in menuGroups" :key="group.key" class="nav-group">
        <div class="group-label" @click="toggleGroup(group.key)">
          <span v-if="!collapsed">{{ group.label }}</span>
        </div>
        <ul v-show="openGroups.has(group.key) || collapsed" class="nav-menu">
          <li
            v-for="item in group.items"
            :key="item.key"
            class="nav-menu-item"
            :class="{ active: selectedKeys.includes(item.key) }"
          >
            <a-tooltip :title="collapsed ? item.label : ''" placement="right">
              <button class="nav-menu-btn" :data-active="selectedKeys.includes(item.key)" @click="router.push(item.key)">
                <component :is="item.icon" class="nav-icon" />
                <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
                <span v-if="item.badge && !collapsed" class="nav-badge">{{ item.badge }}</span>
              </button>
            </a-tooltip>
          </li>
        </ul>
      </div>
    </div>

    <!-- 底部区 —— 对齐 SSOS SidebarFooter -->
    <div class="sidebar-footer">
      <!-- 主题切换 -->
      <ul class="footer-menu">
        <li class="footer-menu-item">
          <button class="nav-menu-btn" @click="toggleTheme">
            <BulbOutlined v-if="currentTheme === 'Dark'" class="nav-icon" />
            <BgColorsOutlined v-else class="nav-icon" />
            <span v-if="!collapsed">{{ currentTheme === 'Dark' ? '亮色模式' : '暗色模式' }}</span>
          </button>
        </li>
        <!-- 折叠按钮 -->
        <li class="footer-menu-item">
          <button class="nav-menu-btn" @click="toggleCollapse">
            <MenuFoldOutlined v-if="!collapsed" class="nav-icon" />
            <MenuUnfoldOutlined v-else class="nav-icon" />
            <span v-if="!collapsed">收起菜单</span>
          </button>
        </li>
      </ul>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  EditOutlined,
  AppstoreOutlined,
  CommentOutlined,
  TeamOutlined,
  SafetyOutlined,
  LinkOutlined,
  ControlOutlined,
  HomeOutlined,
  IdcardOutlined,
  CustomerServiceOutlined,
  BulbOutlined,
  BgColorsOutlined,
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const collapsed = ref(false);
const openGroups = reactive(new Set(['dashboard', 'content', 'user', 'site']));
const currentTheme = ref(localStorage.getItem('theme') || 'Light');

function toggleCollapse() { collapsed.value = !collapsed.value; }
function toggleGroup(key) { openGroups.has(key) ? openGroups.delete(key) : openGroups.add(key); }
function toggleTheme() {
  const next = currentTheme.value === 'Dark' ? 'Light' : 'Dark';
  currentTheme.value = next;
  store.commit('SET_THEME', next);
}

// 主题联动：当外部切换主题时同步状态
watch(() => store.state.themeMode, (v) => { currentTheme.value = v; });

const menuGroups = [
  {
    key: 'dashboard',
    label: '概览',
    items: [
      { key: '/', label: '首页', icon: HomeOutlined },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
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
    items: [
      { key: '/user/list', label: '用户列表', icon: TeamOutlined },
      { key: '/user/admin', label: '管理员', icon: SafetyOutlined },
    ],
  },
  {
    key: 'site',
    label: '站点管理',
    items: [
      { key: '/friendLink', label: '友链', icon: LinkOutlined },
      { key: '/config', label: '配置', icon: ControlOutlined },
      { key: '/home-manage', label: '主页', icon: HomeOutlined },
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
// ============================================================
// SSOS shadcn/ui Sidebar 1:1 对齐
// Light mode colors (HSL values from SSOS index.css):
//   --sidebar-bg:   0 0% 98%     → #fafafa
//   --sidebar-fg:   240 5.3% 26.1% → #3f3f46
//   --sidebar-accent: 240 4.8% 95.9% → #f1f1f5
//   --sidebar-accent-fg: 240 5.9% 10% → #18181b
//   --sidebar-border: 220 13% 91% → #e1e3e8
// ============================================================

$sb-bg:          hsl(0, 0%, 98%);
$sb-fg:          hsl(240, 5.3%, 26.1%);
$sb-fg-muted:    hsla(240, 5.3%, 26.1%, 0.7);
$sb-accent:      hsl(240, 4.8%, 95.9%);
$sb-accent-fg:   hsl(240, 5.9%, 10%);
$sb-border:      hsl(220, 13%, 91%);
$sb-primary:     hsl(224, 76%, 48%);
$sb-primary-fg:  hsl(0, 0%, 98%);
$sb-radius:      0.375rem;  // rounded-md
$sb-transition:  150ms ease;

.admin-sidebar {
  min-height: 100vh;
  background: $sb-bg !important;
  color: $sb-fg;
  border-right: 1px solid $sb-border;
  display: flex;
  flex-direction: column;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
}

// ============================================================
// Header — 对齐 SSOS SidebarHeader + SidebarMenuButton(size=lg)
// ============================================================
.sidebar-header {
  padding: 0.5rem;

  .brand-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: $sb-radius;
    cursor: pointer;
    transition: background $sb-transition;
    user-select: none;
    overflow: hidden;

    &:hover { background: $sb-accent; }
  }

  .brand-logo {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    background: $sb-primary;
    color: $sb-primary-fg;
    font-size: 1.125rem;
  }

  .brand-info {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
    overflow: hidden;

    .brand-name {
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .brand-desc {
      font-size: 0.75rem;
      color: $sb-fg-muted;
      white-space: nowrap;
    }
  }
}

// ============================================================
// Content — 对齐 SSOS SidebarContent > SidebarGroup
// ============================================================
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 0.5rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 4px;
  }
}

.nav-group {
  padding: 0.25rem 0;
}

// GroupLabel — 对齐 SSOS SidebarGroupLabel: h-8 px-2 text-xs font-medium muted
.group-label {
  display: flex;
  align-items: center;
  height: 2rem;
  padding: 0 0.5rem;
  margin: 0.125rem 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: $sb-fg-muted;
  cursor: pointer;
  user-select: none;
  border-radius: $sb-radius;
}

// Menu — 对齐 SSOS SidebarMenu: flex flex-col gap-1
.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

// MenuItem — 对齐 SSOS SidebarMenuItem
.nav-menu-item { position: relative; }

// MenuButton — 对齐 SSOS SidebarMenuButton
// "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2
//  text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
//  data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium
//  data-[active=true]:text-sidebar-accent-foreground
//  [&>svg]:size-4 [&>svg]:shrink-0 [&>span:last-child]:truncate"
.nav-menu-btn {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  border-radius: $sb-radius;
  padding: 0.5rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 400;
  color: $sb-fg;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background $sb-transition, color $sb-transition;
  outline: none;
  font-family: inherit;
  line-height: 1.25rem;

  &:hover {
    background: $sb-accent;
    color: $sb-accent-fg;
  }

  &[data-active='true'],
  &[data-active=true] {
    background: $sb-accent;
    color: $sb-accent-fg;
    font-weight: 500;
  }

  .nav-icon {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    font-size: 1rem;
  }
}

// Badge — 对齐 SSOS SidebarMenuBadge
.nav-badge {
  font-size: 0.625rem;
  padding: 0.0625rem 0.375rem;
  border-radius: 9999px;
  background: rgba($sb-primary, 0.1);
  color: $sb-primary;
  font-weight: 600;
  line-height: 1rem;
}

// ============================================================
// Footer — 对齐 SSOS SidebarFooter
// ============================================================
.sidebar-footer {
  padding: 0.25rem 0.5rem;
  border-top: 1px solid $sb-border;

  .footer-menu {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .footer-menu-item {
    .nav-menu-btn {
      font-size: 0.8125rem;
      font-weight: 400;
    }
  }
}
</style>
