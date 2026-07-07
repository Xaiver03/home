import { createRouter, createWebHistory } from "vue-router";
// 定义路由规则
const routes = [
    {
        path: '/login',
        name: '登录',
        component: () => import('../pages/LoginPage.vue'),
    },
    {
        path: '/',
        name: '首页',
        component: () => import('../pages/HomePage.vue'),
    },
    {
        path: '/log',
        name: '博客',
        component: () => import('../pages/log/LogPage.vue'),
    },
    {
        path: '/log/list',
        name: '博客列表',
        component: () => import('../pages/log/LogListPage.vue'),
    },
    {
        path: '/log/phone-list',
        name: '博客手机列表',
        component: () => import('../pages/log/phone/LogListPage.vue'),
    },
    {
        path: '/log/edit',
        name: '博客编辑',
        component: () => import('../pages/log/LogEditPage.vue'),
    },
    {
        path: '/log/type',
        name: '博客类目',
        component: () => import('../pages/log/LogTypePage.vue'),
    },
    {
        path: '/log/comment',
        name: '评论管理',
        component: () => import('../pages/log/LogCommentPage.vue'),
    },
    {
        path: '/message',
        name: '留言',
        component: () => import('../pages/message/MessageListPage.vue'),
    },
    {
        path: '/message/phone-edit',
        name: '留言编辑手机端',
        component: () => import('../pages/message/phone/MessageEditPage.vue'),
    },
    {
        path: '/message/phone-list',
        name: '留言列表手机端',
        component: () => import('../pages/message/phone/MessageListPage.vue'),
    },
    {
        path: '/user',
        name: '用户',
        component: () => import('../pages/user/UserPage.vue'),
    },
    {
        path: '/user/list',
        name: '用户列表',
        component: () => import('../pages/user/UserListPage.vue'),
    },
    {
        path: '/user/admin',
        name: '管理员列表',
        component: () => import('../pages/user/AdminListPage.vue'),
    },
    {
        path: '/friendLink',
        name: '友链',
        component: () => import('../pages/friendLink/friendLinkListPage.vue'),
    },
    {
        path: '/config',
        name: '配置',
        component: () => import('../pages/configuration/ConfigListPage.vue'),
    },
    {
        path: '/about',
        name: 'About管理',
        component: () => import('../pages/about/AboutManagePage.vue'),
    },
    {
        path: '/home-manage',
        name: '主页管理',
        component: () => import('../pages/home/HomeManagePage.vue'),
    },
    {
        path: '/music',
        name: '音乐管理',
        component: () => import('../pages/music/MusicCookiePage.vue'),
    },
]

import { getToken } from "@/utils/auth";

const router = createRouter({
    history: createWebHistory(import.meta.env.MODE === 'pro' ? '/admin/' : '/'),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!getToken();
    if (to.path != '/login' && !isAuthenticated) {
        next({ path: '/login' })
        return
    }
    next()
})

export default router
