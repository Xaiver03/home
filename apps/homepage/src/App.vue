<template>
  <a class="skip-link" href="#writing">跳到最近写作</a>

  <div class="site-shell">
    <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
      <a class="wordmark" href="#top" aria-label="回到首页">
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
        <a href="#writing" @click="menuOpen = false">写作</a>
        <a href="#routes" @click="menuOpen = false">入口</a>
        <a href="/blog/about">关于</a>
        <a href="https://github.com/Xaiver03" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>

    <main>
      <section id="top" class="hero" aria-labelledby="hero-title">
        <img class="hero-image" src="/images/background10.jpg" alt="远山与森林的插画风景" />
        <div class="hero-shade"></div>

        <div class="hero-content">
          <p class="eyebrow">{{ homeText.helloText }}</p>
          <h1 id="hero-title">把生活和思考，<br />留在能慢慢阅读的地方。</h1>
          <p class="hero-description">{{ homeText.descText }}</p>
          <div class="hero-actions">
            <a class="primary-action legacy-glass-action" href="#writing"
              >阅读最新写作 <span aria-hidden="true">↓</span></a
            >
            <a class="secondary-action legacy-glass-action" href="/blog/about"
              >认识作者 <span aria-hidden="true">→</span></a
            >
          </div>
        </div>

        <aside class="hero-status" aria-label="站点状态">
          <span>PUBLIC ARCHIVE</span>
          <strong>{{ articleCountLabel }}</strong>
          <p>
            {{
              latestArticle
                ? `最近更新：${formatArticleDate(latestArticle.updatedTime)}`
                : '正在读取公开文章'
            }}
          </p>
        </aside>
      </section>

      <section id="writing" class="writing-section" aria-labelledby="writing-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">LATEST WRITING</p>
            <h2 id="writing-title">最近写作</h2>
          </div>
          <a class="archive-link" href="/blog/log/article"
            >浏览全部文章 <span aria-hidden="true">→</span></a
          >
        </div>

        <div v-if="isLoading" class="article-grid" aria-label="文章加载中">
          <div v-for="index in 3" :key="index" class="article-skeleton"></div>
        </div>

        <div v-else-if="articles.length" class="article-grid">
          <a
            v-for="(article, index) in articles"
            :key="article.id"
            class="article-entry"
            :class="{ featured: index === 0 }"
            :href="article.url"
          >
            <div class="article-meta">
              <span>{{ index === 0 ? '置顶阅读' : '文章' }}</span>
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
          <p>公开文章正在同步。</p>
          <a href="/blog/log/article">进入文章档案 <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section class="quote-section" aria-label="格言">
        <div class="quote-panel">
          <span class="quote-label">A MOMENT TO PAUSE</span>
          <blockquote>{{ quote.text }}</blockquote>
          <footer>「{{ quote.from }}」</footer>
          <button class="quote-refresh legacy-glass-action" type="button" @click="loadQuote">
            <span class="sr-only">换一句格言</span>
            <span aria-hidden="true">↻</span>
          </button>
        </div>
      </section>

      <section id="routes" class="routes-section" aria-labelledby="routes-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">START HERE</p>
            <h2 id="routes-title">从这里进入</h2>
          </div>
          <p class="routes-copy">首页保留近期内容，完整归档、留言和个人信息在这里继续展开。</p>
        </div>

        <div class="route-list">
          <a
            v-for="(link, index) in siteLinks"
            :key="`${link.name}-${link.href}`"
            class="route-link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noreferrer' : undefined"
          >
            <span class="route-index">0{{ index + 1 }}</span>
            <span>{{ link.name }}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>{{ homeText.siteAuthor }}</span>
      <span>{{ homeText.siteUrl }}</span>
      <a href="#top">回到顶部 ↑</a>
    </footer>
  </div>
</template>

<script setup>
import { getGlobalConfig, getHitokoto, getLatestArticles } from '@/api';
import {
  formatArticleDate,
  getHomeText,
  normalizeArticles,
  normalizeQuote,
  normalizeSiteLink,
} from '@/lib/homeContent';

const fallbackLinks = [
  { name: '文章档案', link: '/log/article' },
  { name: '关于作者', link: '/about' },
  { name: '朋友们', link: '/link' },
  { name: '留言', link: '/message' },
];

const homeText = ref(getHomeText());
const articles = ref([]);
const isLoading = ref(true);
const isScrolled = ref(false);
const menuOpen = ref(false);
const siteLinks = ref(fallbackLinks.map(normalizeSiteLink));
const quote = ref(normalizeQuote());

