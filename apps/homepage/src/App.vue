<template>
  <a class="skip-link" href="#articles">跳到文章列表</a>

  <div class="site-shell">
    <header
      class="site-header"
      :class="{ 'is-scrolled': isScrolled, 'is-hidden': isHeaderHidden && !menuOpen }"
    >
      <a class="wordmark" href="#top" aria-label="回到站点顶部">
        <span>灯下灯</span>
        <small>XAIVER</small>
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="site-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? '关闭导航' : '打开导航' }}</span>
        <span aria-hidden="true">{{ menuOpen ? '×' : '≡' }}</span>
      </button>

      <nav id="site-navigation" class="site-navigation" :class="{ 'is-open': menuOpen }">
        <a href="#top" @click="menuOpen = false">首页</a>
        <a href="/blog/" @click="menuOpen = false">博客</a>
        <a href="/blog/log/article" @click="menuOpen = false">文章</a>
        <a href="/blog/about" @click="menuOpen = false">关于我</a>
        <a href="/blog/message" @click="menuOpen = false">留言板</a>
      </nav>
    </header>

    <main>
      <section
        id="top"
        class="hero"
        aria-labelledby="hero-title"
        :style="{ '--parallax-y': `${heroParallax}px` }"
      >
        <Background class="hero-bg" />
        <div class="hero-shade"></div>

        <div class="hero-content">
          <div class="profile-card">
            <img
              v-if="profileAvatar"
              class="profile-avatar hero-animate"
              :src="profileAvatar"
              alt="头像"
              style="--delay: 0ms"
            />
            <div class="profile-identity">
              <p class="eyebrow hero-animate" style="--delay: 100ms">{{ homeText.helloText }}</p>
              <h1 id="hero-title" class="hero-animate" style="--delay: 200ms">
                {{ profileName || '灯下灯' }}
              </h1>
              <p v-if="profileTagline" class="profile-tagline hero-animate" style="--delay: 300ms">
                {{ profileProfession
                }}<span v-if="profilePersonality"> · {{ profilePersonality }}</span>
              </p>
              <p v-if="profileIntro" class="profile-intro hero-animate" style="--delay: 400ms">
                {{ profileIntro }}
              </p>

              <div
                v-if="socialLinks.length"
                class="profile-links hero-animate"
                style="--delay: 500ms"
              >
                <a
                  v-for="link in socialLinks"
                  :key="link.name"
                  class="social-link"
                  :href="link.url"
                  :title="link.name"
                  :target="link.url.startsWith('http') ? '_blank' : undefined"
                  :rel="link.url.startsWith('http') ? 'noreferrer' : undefined"
                  @pointermove="handleMagneticMove"
                  @pointerleave="resetInteractiveEffect"
                >
                  <img
                    v-if="link.icon && link.icon.startsWith('http')"
                    class="social-img"
                    :src="link.icon"
                    :alt="link.name"
                  />
                  <svg
                    v-else-if="getSocialIcon(link.iconClass || link.name)"
                    class="social-svg"
                    viewBox="0 0 24 24"
                    v-html="getSocialIcon(link.iconClass || link.name)"
                  />
                  <span v-else>{{ link.name }}</span>
                </a>
              </div>

              <div class="hero-actions hero-animate" style="--delay: 600ms">
                <a
                  class="primary-action legacy-glass-action"
                  href="#articles"
                  @pointermove="handleMagneticMove"
                  @pointerleave="resetInteractiveEffect"
                  >阅读文章列表 <span aria-hidden="true">↓</span></a
                >
                <a
                  class="secondary-action legacy-glass-action"
                  href="/blog/about"
                  @pointermove="handleMagneticMove"
                  @pointerleave="resetInteractiveEffect"
                  >认识作者 <span aria-hidden="true">→</span></a
                >
              </div>
            </div>
          </div>
        </div>

        <aside class="hero-status hero-animate" aria-label="站点状态" style="--delay: 800ms">
          <span>BLOG ARCHIVE</span>
          <strong>{{ articleCountLabel }}</strong>
          <p>
            {{
              latestArticle
                ? `最近更新：${formatArticleDate(latestArticle.updatedTime)}`
                : '正在读取文章列表'
            }}
          </p>
        </aside>
      </section>

      <section id="routes" class="routes-section" aria-labelledby="routes-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">START HERE</p>
            <h2 id="routes-title">从这里进入</h2>
          </div>
          <p class="routes-copy">外部站点与社交媒体入口，从这里探索更多内容。</p>
        </div>

        <div class="route-list">
          <a
            v-for="(link, index) in siteLinks"
            :key="`${link.name}-${link.href}`"
            class="route-link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noreferrer' : undefined"
            @click="handleRouteClick(link, $event)"
            @pointermove="handleTiltMove"
            @pointerleave="resetInteractiveEffect"
          >
            <span class="route-visual" :class="{ 'has-logo': link.logo }" aria-hidden="true">
              <img
                v-if="link.logo"
                :src="link.logo"
                :alt="`${link.name} logo`"
                @error="$event.target.style.display = 'none'"
              />
              <svg
                v-if="getRouteSvg(link.name) && !link.logo"
                class="route-svg"
                viewBox="0 0 24 24"
                v-html="getRouteSvg(link.name)"
              />
              <span v-if="!getRouteSvg(link.name) && !link.logo">{{ getSiteIcon(link.icon) }}</span>
            </span>
            <span class="route-copy">
              <span class="route-index">0{{ index + 1 }}</span>
              <strong>{{ link.name }}</strong>
              <small>{{ getRouteHint(link) }}</small>
            </span>
            <span class="route-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section id="articles" class="writing-section" aria-labelledby="articles-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">BLOG</p>
            <h2 id="articles-title">文章列表</h2>
          </div>
          <a class="archive-link" href="/blog/log/article"
            >浏览全部文章 <span aria-hidden="true">→</span></a
          >
        </div>

        <div id="categories" class="category-filter" aria-label="按分类筛选文章">
          <button
            class="category-chip"
            :class="{ active: selectedCategoryId === 'all' }"
            type="button"
            @click="selectCategory('all')"
          >
            全部
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-chip"
            :class="{ active: selectedCategoryId === category.id }"
            type="button"
            @click="selectCategory(category.id)"
          >
            {{ category.theme }}
          </button>
        </div>

        <div v-if="articleListLoading" class="article-grid" aria-label="文章加载中">
          <div v-for="index in 3" :key="index" class="article-skeleton"></div>
        </div>

        <div v-else-if="visibleArticles.length" class="article-grid">
          <a
            v-for="(article, index) in visibleArticles"
            :key="article.id"
            class="article-entry"
            :class="{ featured: index === 0 }"
            :href="article.url"
          >
            <div class="article-meta">
              <span>{{ selectedCategoryName }}</span>
              <time :datetime="article.updatedTime || undefined">{{
                formatArticleDate(article.updatedTime)
              }}</time>
            </div>
            <h3>{{ article.topic }}</h3>
            <p>{{ article.introduction }}</p>
            <span class="article-read">阅读全文 <span aria-hidden="true">→</span></span>
          </a>
        </div>

        <div v-else class="article-empty">
          <p>
            {{
              selectedCategoryId === 'all' ? '文章列表正在同步。' : '这个分类下暂时没有公开文章。'
            }}
          </p>
          <a href="/blog/log/article">进入文章档案 <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>

    <div v-if="qrDialogOpen" class="qr-dialog-backdrop" @click.self="qrDialogOpen = false">
      <section class="qr-dialog" role="dialog" aria-modal="true" aria-label="公众号二维码">
        <button
          class="qr-close"
          type="button"
          aria-label="关闭二维码"
          @click="qrDialogOpen = false"
        >
          ×
        </button>
        <img :src="qrImage" alt="公众号二维码" />
        <p>扫码查看公众号</p>
      </section>
    </div>

    <footer class="site-footer">
      <span>{{ homeText.siteAuthor }}</span>
      <span>{{ homeText.siteUrl }}</span>
      <a href="https://beian.miit.gov.cn" target="_blank" rel="noreferrer">湘ICP备2026026942号-1</a>
      <a href="#top">回到顶部 ↑</a>
    </footer>
  </div>
