<script setup>
const router = useRouter();
const route = useRoute();

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

// --分类筛选模块--
const selectedCategoryId = ref('all');
const categories = ref([]);
const selectCategory = (categoryId) => {
  if (selectedCategoryId.value === categoryId) return;
  selectedCategoryId.value = categoryId;
  searchOrNot.value = false;
  searchContent.value = '';
  currentPage.value = 1;
  articleList.value = [];
  if (categoryId === 'all') {
    getArticleList();
  } else {
    getArticlesByCategory();
  }
};
const getArticlesByCategory = () => {
  api
    .getArticleByTypeId(selectedCategoryId.value, currentPage.value, pageSize.value)
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
const currentPage = useState('currentPage', () => route.params.page);
const pageSize = useState('pageSize', () => 10);
// 服务端 - 获取文章列表和分类
const { data: articleList, error: articleListError } = await useAsyncData(
  `getArticleList-page-${route.params.page}`,
  async () => {
    total.value = 0;
    currentPage.value = route.params.page;
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
  {
    watch: [() => route.params.page],
  },
);
const { data: categoryData } = await useAsyncData(
  'getCategories',
  async () => {
    const list = await api.getAllArticleTypes();
    return (list || []).filter((item) => Number.isInteger(Number(item?.id)) && item?.theme && item.theme !== '全部文章');
  },
);
if (categoryData.value) {
  categories.value = categoryData.value;
}
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
    search();
  } else if (selectedCategoryId.value !== 'all') {
    getArticlesByCategory();
  } else {
    getArticleList();
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
      <p>第 {{ route.params.page }} 页。继续按时间浏览公开归档，也可以直接搜索标题。</p>
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

    <!-- 分类筛选 -->
    <div v-if="categories.length" class="category-filter">
      <button
        class="category-chip"
        :class="{ active: selectedCategoryId === 'all' }"
        type="button"
        @click="selectCategory('all')"
      >
        全部
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-chip"
        :class="{ active: selectedCategoryId === String(cat.id) }"
        type="button"
        @click="selectCategory(String(cat.id))"
      >
        {{ cat.theme }}
      </button>
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
            @click="router.push(`/log/article/detail/${item.id}`)"
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

<style lang="scss" scoped>
#log-list {
  .search-panel {
    padding: 1rem;
    max-width: 52rem;
  }

  .category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    align-items: center;
    margin: 1.2rem 0 2rem;
    padding: 0.55rem;
    background: $surface-glass-strong;
    border: 1px solid $surface-border;
    border-radius: $radius-control;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 84%);
    backdrop-filter: blur(1rem) saturate(145%);
  }

  .category-chip {
    min-height: 2.6rem;
    padding: 0 1rem;
    color: $secondary-text-color;
    font: inherit;
    font-size: 1.3rem;
    font-weight: 500;
    background: transparent;
    border: 0;
    border-radius: $radius-control;
    cursor: pointer;
    transition:
      color 180ms ease,
      background 180ms ease,
      transform 180ms ease;

    &:hover {
      color: $main-text-color;
      background: $surface-hover;
    }

    &:active {
      transform: scale(0.98);
    }

    &.active {
      color: $surface-glass-strong;
      background: $main-text-color;
    }
  }
}
</style>
