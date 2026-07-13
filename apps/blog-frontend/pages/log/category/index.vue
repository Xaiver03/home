<script setup>
definePageMeta({
  layout: 'classics',
});
const config = useRuntimeConfig();
// 获取所有文章类别
const { data: dataList, error: getCategoriesError } = await useAsyncData(
  'getCategories',
  async () =>
    await api.getAllArticleTypes().then((res) => {
      return res;
    }),
);
</script>

<template>
  <main id="log-category" class="content-box blog-page-shell">
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Archive map</span>
        <h1>文章类目</h1>
      </div>
      <p>按主题进入不同写作脉络。类目封面缺失时会使用站点默认图，不影响阅读入口。</p>
    </header>
    <RepeatEmptyPlaceholder :dataReady="Boolean(dataList)" :dataShow="dataList?.length > 0">
      <div class="blog-list-stack">
        <nuxt-link
          class="blog-card-link"
          :to="`/log/category/${item.id}`"
          v-for="item in dataList"
          :key="item.id"
        >
          <RepeatDataCard
            :imagePath="`${config.public.ossUrl}/image/articleTypeCover/${item.id}.png`"
            :data="item"
            :dataOption="{
              mainAttribute: 'theme',
              secondAttribute: 'introduction',
              additional: {
                icon: '整理于',
                attribute: 'createTime',
              },
            }"
            v-motion
            :initial="{ opacity: 0, y: 18 }"
            :visibleOnce="{
              opacity: 1,
              y: 0,
              transition: {
                duration: 280,
              },
            }"
          />
        </nuxt-link>
      </div>
    </RepeatEmptyPlaceholder>
  </main>
</template>

<style lang="scss" scoped></style>
