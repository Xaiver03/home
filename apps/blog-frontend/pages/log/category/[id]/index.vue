<script setup>
import { COMPANY_BRAND } from '~/composables/companyBrand';
const route = useRoute();
definePageMeta({
  layout: 'classics',
});
const config = useRuntimeConfig();
const total = useState('total', () => 0);
const currentPage = useState('currentPage', () => 1);
const pageSize = useState('pageSize', () => 10);
// 服务端 - 获取文章列表
const { data: articleList, error: getArticleListError } = await useAsyncData(
  `getArticleList-index-${route.params.id}`,
  async () => {
    total.value = 0;
    currentPage.value = 1;
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
  `getCategory-index-${route.params.id}`,
  async () =>
    await api.getArticleTypeById(route.params.id).then((res) => {
      return res;
    }),
);
useHead({
  title: category.value
    ? `${category.value?.theme}类文章｜${COMPANY_BRAND.blogName}`
    : `文章类目｜${COMPANY_BRAND.blogName}`,
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
      <p>{{ category?.introduction || '这个类目下的公开文章会按时间继续展开。' }}</p>
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
        <RepeatMoreButton v-if="articleList?.length < total" :clickEvent="getMore" />
      </div>
    </RepeatEmptyPlaceholder>
  </main>
</template>

<style lang="scss" scoped></style>