</template>

<script setup>
import {
  getArticleCategories,
  getArticlesByCategory,
  getGlobalConfig,
  getLatestArticles,
} from '@/api';
import {
  formatArticleDate,
  getHomeText,
  normalizeArticles,
  normalizeSiteLink,
} from '@/lib/homeContent';
import { getHeaderScrollState, getMagneticOffset, getPointerEffect } from '@/lib/interaction';
import defaultSiteLinks from '@/assets/siteLinks.json';
import Background from '@/components/Background.vue';

const homeText = ref(getHomeText());
const articles = ref([]);
const filteredArticles = ref([]);
const categories = ref([]);
const selectedCategoryId = ref('all');
const totalArticleCount = ref(0);
const isLoading = ref(true);
const isFilterLoading = ref(false);
const isScrolled = ref(false);
const isHeaderHidden = ref(false);
const heroParallax = ref(0);
const menuOpen = ref(false);
const siteLinks = ref(defaultSiteLinks.map(normalizeSiteLink));
const qrDialogOpen = ref(false);
const qrImage = ref('/uploads/wechat-qr.jpg');

// Profile 数据
const profileName = ref('');
const profileTagline = ref('');
const profileProfession = ref('');
const profilePersonality = ref('');
const profileIntro = ref('');
const profileAvatar = ref('');
const socialLinks = ref([]);

