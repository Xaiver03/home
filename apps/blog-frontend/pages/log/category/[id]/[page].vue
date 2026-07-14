<script setup>
const route = useRoute();
definePageMeta({
  layout: 'classics',
});
const config = useRuntimeConfig();
const total = useState('total', () => 0);
const currentPage = useState('currentPage', () => route.params.page);
const pageSize = useState('pageSize', () => 10);
// 服务端 - 获取文章列表
const { data: articleList, error: getArticleListError } = await useAsyncData(
  `getArticleList-page-${route.params.id}-${route.params.page}`,
  async () => {
    total.value = 0;
    currentPage.value = route.params.page;
    pageSize.value = 10;
    return await api
      .getArticleByTypeId(route.params.id, currentPage.value, pageSize.value)
      .then((res) => {
        total.value = res.count;
        return res.rows;
      });
  },
);
// 服务端 - 获取类目数据
const { data: category, error: getCategoryError } = await useAsyncData(
  `getCategory-page-${route.params.id}-${route.params.page}`,
  async () =>
    await api.getArticleTypeById(route.params.id).then((res) => {
      return res;
    }),
);
useHead({
  title: category.value ? `${category.value?.theme}类文章 【 灯下灯 】` : '文章类目【 灯下灯 】',
});
const getArticleByTypeId = () => {
  // 通过typeId获取该类别下的文章
  api.getArticleByTypeId(route.params.id, currentPage.value, pageSize.value).then((res) => {
    total.value = res.count;
    articleList.value.push(...res.rows);
  });
};
const getMore = () => {
  // 获取更多该typeId类别下的文章
  currentPage.value++;
  getArticleByTypeId();
};
</script>

<template>
  <main id="log-category" class="content-box blog-page-shell">
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Category</span>
        <h1>{{ category ? category.theme : '文章列表加载中' }}</h1>
      </div>
      <p>
        第 {{ route.params.page }} 页。{{
          category?.introduction || '这个类目下的公开文章会继续展开。'
        }}
      </p>
    </header>
    <RepeatEmptyPlaceholder :dataReady="Boolean(articleList)" :dataShow="articleList?.length > 0">
      <div class="blog-list-stack">
        <nuxt-link
          class="blog-card-link"
          v-for="item in articleList"
          :key="item.id"
          :to="`/log/article/detail/${item.id}`"
        >
          <RepeatDataCard
            :imagePath="`${config.public.storageUrl}/image/articleCover/${item.id}.png`"
            :data="item"
            :dataOption="{
              mainAttribute: 'topic',
              secondAttribute: 'introduction',
              additional: {
                icon: '发布于',
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
        <RepeatMoreButton
          v-if="articleList?.length < total - (route.params.page - 1) * pageSize"
          :clickEvent="getMore"
        />
      </div>
    </RepeatEmptyPlaceholder>
  </main>
</template>

<style lang="scss" scoped></style>