const latestArticle = computed(() => articles.value[0] || null);
const articleCountLabel = computed(() => {
  if (isLoading.value) return '文章加载中';
  if (!articles.value.length) return '公开档案';
  return `近期 ${articles.value.length} 篇`;
});

const updateScrollState = () => {
  isScrolled.value = window.scrollY > 24;
};

const loadHome = async () => {
  const [config, latest] = await Promise.all([getGlobalConfig(), getLatestArticles()]);
  homeText.value = getHomeText(config);
  articles.value = normalizeArticles(latest);

  const configuredLinks = config?.['site-links']?.content;
  if (Array.isArray(configuredLinks) && configuredLinks.length) {
    siteLinks.value = configuredLinks
      .filter((item) => item?.type !== 'qr')
      .map(normalizeSiteLink)
      .slice(0, 5);
  }

  isLoading.value = false;
};

const loadQuote = async () => {
  try {
    quote.value = normalizeQuote(await getHitokoto());
  } catch {
    quote.value = normalizeQuote();
  }
};

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  loadHome();
  loadQuote();
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
    box-shadow 240ms ease;

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
  display: grid;
  align-items: end;
  min-height: 48rem;
  overflow: hidden;
  color: #f7f9f0;
  isolation: isolate;
}

.hero-image,
.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
}

.hero-image {
  object-fit: cover;
  object-position: center;
}

.hero-shade {
  z-index: -1;
  background: rgb(9 24 20 / 48%);
}

.hero-content {
  width: min(92%, 78rem);
  margin: 0 auto;
  padding: 9rem 0 8.5rem;
  animation: reveal 650ms ease both;

  h1 {
    max-width: 15ch;
    margin: 0.7rem 0 1.3rem;
    font-size: clamp(3.15rem, 7vw, 6.9rem);
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: 0;
    text-wrap: balance;
  }
}

.eyebrow {
  margin: 0;
  color: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  opacity: 0.84;
}

.hero-description {
  max-width: 34rem;
  margin: 0;
  font-size: 1.06rem;
  line-height: 1.75;
  text-wrap: pretty;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
  margin-top: 2.2rem;
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
  transition:
    background 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;

  &:hover {
    transform: translateY(-0.12rem);
  }

  &:active {
    transform: scale(0.98);
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
  padding-top: 1rem;
  padding-bottom: 7rem;
}

.quote-section {
  width: min(92%, 78rem);
  margin: 0 auto;
  padding: 0 0 7.5rem;
}

.quote-panel {
  position: relative;
  min-height: 12rem;
  padding: 1.5rem 4.5rem 1.5rem 1.5rem;
  color: #f4f7ed;
  background: rgb(29 77 64 / 82%);
  border: 1px solid rgb(255 255 255 / 20%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 20%),
    0 1.3rem 2.8rem rgb(10 35 28 / 16%);
  backdrop-filter: blur(0.8rem) saturate(115%);

  blockquote {
    max-width: 44rem;
    margin: 1.3rem 0 1rem;
    font-size: clamp(1.35rem, 2.4vw, 2rem);
    font-weight: 600;
    line-height: 1.5;
    text-wrap: balance;
  }

  footer {
    color: rgb(244 247 237 / 74%);
    font-size: 0.84rem;
    font-weight: 600;
  }
}

.quote-label {
  font-size: 0.66rem;
  font-weight: 700;
  opacity: 0.7;
}

.quote-refresh {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: grid;
  width: 2.6rem;
  height: 2.6rem;
  place-items: center;
  padding: 0;
  color: inherit;
  background: rgb(244 247 237 / 10%);
  cursor: pointer;
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
  border-top: 1px solid var(--line);
}

.route-link {
  display: grid;
  grid-template-columns: 4rem 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1.2rem 0;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
  transition:
    color 180ms ease,
    padding 180ms ease;

  &:hover,
  &:focus-visible {
    padding-right: 0.4rem;
    padding-left: 0.4rem;
    color: var(--forest);
    outline: none;
  }

  span:nth-child(2) {
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    font-weight: 700;
  }
}

.route-index {
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 700;
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
    min-height: 43rem;
  }

  .hero-content {
    padding-top: 7.8rem;
    padding-bottom: 7.4rem;
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

  .routes-section {
    padding-top: 0;
  }

  .quote-section {
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

  .route-link {
    grid-template-columns: 2.8rem 1fr auto;
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
}
</style>