const visibleArticles = computed(() =>
  selectedCategoryId.value === 'all' ? articles.value : filteredArticles.value,
);
const latestArticle = computed(() => visibleArticles.value[0] || articles.value[0] || null);
const articleListLoading = computed(() => isLoading.value || isFilterLoading.value);
const articleCountLabel = computed(() => {
  if (articleListLoading.value) return '文章加载中';
  if (!totalArticleCount.value) return '文章列表';
  return `全部文章 ${totalArticleCount.value} 篇`;
});
const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 'all') return '全部文章';
  return categories.value.find((item) => item.id === selectedCategoryId.value)?.theme || '分类文章';
});

let lastScrollY = 0;

const updateScrollState = () => {
  const scrollState = getHeaderScrollState(window.scrollY, lastScrollY, 120, menuOpen.value);
  isScrolled.value = scrollState.scrolled;
  isHeaderHidden.value = scrollState.hidden;
  heroParallax.value = Math.max(-56, Math.min(0, -window.scrollY * 0.08));
  lastScrollY = window.scrollY;
};

const handleMagneticMove = (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return;

  const element = event.currentTarget;
  const offset = getMagneticOffset(event, element.getBoundingClientRect());
  element.style.setProperty('--magnetic-x', `${offset.x.toFixed(2)}px`);
  element.style.setProperty('--magnetic-y', `${offset.y.toFixed(2)}px`);
};

const handleTiltMove = (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return;

  const element = event.currentTarget;
  const effect = getPointerEffect(event, element.getBoundingClientRect());
  element.style.setProperty('--spotlight-x', `${effect.x.toFixed(2)}%`);
  element.style.setProperty('--spotlight-y', `${effect.y.toFixed(2)}%`);
  element.style.setProperty('--tilt-x', `${effect.tiltX.toFixed(2)}deg`);
  element.style.setProperty('--tilt-y', `${effect.tiltY.toFixed(2)}deg`);
};

const resetInteractiveEffect = (event) => {
  const element = event.currentTarget;
  element.style.setProperty('--magnetic-x', '0px');
  element.style.setProperty('--magnetic-y', '0px');
  element.style.setProperty('--spotlight-x', '50%');
  element.style.setProperty('--spotlight-y', '50%');
  element.style.setProperty('--tilt-x', '0deg');
  element.style.setProperty('--tilt-y', '0deg');
};

