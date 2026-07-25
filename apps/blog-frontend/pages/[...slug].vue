<script setup>
const event = useRequestEvent();
if (event) setResponseStatus(event, 404);

useSeoMeta({
  title: '页面未找到｜灯下灯',
  description: '你访问的页面不存在或已经移动。',
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div class="h-[100vh] w-[100vw] gap-4 flex flex-col justify-center items-center">
    <i class="!text-[20rem] iconfont icon-icon-test"></i>
    <p class="text-8xl">没有找到这个页面<span id="loading">📡</span></p>
    <nuxt-link to="/">
      <a-button class="mt-16" type="primary" shape="round" size="large">返回博客首页</a-button>
    </nuxt-link>
  </div>
</template>

<style lang="scss" scoped>
#loading {
  animation: gradientAnimation 1.5s linear infinite;
}

// loading渐变动画
@keyframes gradientAnimation {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.3;
  }
}
</style>
