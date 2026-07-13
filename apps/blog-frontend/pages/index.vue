<script setup>
const router = useRouter();
const store = useNuxtStore();
definePageMeta({
  layout: 'classics',
});
const goTo = (url, $event) => {
  // 跳转到其他网站
  $event.stopPropagation();
  window.open(url, '_blank');
};
// 获取文章列表数据
const { data: articleData, error: articleError } = await useAsyncData(
  'getArticleData',
  async () =>
    await api
      .getArticleListOrderByTime({
        currentPage: 1,
        pageSize: 7,
      })
      .then((res) => {
        for (let row of res.rows) {
          row.createTime = utils.formatDate(row.createTime);
        }
        const leadArticle = res.rows.shift();
        const articleList = res.rows;
        return {
          leadArticle,
          articleList,
        };
      }),
);
// 获取热门留言数据
const { data: hottestMessageList, error: hottestMessageError } = await useAsyncData(
  'getMessageData',
  async () =>
    await api
      .getComment({
        currentPage: 1,
        pageSize: 20,
        userId: -1,
        order: '[["createTime", "DESC"]]',
      })
      .then((res) => {
        return res.rows;
      }),
);
const likeMessage = (message) => {
  // 喜欢评论
  api.likeComment(message.id).then((res) => {
    if (utils.analysisData(res)) {
      message.like += 1;
    }
  });
};
</script>

<template>
  <main id="home" class="content-box blog-page-shell">
    <section id="xaiver" class="blog-glass-panel archive-hero" @click="router.push('/about')">
      <div class="hero-copy">
        <span class="blog-eyebrow">Public archive</span>
        <h1>灯下灯的博客</h1>
        <p>
          这里继续展开文章列表、留言和作者信息。阅读文章、查看主题、认识作者，都从同一个入口进入。
        </p>
        <div class="hero-actions">
          <button class="blog-action" type="button" @click.stop="router.push('/log/article')">
            进入文章档案 <span aria-hidden="true">→</span>
          </button>
          <button class="blog-action secondary" type="button" @click.stop="router.push('/about')">
            关于作者 <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
      <div class="hero-profile">
        <img
          :src="store.$state.config['my-avatar']?.content"
          alt="灯下灯头像"
          v-motion-pop-visible-once
        />
        <div>
          <p class="profile-name">Xaiver / 灯下灯</p>
          <div class="profile-links">
            <button
              class="icon iconfont icon-github"
              @click.stop="goTo('https://github.com/Xaiver03', $event)"
              title="GitHub"
            ></button>
            <button
              class="icon iconfont icon-xiaohongshu"
              @click.stop="
                goTo('https://www.xiaohongshu.com/user/profile/5c5858380000000018037278', $event)
              "
              title="小红书"
            ></button>
            <button
              class="icon iconfont icon-xinlangweibo"
              @click.stop="goTo('https://weibo.com/u/6209660620', $event)"
              title="微博"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Article list</span>
        <h2>文章列表</h2>
      </div>
      <p>按发布时间整理公开文章。完整归档继续保留搜索和分页，方便连续阅读。</p>
    </header>
    <RepeatEmptyPlaceholder
      :dataReady="Boolean(articleData)"
      :dataShow="!utils.isNullOrEmpty(articleData?.leadArticle)"
    >
      <RepeatDataCard
        id="topArticle"
        :data="articleData?.leadArticle"
        :dataOption="{
          mainAttribute: 'topic',
          secondAttribute: 'introduction',
          additional: {
            icon: '发布于',
            attribute: 'createTime',
          },
        }"
        @click="router.push(`/log/article/detail/${articleData?.leadArticle.id}`)"
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
      <div class="blog-grid" id="article-bar">
        <div
          v-for="(item, index) in articleData?.articleList"
          :key="index"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visibleOnce="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 280,
            },
          }"
        >
          <RepeatDataCard
            class="article-item"
            :column="true"
            :data="item"
            @click="router.push(`/log/article/detail/${item.id}`)"
            :dataOption="{
              mainAttribute: 'topic',
              secondAttribute: 'introduction',
              additional: {
                icon: '发布于',
                attribute: 'createTime',
              },
            }"
          />
        </div>
      </div>
      <RepeatMoreButton :clickEvent="() => router.push('/log/article')"></RepeatMoreButton>
    </RepeatEmptyPlaceholder>
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Recent notes</span>
        <h2>最近动态</h2>
      </div>
      <p>留言和短内容保留在同一条公开时间线里，作为文章之外的补充。</p>
    </header>
    <RepeatEmptyPlaceholder
      :dataReady="Boolean(hottestMessageList)"
      :dataShow="hottestMessageList?.length > 0"
    >
      <div class="message-grid">
        <article
          v-for="item in hottestMessageList"
          :key="item.id + 'massage'"
          class="massage-box blog-glass-panel"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visibleOnce="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 280,
            },
          }"
        >
          <a-tooltip :title="utils.formatDate(item.createTime, true)">
            <span class="message-time">{{ utils.formatDateSimple(item.createTime) }}</span>
          </a-tooltip>
          <RepeatMdPreView :mdContent="item.content" class="child-md-view w-full">
          </RepeatMdPreView>
          <div class="message-actions">
            <button class="like-button" type="button" @click="likeMessage(item)">
              <LikeOutlined />
              <span class="ml-4">{{ item.like > 0 ? item.like : '喜欢' }}</span>
            </button>
            <p>{{ item.like }}</p>
          </div>
        </article>
      </div>
      <RepeatMoreButton
        text="查看更多留言"
        :clickEvent="() => router.push('/message')"
      ></RepeatMoreButton>
    </RepeatEmptyPlaceholder>
  </main>