const parseProfileData = (config) => {
  if (!config || typeof config !== 'object') return;

  // 头像
  if (config['my-avatar']?.content) {
    profileAvatar.value = config['my-avatar'].content;
    updateFavicon(config['my-avatar'].content);
  }

  // 基本信息
  try {
    const basicInfo = config['about-basic-info']?.content;
    if (basicInfo) {
      const info = typeof basicInfo === 'string' ? JSON.parse(basicInfo) : basicInfo;
      profileName.value = info.name || '';
      profileTagline.value = info.tagline || '';
      profileProfession.value = info.profession || '';
      profilePersonality.value = info.personality || '';
      profileIntro.value = info.introduction || '';
    }
  } catch (e) {
    console.warn('解析 about-basic-info 失败:', e);
  }

  // 社交链接
  try {
    const links = config['about-social-links']?.content;
    if (links) {
      socialLinks.value = typeof links === 'string' ? JSON.parse(links) : links;
    }
  } catch (e) {
    console.warn('解析 about-social-links 失败:', e);
  }
};

const loadHome = async () => {
  const [config, latest, categoryList] = await Promise.all([
    getGlobalConfig(),
    getLatestArticles(),
    getArticleCategories(),
  ]);
  homeText.value = getHomeText(config);
  parseProfileData(config);
  totalArticleCount.value = latest?.count || latest?.rows?.length || 0;
  articles.value = normalizeArticles(latest);
  categories.value = Array.isArray(categoryList)
    ? categoryList
      .filter((item) => Number.isInteger(Number(item?.id)) && item?.theme && item.theme !== '全部文章')
      .map((item) => ({
        id: String(item.id),
        theme: String(item.theme).trim(),
      }))
    : [];

  isLoading.value = false;
};

const selectCategory = async (categoryId) => {
  const normalizedId = String(categoryId);
  if (selectedCategoryId.value === normalizedId && normalizedId !== 'all') return;

  selectedCategoryId.value = normalizedId;
  if (normalizedId === 'all') {
    filteredArticles.value = [];
    return;
  }

  isFilterLoading.value = true;
  filteredArticles.value = normalizeArticles(await getArticlesByCategory(normalizedId));
  isFilterLoading.value = false;
};

const handleRouteClick = (link, event) => {
  if (!link.qr) return;
  event.preventDefault();
  qrImage.value = link.qrImage;
  qrDialogOpen.value = true;
};

const updateFavicon = (url) => {
  if (!url || typeof document === 'undefined') return;
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
};

const getSocialIcon = (name) => {
  const icons = {
    GitHub:
      '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" fill="currentColor"/>',
    微信: '<path d="M8.69 3.46C3.88 3.46 0 6.47 0 10.18c0 2.04 1.08 3.87 2.76 5.11l-.55 1.65 1.92-1.05c.88.26 1.81.39 2.75.39.31 0 .62-.02.92-.06-.2-.64-.3-1.3-.3-1.98 0-3.7 3.34-6.72 7.45-6.72.22 0 .43.01.64.03C14.95 5.08 11.97 3.46 8.69 3.46zM5.18 7.3c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.32-.72.72-.72zm4.3 0c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.33-.72.72-.72z" fill="currentColor"/><path d="M16.5 7.3c-3.58 0-6.5 2.6-6.5 5.8 0 3.2 2.92 5.8 6.5 5.8.8 0 1.58-.14 2.3-.38l1.7.93-.5-1.53c1.4-1.1 2.3-2.57 2.3-4.22 0-3.2-2.92-5.8-6.5-5.8h.2c.3 0 0 0 0 0zm-2.5 2.6c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53zm4.5 0c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53z" fill="currentColor"/>',
    公众号:
      '<path d="M8.69 3.46C3.88 3.46 0 6.47 0 10.18c0 2.04 1.08 3.87 2.76 5.11l-.55 1.65 1.92-1.05c.88.26 1.81.39 2.75.39.31 0 .62-.02.92-.06-.2-.64-.3-1.3-.3-1.98 0-3.7 3.34-6.72 7.45-6.72.22 0 .43.01.64.03C14.95 5.08 11.97 3.46 8.69 3.46zM5.18 7.3c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.32-.72.72-.72zm4.3 0c.4 0 .72.32.72.72s-.32.72-.72.72a.72.72 0 01-.72-.72c0-.4.33-.72.72-.72z" fill="currentColor"/><path d="M16.5 7.3c-3.58 0-6.5 2.6-6.5 5.8 0 3.2 2.92 5.8 6.5 5.8.8 0 1.58-.14 2.3-.38l1.7.93-.5-1.53c1.4-1.1 2.3-2.57 2.3-4.22 0-3.2-2.92-5.8-6.5-5.8h.2c.3 0 0 0 0 0zm-2.5 2.6c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53zm4.5 0c.3 0 .55.24.55.53 0 .29-.25.53-.55.53-.3 0-.55-.24-.55-.53 0-.29.25-.53.55-.53z" fill="currentColor"/>',
  };
  return icons[name] || null;
};

