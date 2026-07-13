<script setup>
const router = useRouter();
definePageMeta({
  layout: 'classics',
});
// --搜索模块--
let searchContent = ref('');
let searchOrNot = ref(false); // 是否搜索标记量
let lastSearchContent = ref(''); // 上次搜索内容
const search = () => {
  // 搜索事件
  if (!searchOrNot.value || lastSearchContent.value != searchContent.value) {
    // 第一次搜索或者搜索不同内容，初始化搜索量
    searchOrNot.value = true; // 标记搜索
    currentPage.value = 1;
    articleList.value = [];
  }
  lastSearchContent.value = searchContent.value; // 同步上次搜索
  api
    .searchArticle({
      searchContent: searchContent.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    })
    .then((res) => {
      total.value = res.count;
      for (let row of res.rows) {
        row.createTime = utils.formatDate(row.createTime);
      }
      articleList.value.push(...res.rows);
    });
};

// --列表模块--
const total = useState('total', () => 0);
const currentPage = useState('currentPage', () => 1);
const pageSize = useState('pageSize', () => 10);
// 服务端 - 获取文章列表
const { data: articleList, error: articleListError } = await useAsyncData(
  'getArticleList',
  async () => {
    total.value = 0;
    currentPage.value = 1;
    pageSize.value = 10;
    return await api
      .getArticleListOrderByTime({
        currentPage: currentPage.value,
        pageSize: pageSize.value,
      })
      .then((res) => {
        total.value = res.count;
        for (let row of res.rows) {
          row.createTime = utils.formatDate(row.createTime);
        }
        return res.rows;
      });
  },
);
const getArticleList = () => {
  // 获取文章列表
  api
    .getArticleListOrderByTime({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    })
    .then((res) => {
      total.value = res.count;
      for (let row of res.rows) {
        row.createTime = utils.formatDate(row.createTime);
      }
      articleList.value.push(...res.rows);
    });
};
const getMore = () => {
  // 获取更多文章
  currentPage.value++;
  if (searchOrNot.value) {
    // 判断是否搜索
    search(); // 继续搜索更多文章
  } else {
    getArticleList(); // 查看更多默认文章
  }
};
</script>

<template>
  <main id="log-list" class="content-box blog-page-shell">
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Article list</span>
        <h1>文章列表</h1>
      </div>
      <p>按时间整理公开文章。搜索会在当前公开归档里筛选标题，完整阅读从这里进入。</p>
    </header>
    <div class="blog-glass-panel search-panel">
      <a-input-search
        v-model:value="searchContent"
        class="blog-search"
        placeholder="搜索文章标题"
        size="large"
        @search="search"
      >
        <template #enterButton>
          <a-button>搜索</a-button>
        </template>
      </a-input-search>
    </div>
    <RepeatEmptyPlaceholder :dataReady="Boolean(articleList)" :dataShow="articleList?.length > 0">
      <div id="list" class="blog-list-stack">
        <nuxt-link
          class="blog-card-link"
          v-for="item in articleList"
          :key="item.id"
          :to="`/log/article/detail/${item.id}`"
        >
          <RepeatDataCard
            :data="item"
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

<style lang="scss" scoped>
#log-list {
  .search-panel {
    padding: 1rem;
    max-width: 52rem;
  }
}
</style>
