<script setup>
import { COMPANY_BRAND } from '~/composables/companyBrand';
const router = useRouter();
const store = useNuxtStore();
const profileAvatarSrc = ref('');
const syncProfileAvatar = () => {
  profileAvatarSrc.value = store.$state.config['my-avatar']?.content || '';
};
const handleProfileAvatarError = () => {
  profileAvatarSrc.value = '';
};
watch(() => store.$state.config['my-avatar']?.content, syncProfileAvatar, { immediate: true });

// 从 config 读取社交链接
const safeParse = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val;
};

// 内置 SVG 图标
const getSocialSvg = (name) => {
  const icons = {
    GitHub: '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" fill="currentColor"/>',
    公众号: '<path d="M8.69 3.46C3.88 3.46 0 6.47 0 10.18c0 2.04 1.08 3.87 2.76 5.11l-.55 1.65 1.92-1.05c.88.26 1.81.39 2.75.39.31 0 .62-.02.92-.06-.2-.64-.3-1.3-.3-1.98 0-3.7 3.34-6.72 7.45-6.72.22 0 .43.01.64.03C14.95 5.08 11.97 3.46 8.69 3.46zM5.18 7.3c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.32-.72.72-.72zm4.3 0c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.33-.72.72-.72z" fill="currentColor"/><path d="M16.5 7.3c-3.58 0-6.5 2.6-6.5 5.8 0 3.2 2.92 5.8 6.5 5.8.8 0 1.58-.14 2.3-.38l1.7.93-.5-1.53c1.4-1.1 2.3-2.57 2.3-4.22 0-3.2-2.92-5.8-6.5-5.8h.2c.3 0 0 0 0 0zm-2.5 2.6c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53zm4.5 0c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53z" fill="currentColor"/>',
    微信: '<path d="M8.69 3.46C3.88 3.46 0 6.47 0 10.18c0 2.04 1.08 3.87 2.76 5.11l-.55 1.65 1.92-1.05c.88.26 1.81.39 2.75.39.31 0 .62-.02.92-.06-.2-.64-.3-1.3-.3-1.98 0-3.7 3.34-6.72 7.45-6.72.22 0 .43.01.64.03C14.95 5.08 11.97 3.46 8.69 3.46zM5.18 7.3c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.32-.72.72-.72zm4.3 0c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.33-.72.72-.72z" fill="currentColor"/><path d="M16.5 7.3c-3.58 0-6.5 2.6-6.5 5.8 0 3.2 2.92 5.8 6.5 5.8.8 0 1.58-.14 2.3-.38l1.7.93-.5-1.53c1.4-1.1 2.3-2.57 2.3-4.22 0-3.2-2.92-5.8-6.5-5.8h.2c.3 0 0 0 0 0zm-2.5 2.6c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53zm4.5 0c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53z" fill="currentColor"/>',
  };
  return icons[name] || null;
};

const profileSocialLinks = computed(() => {
  return safeParse(store.$state.config['about-social-links']?.content, []);
});

// 从 config 读取名字和头像
const profileName = computed(() => {
  const info = safeParse(store.$state.config['about-basic-info']?.content, {});
  return info.name || COMPANY_BRAND.name;
});

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
        const rows = Array.isArray(res?.rows) ? [...res.rows] : [];
        for (let row of rows) {
          row.createTime = utils.formatDate(row.createTime);
        }
        const leadArticle = rows.shift() || null;
        const articleList = rows;
        return {
          leadArticle,
          articleList,
        };
      }),
  {
    default: () => ({ leadArticle: null, articleList: [] }),
  },
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
      .then((res) => (Array.isArray(res?.rows) ? res.rows : [])),
  {
    default: () => [],
  },
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
    <section id="team-profile" class="blog-glass-panel archive-hero" @click="router.push('/about')">
      <div class="hero-copy">
        <span class="blog-eyebrow">Public archive</span>
        <h1>{{ COMPANY_BRAND.blogName }}</h1>
        <p>
          记录 AI 产品、工程实践与创意研究。技术是我们解决问题的主体，人文是判断价值与方向的底色。
        </p>
        <div class="hero-actions">
          <button class="blog-action" type="button" @click.stop="router.push('/log/article')">
            进入文章档案 <span aria-hidden="true">→</span>
          </button>
          <button class="blog-action secondary" type="button" @click.stop="router.push('/about')">
            关于团队 <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
      <div class="hero-profile">
        <img
          v-if="profileAvatarSrc"
          :src="profileAvatarSrc"
          @error="handleProfileAvatarError"
          alt="晓黎团队标识"
          v-motion-pop-visible-once
        />
        <div>
          <p class="profile-name">{{ profileName }}</p>
          <div class="profile-links">
            <a
              v-for="link in profileSocialLinks"
              :key="link.name"
              class="icon"
              :href="link.url"
              :title="link.name"
              :target="link.url.startsWith('http') ? '_blank' : undefined"
              @click.stop="link.url.startsWith('http') ? goTo(link.url, $event) : undefined"
            >
              <img
                v-if="link.icon && link.icon.startsWith('http')"
                :src="link.icon"
                :alt="link.name"
                class="social-img"
              />
              <svg
                v-else-if="getSocialSvg(link.iconClass || link.name)"
                class="social-svg"
                viewBox="0 0 24 24"
                v-html="getSocialSvg(link.iconClass || link.name)"
              ></svg>
              <span v-else>{{ link.name }}</span>
            </a>
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 180ms ease,
      background 180ms ease;

    .social-svg {
      width: 2rem;
      height: 2rem;
    }

    .social-img {
      width: 2.4rem;
      height: 2.4rem;
      object-fit: contain;
      border-radius: 4px;
    }

    span {
      font-size: 1.2rem;
      font-weight: 700;
    }

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