const getRouteSvg = (name) => {
  return getSocialIcon(name);
};

const getSiteIcon = (icon) => {
  const icons = {
    Blog: '文',
    Cloud: '云',
    Fire: '创',
    CompactDisc: '乐',
    Compass: '↗',
    Book: '书',
    LaptopCode: '微',
  };
  return icons[icon] || '站';
};

const getRouteHint = (link) => {
  if (link.qr) return '扫码打开';
  if (link.external) return '外部站点';
  if (link.href.startsWith('/blog')) return '博客内容';
  return '站内页面';
};

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  loadHome();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState);
});
</script>

<style lang="scss" scoped>
.site-shell {
  --ink: #171b1a;
  --muted: #65706a;
  --paper: #ebece5;
  --forest: #1d4d40;
  --forest-deep: #102c27;
  --line: rgb(23 27 26 / 14%);
  min-height: 100vh;
  color: var(--ink);
  background: var(--paper);
}

.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 20;
  padding: 0.7rem 0.9rem;
  color: #fff;
  background: var(--forest-deep);
  transform: translateY(-160%);
  transition: transform 180ms ease;

  &:focus {
    transform: translateY(0);
  }
}

.site-header {
  position: fixed;
  top: 1.1rem;
  left: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(92%, 78rem);
  min-height: 3.75rem;
  padding: 0.6rem 0.75rem 0.6rem 1rem;
  color: #f5f7ef;
  background: rgb(18 38 33 / 48%);
  border: 1px solid rgb(255 255 255 / 20%);
  box-shadow: 0 0.75rem 2rem rgb(4 17 13 / 18%);
  backdrop-filter: blur(1.15rem) saturate(125%);
  transform: translateX(-50%);
  transition:
    background 240ms ease,
    box-shadow 240ms ease,
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);

  &.is-hidden {
    transform: translate(-50%, calc(-100% - 1.5rem));
  }

  &.is-scrolled {
    color: var(--ink);
    background: rgb(235 236 229 / 86%);
    box-shadow: 0 0.75rem 1.5rem rgb(23 27 26 / 10%);
  }
}

.wordmark {
  display: grid;
  gap: 0.05rem;
  color: inherit;
  font-weight: 700;
  line-height: 1;

  span {
    font-size: 1.1rem;
  }

  small {
    font-size: 0.57rem;
    font-weight: 600;
  }
}

.site-navigation {
  display: flex;
  align-items: center;
  gap: 1.4rem;

  a {
    color: inherit;
    font-size: 0.9rem;
    font-weight: 600;

    &:hover {
      opacity: 0.64;
    }
  }
}

.menu-toggle {
  display: none;
  width: 2.65rem;
  height: 2.45rem;
  color: inherit;
  font-size: 1.6rem;
  line-height: 1;
  background: transparent;
  border: 0;
  cursor: pointer;

  &:active {
    transform: scale(0.96);
  }
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  color: #f7f9f0;
  isolation: isolate;

  &::before {
    position: absolute;
    inset: -24%;
    z-index: -1;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(circle at 76% 18%, rgb(111 208 173 / 30%), transparent 28%),
      radial-gradient(circle at 18% 78%, rgb(38 108 87 / 30%), transparent 34%);
    filter: blur(1.5rem);
    opacity: 0.82;
    animation: aurora-drift 16s ease-in-out infinite alternate;
  }
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  transform: translate3d(0, var(--parallax-y, 0px), 0) scale(1.06);
  transition: transform 100ms linear;
  will-change: transform;
}

.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: rgb(9 24 20 / 48%);
}

