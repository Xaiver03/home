<!--
  =============================================================================
  Project: space-log-nuxt3
  Author: Xaiver(github: Xaiver76)
  Created: 2025
  License: MIT License
  Description: 
  本项目开源，欢迎参考、学习和改进。。
  请尊重作者版权，保留作者信息及本文件中的 LICENSE 注释。
  欢迎通过 Pull Request 或 Issue 方式提出改进意见，一起让项目更好。
  如果你喜欢本项目，欢迎点个 Star ⭐ 支持，也欢迎分享和改进。
  关于作者：https://bokey.space
  =============================================================================
-->


<script setup>
import { watch } from 'vue';
import { applyThemeVars, normalizeThemeMode, persistTheme } from '@xld/design-tokens'
const router = useRouter()
const store = useNuxtStore()
// --rem设置--
// 重新设置根元素font-size
const reScreenSize = () => {
  const root = document.documentElement
  let w = root.clientWidth; // 获取设备的宽度
  if (w <= 786) {
    root.style.fontSize = '6.4px'
    return
  }
  let n =
    10 * (w / 1920) > 40
      ? 40
      : 10 * (w / 1920) >= 7.4
        ? 10 * (w / 1920)
        : 7.4;
  root.style.fontSize = n + 'px';
  store.setRem(n)
};
const resizeEvent = () => { // 窗口变化回调
  store.setWindowSize(window.innerWidth, window.innerHeight)
  reScreenSize()
}

// --主题/配置设置--
const setThemeMode = () => { // 获取缓存设置主题
  const theme = localStorage.getItem('theme')
  if (theme) store.setThemeMode(normalizeThemeMode(theme))
}
const applyTheme = (newVal) => {
  applyThemeVars(persistTheme(newVal))
}
watch(() => store.themeMode, applyTheme)

// 动态 favicon
const faviconUrl = computed(() => store.$state.config['my-avatar']?.content || '/favicon.ico')
useHead({
  link: () => [{ rel: 'icon', href: faviconUrl.value }],
})

const getGlobalCOnfig = async () => { // 获取并设置全局配置
  await api.getGlobalConfig().then(res => {
    store.setConfig(res)
    // 加载icon
    if (store.$state.config['icon-href']) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = store.$state.config['icon-href'].content
      document.head.appendChild(link);
    }
  })
}

// --基础SEO设置--
const seo = [
  {
    path: '/',
    title: '灯下灯',
    description: '灯下灯的个人写作，记录生活、技术与思考。'
  },
  {
    path: '/about',
    title: '关于我',
    description: '关于Xaiver本人，这里是Xaiver的简介，记录着我的成长🧩'
  },
  {
    path: '/log/article',
    title: '灯下灯的文章',
    description: '灯下灯的文章详情。'
  },
  {
    path: '/link',
    title: 'Xaiver的朋友们',
    description: 'Xaiver的友链，我们通过这种方式和世界链接，在浩瀚宇宙里，很高兴遇见你🪄'
  },
  {
    path: '/log/category',
    title: 'Xaiver的文章类目列表',
    description: 'Xaiver的文章类目，每个类下都是崭新的篇章📖'
  },
  {
    path: '/log/article',
    title: 'Xaiver的文章列表',
    description: 'Xaiver的文章列表，每一篇都是我的成长⭐️'
  },
  {
    path: '/message',
    title: '留言板',
    description: '留下想说的话，也可以在匿名树洞里写下问题。'
  },
  {
    path: '/ask',
    title: '匿名树洞',
    description: '匿名写下问题，保存追踪码，等待审核与答复。'
  }
]
watch(() => router.currentRoute.value.path, (newVal) => {
  const seoItem = seo.find(item => item.path == newVal)
  if (seoItem) {
    const header = {
      title: seoItem.title,
      meta: []
    }
    if (seoItem.description) header.meta.push({
      name: 'description',
      content: seoItem.description
    })
    useHead(header)
  }
}, { immediate: true })

onMounted(async () => {
  window.addEventListener('resize', resizeEvent)
  resizeEvent()
  setThemeMode()
  applyTheme(store.themeMode)
  await getGlobalCOnfig()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeEvent)
})
</script>

<template>
  <NuxtLayout>
    <CommonInitialLoader></CommonInitialLoader>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss"></style>