</template>

<style lang="scss" scoped>
#home {
  .archive-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(28rem, 0.75fr);
    align-items: end;
    gap: 4rem;
    min-height: 42rem;
    padding: clamp(3rem, 6vw, 7rem);
    cursor: pointer;
  }

  .hero-copy h1 {
    max-width: 72rem;
    margin: 0;
    font-size: clamp(4rem, 8vw, 8.4rem);
    line-height: 0.98;
    font-weight: 880;
    letter-spacing: 0;
    text-wrap: balance;
  }

  .hero-copy p {
    max-width: 56rem;
    margin: 2rem 0 0;
    color: $secondary-text-color;
    font-size: 1.65rem;
    line-height: 1.8;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 3rem;
  }

  .hero-actions .secondary {
    background: $surface-control;
  }

  .hero-profile {
    display: grid;
    justify-items: end;
    gap: 1.6rem;
  }

  .hero-profile img {
    width: min(22rem, 42vw);
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    background-color: $secondary-car-color;
    box-shadow: 0 22px 70px rgba(23, 32, 29, 0.16);
  }

  .profile-name {
    margin: 0 0 1rem;
    color: $main-text-color;
    font-size: 1.5rem;
    font-weight: 760;
    text-align: right;
  }

  .profile-links {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
  }

  .icon {
    width: 4rem;
    height: 4rem;
    border: 1px solid $surface-border;
    border-radius: $radius-control;
    background: $surface-control;
    color: $main-text-color;
    font-size: 2rem;
    backdrop-filter: blur(16px) saturate(150%);
    transition:
      transform 180ms ease,
      background 180ms ease;

    &:hover {
      transform: translateY(-2px);
      background: $surface-hover;
    }
  }

  #article-bar {
    margin-top: 1.6rem;
  }

  .message-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.6rem;
  }

  .massage-box {
    color: $main-text-color;
    padding: 2rem;
  }

  .message-time {
    color: $secondary-text-color;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .message-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    color: $secondary-text-color;
  }

  .like-button {
    display: inline-flex;
    align-items: center;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .archive-hero,
    .message-grid {
      grid-template-columns: 1fr;
    }

    .hero-profile {
      justify-items: start;
    }

    .profile-name {
      text-align: left;
    }

    .profile-links {
      justify-content: flex-start;
    }
  }
}
</style>