.hero-content {
  width: min(92%, 78rem);
  padding: 7rem 0 5rem;
  animation: reveal 650ms ease both;
}

.profile-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  justify-items: start;
}

.profile-avatar {
  width: clamp(10rem, 16vw, 16rem);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid rgb(255 255 255 / 30%);
  box-shadow: 0 1.4rem 4rem rgb(4 17 13 / 28%);
}

.hero-animate {
  opacity: 0;
  transform: translate3d(0, 1.15rem, 0) scale(0.98);
  animation: hero-item-in 760ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
  will-change: opacity, transform;
}

.profile-identity {
  display: grid;
  gap: 0.6rem;
}

.eyebrow {
  margin: 0;
  color: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.84;
}

.profile-identity h1 {
  margin: 0;
  font-size: clamp(2.8rem, 6vw, 5.6rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
}

.profile-tagline {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.8;
}

.profile-intro {
  max-width: 42rem;
  margin: 0.5rem 0 0;
  font-size: 1.06rem;
  line-height: 1.75;
  opacity: 0.82;
  text-wrap: pretty;
}

.profile-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.5rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  min-height: 3rem;
  padding: 0 1.1rem;
  color: inherit;
  font-size: 1.5rem;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  backdrop-filter: blur(0.5rem);
  transform: translate3d(var(--magnetic-x, 0px), var(--magnetic-y, 0px), 0);
  transition:
    background 180ms ease,
    box-shadow 180ms ease,
    transform 160ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    background: rgb(255 255 255 / 24%);
    box-shadow: 0 0.75rem 1.5rem rgb(4 17 13 / 18%);
  }

  span {
    font-size: 0.88rem;
    font-weight: 700;
  }
}

.social-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.social-img {
  width: 1.8rem;
  height: 1.8rem;
  object-fit: contain;
  border-radius: 4px;
}

.route-svg {
  width: 1.8rem;
  height: 1.8rem;
  color: inherit;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
  margin-top: 1.6rem;
}

.primary-action,
.secondary-action,
.archive-link,
.article-read,
.article-empty a {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  color: inherit;
  font-weight: 700;
}

.legacy-glass-action {
  border: 1px solid rgb(255 255 255 / 28%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 45%),
    0 0.7rem 1.5rem rgb(4 17 13 / 14%);
  backdrop-filter: blur(0.7rem) saturate(120%);
  transform: translate3d(var(--magnetic-x, 0px), var(--magnetic-y, 0px), 0);
  transition:
    background 180ms ease,
    box-shadow 180ms ease,
    transform 160ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 56%),
      0 1rem 2rem rgb(4 17 13 / 20%);
  }

  &:active {
    transform: translate3d(var(--magnetic-x, 0px), var(--magnetic-y, 0px), 0) scale(0.98);
  }
}

.primary-action {
  padding: 0.9rem 1.1rem;
  color: var(--forest-deep);
  background: rgb(237 240 231 / 84%);

  &:hover {
    background: #fff;
  }
}

.secondary-action {
  padding: 0.9rem 1.1rem;
  color: #f7f9f0;
  background: rgb(12 40 33 / 48%);

  &:hover,
  &:focus-visible {
    background: rgb(12 40 33 / 68%);
  }
}

.hero-status {
  position: absolute;
  right: max(4%, calc((100% - 78rem) / 2));
  bottom: 2.2rem;
  display: grid;
  gap: 0.35rem;
  min-width: 13.5rem;
  padding: 1rem;
  color: #f7f9f0;
  background: rgb(11 36 30 / 50%);
  border: 1px solid rgb(255 255 255 / 20%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 14%);
  backdrop-filter: blur(1rem) saturate(120%);

  span {
    font-size: 0.62rem;
    font-weight: 700;
  }

  strong {
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.74rem;
    opacity: 0.78;
  }
}

.writing-section,
.routes-section {
  width: min(92%, 78rem);
  margin: 0 auto;
  padding: 7.5rem 0;
}

.routes-section {
  padding-top: 7.5rem;
  padding-bottom: 7rem;
}

