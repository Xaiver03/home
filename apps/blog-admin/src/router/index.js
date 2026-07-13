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
        redirect: '/log',
    },
    {
        path: '/log',
        name: '博客',
        component: () => import('../pages/log/LogPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/log/list',
        name: '博客列表',
        component: () => import('../pages/log/LogListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/log/phone-list',
        name: '博客手机列表',
        component: () => import('../pages/log/phone/LogListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/log/edit',
        name: '博客编辑',
        component: () => import('../pages/log/LogEditPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/log/type',
        name: '博客类目',
        component: () => import('../pages/log/LogTypePage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/log/comment',
        name: '评论管理',
        component: () => import('../pages/log/LogCommentPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/message',
        name: '留言',
        component: () => import('../pages/message/MessageListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/message/phone-edit',
        name: '留言编辑手机端',
        component: () => import('../pages/message/phone/MessageEditPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/message/phone-list',
        name: '留言列表手机端',
        component: () => import('../pages/message/phone/MessageListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/user',
        name: '用户',
        component: () => import('../pages/user/UserPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/user/list',
        name: '用户列表',
        component: () => import('../pages/user/UserListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/user/admin',
        name: '管理员列表',
        component: () => import('../pages/user/AdminListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/friendLink',
        name: '友链',
        component: () => import('../pages/friendLink/friendLinkListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/config',
        name: '配置',
        component: () => import('../pages/configuration/ConfigListPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/about',
        name: 'About管理',
        component: () => import('../pages/about/AboutManagePage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/home-manage',
        name: '主页管理',
        component: () => import('../pages/home/HomeManagePage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/music',
        name: '音乐管理',
        component: () => import('../pages/music/MusicCookiePage.vue'),
        meta: { requiresAuth: true },
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
    if (to.name !== '登录' && !isAuthenticated) {
        next({ name: '登录', replace: true })
        return
    }
    next()
})

export default router
