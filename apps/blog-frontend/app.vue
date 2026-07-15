<script setup>
import { watch } from 'vue';
import { applyThemeVars, normalizeThemeMode, persistTheme } from '@xld/design-tokens'
import { COMPANY_BRAND, getCompanySeo } from '~/composables/companyBrand';
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
const faviconUrl = computed(() => store.$state.config['my-avatar']?.content || COMPANY_BRAND.logo)
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

watch(() => router.currentRoute.value.path, (newVal) => {
  const seoItem = getCompanySeo(newVal)
  useHead({
    title: seoItem.title,
    meta: [{ name: 'description', content: seoItem.description }],
  })
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