.section-heading {
  display: flex;
  gap: 2rem;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 2.4rem;

  h2 {
    margin: 0.45rem 0 0;
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: 0;
  }

  .eyebrow {
    color: var(--forest);
  }
}

.archive-link {
  color: var(--forest);

  &:hover,
  &:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.3rem;
  }
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  margin: -0.7rem 0 1.6rem;
  padding: 0.55rem;
  background: rgb(246 247 241 / 72%);
  border: 1px solid rgb(255 255 255 / 70%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 84%),
    0 1rem 2.4rem rgb(23 32 29 / 8%);
  backdrop-filter: blur(1rem) saturate(145%);
}

.category-chip {
  min-height: 2.6rem;
  padding: 0 1rem;
  color: var(--muted);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition:
    color 180ms ease,
    background 180ms ease,
    transform 180ms ease;

  &:hover,
  &:focus-visible {
    color: var(--ink);
    background: rgb(255 255 255 / 70%);
    outline: none;
  }

  &:active {
    transform: scale(0.98);
  }

  &.active {
    color: #f6f9ed;
    background: var(--forest);
  }
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  background: var(--line);
  border: 1px solid var(--line);
}

.article-entry,
.article-skeleton {
  min-height: 19rem;
  padding: 1.5rem;
  background: var(--paper);
}

.article-entry {
  display: flex;
  flex-direction: column;
  color: var(--ink);
  transition:
    background 200ms ease,
    color 200ms ease;

  &:hover,
  &:focus-visible {
    color: #f6f9ed;
    background: var(--forest);
    outline: none;
  }

  &.featured {
    grid-row: span 2;
    min-height: 100%;
    color: #f6f9ed;
    background: var(--forest);

    h3 {
      font-size: clamp(2rem, 3vw, 3.5rem);
    }
  }
}

.article-meta {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  color: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  opacity: 0.7;
}

.article-entry h3 {
  margin: auto 0 1rem;
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0;
  text-wrap: balance;
}

.article-entry p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: inherit;
  font-size: 0.95rem;
  line-height: 1.7;
  opacity: 0.78;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.article-read {
  margin-top: 1.75rem;
  font-size: 0.85rem;
}

.article-skeleton {
  background: linear-gradient(
    90deg,
    rgb(217 221 211 / 70%),
    rgb(235 236 229),
    rgb(217 221 211 / 70%)
  );
  background-size: 220% 100%;
  animation: shimmer 1.4s ease infinite;
}

.article-empty {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  p {
    margin: 0;
  }

  a {
    color: var(--forest);
  }
}

.routes-copy {
  max-width: 25rem;
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.route-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.route-link {
  position: relative;
  display: grid;
  grid-template-columns: 3.8rem minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  min-height: 8.8rem;
  padding: 1.1rem;
  overflow: hidden;
  color: var(--ink);
  background: rgb(246 247 241 / 72%);
  border: 1px solid rgb(255 255 255 / 72%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 86%),
    0 1.2rem 3rem rgb(23 32 29 / 8%);
  backdrop-filter: blur(1rem) saturate(145%);
  transform: perspective(900px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
  transform-style: preserve-3d;
  transition:
    color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    border: 1px solid rgb(90 187 153 / 72%);
    border-radius: inherit;
    background: radial-gradient(
      circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
      rgb(103 209 168 / 24%),
      transparent 34%
    );
    opacity: 0;
    transition: opacity 180ms ease;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover,
  &:focus-visible {
    transform: perspective(900px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg))
      translate3d(0, -0.12rem, 0);
    color: var(--forest);
    background: rgb(255 255 255 / 86%);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 92%),
      0 1.6rem 3.6rem rgb(23 32 29 / 12%);
    outline: none;

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: perspective(900px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg))
      translate3d(0, 0, 0) scale(0.99);
  }
}

.route-visual {
  display: grid;
  width: 3.8rem;
  height: 3.8rem;
  place-items: center;
  color: #f6f9ed;
  background: var(--forest);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 18%);
  font-size: 1rem;
  font-weight: 800;

  &.has-logo {
    background: rgb(255 255 255 / 74%);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 88%),
      0 0.7rem 1.6rem rgb(23 32 29 / 10%);
  }

  img {
    width: 72%;
    height: 72%;
    object-fit: contain;
  }
}

