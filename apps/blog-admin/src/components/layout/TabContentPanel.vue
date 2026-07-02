<template>
  <div class="tab-content-panel">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedNames">
        <component :is="Component" :key="routeKey" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 以完整路径作为 keep-alive key，保证不同查询参数的页面独立缓存
const routeKey = computed(() => route.fullPath);

// 若业务页面自己定义了 name，则按 name 缓存；否则退回到路径 key
const cachedNames = computed(() => {
  return [];
});
</script>

<style lang="scss" scoped>
.tab-content-panel {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: $main-background-color;
}
</style>