.route-copy {
  display: grid;
  min-width: 0;
  gap: 0.24rem;

  strong {
    overflow: hidden;
    color: inherit;
    font-size: clamp(1.08rem, 1.6vw, 1.42rem);
    font-weight: 800;
    line-height: 1.15;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 700;
  }
}

.route-index {
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 700;
}

.route-arrow {
  align-self: start;
  color: var(--muted);
  font-weight: 800;
}

.site-footer {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  width: min(92%, 78rem);
  margin: 0 auto;
  padding: 1.5rem 0 2.2rem;
  color: var(--muted);
  font-size: 0.76rem;
  border-top: 1px solid var(--line);

  a {
    color: inherit;

    &:hover,
    &:focus-visible {
      color: var(--forest);
    }
  }
}

.qr-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgb(7 20 16 / 54%);
  backdrop-filter: blur(0.8rem);
}

.qr-dialog {
  position: relative;
  display: grid;
  gap: 0.9rem;
  width: min(21rem, 100%);
  padding: 1.2rem;
  text-align: center;
  background: rgb(246 247 241 / 94%);
  border: 1px solid rgb(255 255 255 / 78%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 86%),
    0 2rem 5rem rgb(7 20 16 / 24%);

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    background: #fff;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 0.88rem;
    font-weight: 700;
  }
}

.qr-close {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  width: 2rem;
  height: 2rem;
  color: var(--ink);
  font: inherit;
  font-size: 1.3rem;
  line-height: 1;
  background: rgb(255 255 255 / 74%);
  border: 0;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(1.4rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-item-in {
  0% {
    opacity: 0;
    transform: translate3d(0, 1.15rem, 0) scale(0.98);
    filter: blur(0.35rem);
  }
  70% {
    opacity: 1;
    transform: translate3d(0, -0.18rem, 0) scale(1.005);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
}

@keyframes aurora-drift {
  from {
    transform: translate3d(-2%, 1%, 0) rotate(-2deg) scale(1);
  }
  to {
    transform: translate3d(2%, -2%, 0) rotate(2deg) scale(1.08);
  }
}

@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -120% 0;
  }
}

@media (max-width: 760px) {
  .site-header {
    top: 0.6rem;
    width: calc(100% - 1.2rem);
  }

  .menu-toggle {
    display: block;
  }

  .site-navigation {
    position: absolute;
    top: calc(100% + 0.45rem);
    right: 0;
    display: none;
    width: min(17rem, 100%);
    padding: 0.55rem;
    background: rgb(235 236 229 / 94%);
    border: 1px solid var(--line);
    box-shadow: 0 1rem 2rem rgb(23 27 26 / 14%);
    backdrop-filter: blur(1rem);

    &.is-open {
      display: grid;
    }

    a {
      padding: 0.9rem;
      color: var(--ink);
    }
  }

  .hero {
    min-height: 100vh;
  }

  .hero-content {
    padding-top: 7.8rem;
    padding-bottom: 7.4rem;
  }

  .profile-card {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .profile-intro {
    text-align: center;
  }

  .profile-links,
  .hero-actions {
    justify-content: center;
  }

  .hero-status {
    right: 4%;
    bottom: 1.3rem;
    left: 4%;
  }

  .writing-section,
  .routes-section {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }

  .section-heading,
  .article-empty,
  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }

  .article-entry.featured {
    grid-row: auto;
  }

  .article-entry,
  .article-skeleton {
    min-height: 15rem;
  }

  .route-list {
    grid-template-columns: 1fr;
  }

  .route-link {
    grid-template-columns: 2.8rem 1fr auto;
    min-height: 7.2rem;
  }

  .route-visual {
    width: 2.8rem;
    height: 2.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }

  .site-header.is-hidden {
    transform: translateX(-50%);
  }

  .hero::before {
    animation: none;
  }

  .hero-bg,
  .hero-animate,
  .social-link,
  .legacy-glass-action,
  .route-link {
    transform: none !important;
    animation: none !important;
  }

  .hero-animate {
    opacity: 1;
  }
}
</style>
