<template>
  <a
    class="skip-link"
    href="#main-content"
  >跳到主要内容</a>

  <div class="site-shell">
    <header
      class="site-header"
      :class="{ 'is-scrolled': isScrolled }"
    >
      <a
        class="brand-lockup"
        href="#top"
        aria-label="晓黎团队首页"
        @click="menuOpen = false"
      >
        <img
          src="/images/brand/xiaoli-symbol.png"
          alt=""
        />
        <span>
          <strong>{{ SITE_BRAND.name }}</strong>
          <small>{{ SITE_BRAND.englishName }}</small>
        </span>
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="site-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? '关闭导航' : '打开导航' }}</span>
        <span aria-hidden="true">{{ menuOpen ? '关闭' : '菜单' }}</span>
      </button>

      <nav
        id="site-navigation"
        class="site-navigation"
        :class="{ 'is-open': menuOpen }"
      >
        <a
          v-for="item in NAV_ITEMS"
          :key="item.href"
          :href="item.href"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </a>
      </nav>
    </header>

    <main id="main-content">
      <section
        id="top"
        class="hero"
        aria-labelledby="hero-title"
      >
        <div
          class="hero-noise"
          aria-hidden="true"
        ></div>
        <div class="hero-layout">
          <div class="hero-copy">
            <p class="section-kicker">
              AI PRODUCT TEAM · CHINA
            </p>
            <h1 id="hero-title">
              把 AI 技术，<br />
              做成<span>真正可用</span>的产品。
            </h1>
            <p class="hero-description">
              {{ SITE_BRAND.description }}
            </p>
            <div class="hero-actions">
              <a
                class="action-primary"
                href="#products"
              >
                探索我们的产品 <span aria-hidden="true">↓</span>
              </a>
              <a
                class="action-text"
                href="#contact"
              >
                发起合作 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div
            class="hero-art"
            aria-label="晓黎创意日出品牌标志"
          >
            <div
              class="hero-orbit orbit-one"
              aria-hidden="true"
            ></div>
            <div
              class="hero-orbit orbit-two"
              aria-hidden="true"
            ></div>
            <img
              src="/images/brand/xiaoli-symbol.png"
              alt="晓黎创意日出与水面标志"
            />
            <div class="hero-art-note note-top">
              <span>TECHNICAL</span>
              <strong>工程能力</strong>
            </div>
            <div class="hero-art-note note-bottom">
              <span>HUMAN</span>
              <strong>人文温度</strong>
            </div>
          </div>
        </div>

        <div
          class="hero-footprint"
          aria-label="团队概况"
        >
          <div>
            <span>始于</span>
            <strong>2022</strong>
          </div>
          <div>
            <span>协作网络</span>
            <strong>北京 · 昆明</strong>
          </div>
          <div>
            <span>工作方式</span>
            <strong>技术 × 产品 × 创意</strong>
          </div>
          <p>{{ SITE_BRAND.mission }}</p>
        </div>
      </section>

      <section
        id="capabilities"
        class="section capabilities-section"
        aria-labelledby="capabilities-title"
      >
        <header class="section-heading split-heading">
          <div>
            <p class="section-kicker">
              WHAT WE BUILD
            </p>
            <h2 id="capabilities-title">
              从技术判断到产品落地
            </h2>
          </div>
          <p>
            我们从真实业务问题出发，组织产品、设计和工程能力。AI 是核心能力，人文洞察决定产品最终如何被理解和使用。
          </p>
        </header>

        <div class="capability-grid">
          <article
            v-for="capability in CAPABILITIES"
            :key="capability.id"
            class="capability-card"
            :class="{ featured: capability.featured }"
          >
            <div class="capability-index">
              {{ capability.index }}
            </div>
            <div class="capability-body">
              <h3>{{ capability.title }}</h3>
              <p>{{ capability.description }}</p>
              <ul>
                <li
                  v-for="detail in capability.details"
                  :key="detail"
                >
                  {{ detail }}
                </li>
              </ul>
            </div>
            <span
              class="capability-mark"
              aria-hidden="true"
            >{{ capability.featured ? 'AI' : '↗' }}</span>
          </article>
        </div>
      </section>

      <section
        id="products"
        class="section products-section"
        aria-labelledby="products-title"
      >
        <header class="section-heading products-heading">
          <div>
            <p class="section-kicker">
              PRODUCT ECOSYSTEM
            </p>
            <h2 id="products-title">
              正在生长的产品
            </h2>
          </div>
          <p>产品不是能力清单，而是团队持续理解问题、迭代系统并承担结果的方式。</p>
        </header>

        <div class="product-list">
          <a
            v-for="(product, index) in PRODUCTS"
            :key="product.name"
            class="product-row"
            :class="`accent-${product.accent}`"
            :href="product.href"
            target="_blank"
            rel="noreferrer"
          >
            <span class="product-number">0{{ index + 1 }}</span>
            <div class="product-name">
              <span>{{ product.label }}</span>
              <h3>{{ product.name }}</h3>
            </div>
            <p>{{ product.description }}</p>
            <span class="product-kind">{{ product.kind }}</span>
            <span
              class="product-arrow"
              aria-hidden="true"
            >↗</span>
          </a>
        </div>
      </section>

      <section
        id="team"
        class="team-section"
        aria-labelledby="team-title"
      >
        <div class="team-manifesto">
          <p class="section-kicker">
            THE XIAOLI WAY
          </p>
          <h2 id="team-title">
            技术是手段，<br />人文是目的。
          </h2>
          <p class="manifesto-copy">
            晓黎诞生于 2022 年盛夏。我们从青年文化与真实表达出发，逐渐形成一支跨城市协作的技术产品团队。我们关心系统是否稳定，也关心它是否尊重使用它的人。
          </p>
        </div>

        <div class="team-values">
          <article
            v-for="(value, index) in TEAM_VALUES"
            :key="value.title"
          >
            <span>0{{ index + 1 }}</span>
            <h3>{{ value.title }}</h3>
            <p>{{ value.text }}</p>
          </article>
          <div class="team-cities">
            <span>REMOTE · TOGETHER</span>
            <strong>北京 / 昆明 / 更多正在连接的地方</strong>
          </div>
        </div>
      </section>

      <section
        id="contact"
        class="contact-section"
        aria-labelledby="contact-title"
      >
        <div class="contact-copy">
          <p class="section-kicker">
            BUILD WITH US
          </p>
          <h2 id="contact-title">
            有一个值得做成产品的想法？
          </h2>
          <p>告诉我们你正在解决的问题、所处阶段，以及你希望它最终为谁创造价值。</p>
        </div>
        <div class="contact-actions">
          <a
            :href="`mailto:${SITE_BRAND.contactEmail}`"
            class="contact-email"
          >
            <span>发送合作邮件</span>
            <strong>{{ SITE_BRAND.contactEmail }}</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <button
            v-if="qrImage"
            type="button"
            class="wechat-button"
            @click="qrDialogOpen = true"
          >
            <span>更多联系</span>
            <strong>查看公众号</strong>
            <i aria-hidden="true">＋</i>
          </button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-brand">
        <img
          src="/images/brand/xiaoli-symbol.png"
          alt=""
        />
        <div>
          <strong>{{ SITE_BRAND.name }}</strong>
          <span>{{ SITE_BRAND.legalName }}</span>
        </div>
      </div>
      <div class="footer-links">
        <a
          href="https://beian.miit.gov.cn"
          target="_blank"
          rel="noreferrer"
        >
          湘ICP备2026026942号-1
        </a>
        <a href="#top">回到顶部 ↑</a>
      </div>
    </footer>

    <div
      v-if="qrDialogOpen"
      class="qr-backdrop"
      @click.self="qrDialogOpen = false"
    >
      <section
        class="qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="公众号二维码"
      >
        <button
          type="button"
          aria-label="关闭二维码"
          @click="qrDialogOpen = false"
        >
          关闭
        </button>
        <img
          :src="qrImage"
          alt="晓黎团队公众号二维码"
        />
        <p>扫码关注，了解产品进展与团队动态</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { getGlobalConfig } from '@/api';
import {
  CAPABILITIES,
  getConfiguredQrImage,
  NAV_ITEMS,
  PRODUCTS,
  SITE_BRAND,
  TEAM_VALUES,
} from '@/lib/companyContent';

const isScrolled = ref(false);
const menuOpen = ref(false);
const qrDialogOpen = ref(false);
const qrImage = ref('');

const updateScrollState = () => {
  isScrolled.value = window.scrollY > 24;
};

const validateQrImage = (src) => {
  const image = new Image();
  image.onload = () => {
    qrImage.value = src;
  };
  image.src = src;
};

const loadCompanyHome = async () => {
  try {
    const config = await getGlobalConfig();
    const configuredQrImage = getConfiguredQrImage(config);
    if (configuredQrImage) validateQrImage(configuredQrImage);
  } catch {
    // 联系配置不可用时保留邮件入口，不影响公司官网主体内容。
  }
};

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  loadCompanyHome();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState);
});
</script>

<style lang="scss" scoped>
.site-shell {
  --ink: #101722;
  --blue: #123c77;
  --blue-deep: #071b39;
  --blue-light: #d9e5f2;
  --sun: #f3a313;
  --sun-soft: #ffd986;
  --paper: #f3f0e8;
  --paper-deep: #e7e1d3;
  --muted: #66707d;
  --line: rgb(16 23 34 / 15%);
  min-height: 100vh;
  color: var(--ink);
  background: var(--paper);
  overflow: clip;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.75rem 1rem;
  color: white;
  background: var(--blue-deep);
  transform: translateY(-150%);
  transition: transform 180ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}

.site-header {
  position: fixed;
  z-index: 30;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 5.75rem;
  padding: 0 4vw;
  color: white;
  border-bottom: 1px solid rgb(255 255 255 / 13%);
  transition:
    min-height 240ms ease,
    background 240ms ease,
    color 240ms ease,
    box-shadow 240ms ease;
}

.site-header.is-scrolled {
  min-height: 4.6rem;
  color: var(--ink);
  background: rgb(243 240 232 / 90%);
  border-bottom-color: var(--line);
  box-shadow: 0 0.8rem 2rem rgb(7 27 57 / 8%);
  backdrop-filter: blur(18px);
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.brand-lockup img {
  width: 3.1rem;
  height: 3.1rem;
  object-fit: contain;
  transition: transform 260ms ease;
}

.brand-lockup:hover img {
  transform: rotate(-4deg) scale(1.04);
}

.brand-lockup span {
  display: grid;
  gap: 0.08rem;
}

.brand-lockup strong {
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brand-lockup small {
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.19em;
  opacity: 0.68;
  text-transform: uppercase;
}

.site-navigation {
  display: flex;
  align-items: center;
  gap: clamp(1.3rem, 2.5vw, 2.7rem);
  font-size: 0.86rem;
  font-weight: 600;
}

.site-navigation a {
  position: relative;
  padding: 0.5rem 0;
}

.site-navigation a::after {
  position: absolute;
  right: 0;
  bottom: 0.18rem;
  left: 0;
  height: 1px;
  background: currentColor;
  content: '';
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 220ms ease;
}

.site-navigation a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.menu-toggle {
  display: none;
  padding: 0.55rem 0;
  color: inherit;
  background: transparent;
  border: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.hero {
  position: relative;
  min-height: 100dvh;
  padding: 8.5rem 4vw 0;
  color: white;
  background:
    radial-gradient(circle at 70% 38%, rgb(18 60 119 / 80%), transparent 33rem),
    radial-gradient(circle at 8% 88%, rgb(30 80 139 / 33%), transparent 28rem),
    var(--blue-deep);
  isolation: isolate;
}

.hero::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 4%) 1px, transparent 1px);
  background-size: 5rem 5rem;
  content: '';
  mask-image: linear-gradient(to bottom, black 0, transparent 78%);
}

.hero-noise {
  position: absolute;
  z-index: -1;
  inset: 0;
  opacity: 0.12;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(24rem, 0.88fr);
  gap: 6vw;
  align-items: center;
  width: min(92rem, 100%);
  min-height: calc(100dvh - 15rem);
  margin: 0 auto;
}

.section-kicker {
  margin: 0 0 1.25rem;
  color: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  opacity: 0.7;
}

.hero-copy h1 {
  max-width: 54rem;
  margin: 0;
  font-size: clamp(3.6rem, 6.7vw, 7.8rem);
  font-weight: 650;
  line-height: 0.99;
  letter-spacing: -0.065em;
  text-wrap: balance;
}

.hero-copy h1 span {
  color: var(--sun-soft);
  font-family: Georgia, 'Songti SC', serif;
  font-style: italic;
  font-weight: 500;
}

.hero-copy,
.hero-art,
.section-heading > *,
.team-manifesto,
.team-values {
  min-width: 0;
}

.hero-description {
  max-width: 41rem;
  margin: 2.25rem 0 0;
  color: rgb(255 255 255 / 72%);
  font-size: clamp(1rem, 1.3vw, 1.18rem);
  line-height: 1.9;
  text-wrap: pretty;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2.7rem;
}

.action-primary,
.action-text {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  font-size: 0.88rem;
  font-weight: 700;
  transition:
    transform 220ms ease,
    color 220ms ease,
    background 220ms ease;
}

.action-primary {
  min-width: 13rem;
  padding: 1rem 1.1rem;
  color: var(--blue-deep);
  background: var(--sun-soft);
}

.action-primary:hover {
  background: white;
  transform: translateY(-0.2rem);
}

.action-text {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgb(255 255 255 / 35%);
}

.action-text:hover {
  color: var(--sun-soft);
  transform: translateX(0.2rem);
}

.action-primary:active,
.action-text:active {
  transform: scale(0.98);
}

.hero-art {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 35rem;
}

.hero-art::before {
  position: absolute;
  width: min(31rem, 90%);
  aspect-ratio: 1;
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 50%;
  content: '';
  box-shadow:
    inset 0 0 0 4rem rgb(255 255 255 / 1.5%),
    0 0 8rem rgb(68 121 187 / 24%);
}

.hero-art img {
  position: relative;
  z-index: 2;
  width: min(27rem, 82%);
  filter: drop-shadow(0 2rem 2rem rgb(0 0 0 / 24%));
  animation: logo-float 7s ease-in-out infinite;
}

.hero-orbit {
  position: absolute;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 50%;
}

.orbit-one {
  width: 36rem;
  height: 21rem;
  transform: rotate(18deg);
}

.orbit-two {
  width: 24rem;
  height: 38rem;
  transform: rotate(-32deg);
}

.hero-art-note {
  position: absolute;
  z-index: 3;
  display: grid;
  gap: 0.2rem;
  min-width: 8.5rem;
  padding: 0.9rem 1rem;
  background: rgb(7 27 57 / 72%);
  border: 1px solid rgb(255 255 255 / 16%);
  backdrop-filter: blur(10px);
}

.hero-art-note span {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  opacity: 0.58;
}

.hero-art-note strong {
  font-size: 0.84rem;
}

.note-top {
  top: 18%;
  right: 0;
}

.note-bottom {
  bottom: 14%;
  left: -4%;
}

.hero-footprint {
  display: grid;
  grid-template-columns: 0.65fr 1fr 1.3fr auto;
  align-items: stretch;
  width: min(92rem, 100%);
  margin: 0 auto;
  border-top: 1px solid rgb(255 255 255 / 15%);
}

.hero-footprint > div {
  display: grid;
  gap: 0.35rem;
  padding: 1.35rem 1.6rem 1.5rem 0;
  border-right: 1px solid rgb(255 255 255 / 12%);
}

.hero-footprint > div + div {
  padding-left: 1.6rem;
}

.hero-footprint span {
  font-size: 0.62rem;
  letter-spacing: 0.13em;
  opacity: 0.5;
}

.hero-footprint strong {
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.hero-footprint > p {
  align-self: center;
  margin: 0;
  padding-left: 2.4rem;
  color: var(--sun-soft);
  font-family: Georgia, 'Songti SC', serif;
  font-size: 1.05rem;
  font-style: italic;
}

.section {
  width: min(92rem, 100%);
  margin: 0 auto;
  padding: clamp(6.5rem, 10vw, 10rem) 4vw;
}

.section-heading {
  margin-bottom: clamp(3.5rem, 6vw, 6rem);
}

.section-heading h2,
.team-manifesto h2,
.contact-copy h2 {
  margin: 0;
  font-size: clamp(2.8rem, 5vw, 5.8rem);
  font-weight: 620;
  line-height: 1.05;
  letter-spacing: -0.055em;
  text-wrap: balance;
}

.split-heading {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 8vw;
  align-items: end;
}

.split-heading > p,
.products-heading > p {
  max-width: 34rem;
  margin: 0 0 0.45rem;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.85;
}

.capability-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  grid-template-rows: repeat(2, auto);
  gap: 1rem;
}

.capability-card {
  position: relative;
  display: grid;
  grid-template-columns: 4.2rem 1fr;
  gap: 1rem;
  min-height: 18rem;
  padding: clamp(2rem, 3.5vw, 3.5rem);
  color: var(--ink);
  background: var(--paper-deep);
  overflow: hidden;
}

.capability-card.featured {
  grid-row: 1 / span 2;
  min-height: 37rem;
  color: white;
  background:
    radial-gradient(circle at 90% 80%, rgb(35 90 153 / 65%), transparent 24rem),
    var(--blue-deep);
}

.capability-card.featured::after {
  position: absolute;
  right: -10%;
  bottom: -38%;
  width: 31rem;
  aspect-ratio: 1;
  border: 1px solid rgb(255 255 255 / 13%);
  border-radius: 50%;
  content: '';
  box-shadow: inset 0 0 0 5rem rgb(255 255 255 / 2%);
}

.capability-index {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  opacity: 0.55;
}

.capability-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.capability-body h3 {
  max-width: 24rem;
  margin: 0;
  font-size: clamp(1.65rem, 2.5vw, 2.8rem);
  font-weight: 620;
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.capability-body > p {
  max-width: 34rem;
  margin: 1.3rem 0 2.3rem;
  color: inherit;
  font-size: 0.96rem;
  line-height: 1.8;
  opacity: 0.68;
}

.capability-body ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 0;
  margin: auto 0 0;
  list-style: none;
}

.capability-body li {
  padding: 0.48rem 0.7rem;
  border: 1px solid currentColor;
  font-size: 0.7rem;
  opacity: 0.62;
}

.capability-mark {
  position: absolute;
  right: 2rem;
  bottom: 1rem;
  color: currentColor;
  font-family: Georgia, serif;
  font-size: clamp(4rem, 9vw, 10rem);
  font-style: italic;
  line-height: 1;
  opacity: 0.055;
  pointer-events: none;
}

.products-section {
  width: 100%;
  max-width: none;
  padding-right: 0;
  padding-left: 0;
  background: #fcfaf5;
}

.products-heading {
  display: grid;
  grid-template-columns: 1fr 0.72fr;
  gap: 8vw;
  align-items: end;
  width: min(84rem, 92%);
  margin-right: auto;
  margin-left: auto;
}

.product-list {
  border-top: 1px solid var(--line);
}

.product-row {
  position: relative;
  display: grid;
  grid-template-columns: 4rem 1fr minmax(18rem, 0.9fr) 7rem 3rem;
  gap: 2.2rem;
  align-items: center;
  min-height: 10.5rem;
  padding: 1.5rem max(4vw, calc((100vw - 84rem) / 2));
  border-bottom: 1px solid var(--line);
  overflow: hidden;
  transition:
    color 250ms ease,
    background 250ms ease;
}

.product-row::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.32rem;
  background: var(--product-accent, var(--blue));
  content: '';
  transform: scaleY(0);
  transition: transform 250ms ease;
}

.product-row:hover {
  color: white;
  background: var(--blue-deep);
}

.product-row:hover::before {
  transform: scaleY(1);
}

.accent-cobalt {
  --product-accent: #4f85c5;
}

.accent-sunrise {
  --product-accent: var(--sun);
}

.accent-ink {
  --product-accent: #95a7bd;
}

.accent-mist {
  --product-accent: #8db9b6;
}

.product-number {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.7rem;
  opacity: 0.52;
}

.product-name span,
.product-kind {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  opacity: 0.48;
}

.product-name h3 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 3.2rem);
  font-weight: 580;
  letter-spacing: -0.04em;
}

.product-row > p {
  margin: 0;
  color: inherit;
  font-size: 0.9rem;
  line-height: 1.75;
  opacity: 0.63;
}

.product-kind {
  margin: 0;
  text-align: right;
}

.product-arrow {
  font-size: 1.55rem;
  transition: transform 220ms ease;
}

.product-row:hover .product-arrow {
  transform: translate(0.25rem, -0.25rem);
}

.team-section {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 8vw;
  padding: clamp(7rem, 11vw, 11rem) max(4vw, calc((100vw - 84rem) / 2));
  color: white;
  background:
    radial-gradient(circle at 0 100%, rgb(34 77 128 / 48%), transparent 32rem),
    #0b203e;
}

.team-manifesto {
  position: sticky;
  top: 8rem;
  align-self: start;
}

.team-manifesto h2 {
  color: var(--sun-soft);
  font-family: Georgia, 'Songti SC', serif;
  font-weight: 500;
}

.manifesto-copy {
  max-width: 39rem;
  margin: 2.2rem 0 0;
  color: rgb(255 255 255 / 67%);
  font-size: 1rem;
  line-height: 1.95;
}

.team-values {
  border-top: 1px solid rgb(255 255 255 / 16%);
}

.team-values article {
  display: grid;
  grid-template-columns: 3.2rem 1fr;
  gap: 0 1.2rem;
  padding: 2.2rem 0 2.5rem;
  border-bottom: 1px solid rgb(255 255 255 / 16%);
}

.team-values article > span {
  grid-row: 1 / span 2;
  padding-top: 0.35rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.66rem;
  opacity: 0.4;
}

.team-values h3 {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 600;
}

.team-values article p {
  max-width: 29rem;
  margin: 0.8rem 0 0;
  color: rgb(255 255 255 / 58%);
  font-size: 0.9rem;
  line-height: 1.75;
}

.team-cities {
  display: grid;
  gap: 0.6rem;
  margin-top: 5rem;
  padding: 1.5rem;
  color: var(--blue-deep);
  background: var(--sun-soft);
  transform: rotate(-1.2deg);
}

.team-cities span {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  opacity: 0.58;
}

.team-cities strong {
  font-size: 0.95rem;
}

.contact-section {
  display: grid;
  grid-template-columns: 1fr 0.82fr;
  gap: 8vw;
  padding: clamp(7rem, 11vw, 11rem) max(4vw, calc((100vw - 84rem) / 2));
  background: var(--sun-soft);
}

.contact-copy h2 {
  max-width: 46rem;
}

.contact-copy > p:last-child {
  max-width: 35rem;
  margin: 2rem 0 0;
  font-size: 1rem;
  line-height: 1.85;
  opacity: 0.66;
}

.contact-actions {
  align-self: end;
  border-top: 1px solid rgb(16 23 34 / 23%);
}

.contact-email,
.wechat-button {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.45rem 2rem;
  width: 100%;
  padding: 1.45rem 0;
  color: var(--ink);
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgb(16 23 34 / 23%);
  text-align: left;
  cursor: pointer;
  transition: padding 220ms ease;
}

.contact-email:hover,
.wechat-button:hover {
  padding-right: 0.6rem;
  padding-left: 0.6rem;
}

.contact-email span,
.wechat-button span {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  opacity: 0.53;
}

.contact-email strong,
.wechat-button strong {
  grid-column: 1;
  font-size: clamp(1.05rem, 1.6vw, 1.45rem);
  font-weight: 620;
}

.contact-email i,
.wechat-button i {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  font-size: 1.7rem;
  font-style: normal;
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  padding: 2.2rem 4vw;
  color: rgb(255 255 255 / 68%);
  background: #07162d;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.footer-brand img {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
}

.footer-brand div {
  display: grid;
  gap: 0.25rem;
}

.footer-brand strong {
  color: white;
  font-size: 0.88rem;
}

.footer-brand span {
  font-size: 0.64rem;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1.5rem;
  font-size: 0.68rem;
}

.footer-links a:hover {
  color: var(--sun-soft);
}

.qr-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgb(4 15 32 / 76%);
  backdrop-filter: blur(12px);
}

.qr-dialog {
  position: relative;
  width: min(23rem, 100%);
  padding: 1.3rem;
  color: var(--ink);
  background: var(--paper);
  box-shadow: 0 2rem 6rem rgb(0 0 0 / 35%);
}

.qr-dialog button {
  display: block;
  margin: 0 0 1rem auto;
  padding: 0.4rem 0;
  color: var(--ink);
  background: transparent;
  border: 0;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.qr-dialog img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: white;
}

.qr-dialog p {
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 0.78rem;
  text-align: center;
}

@keyframes logo-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-0.8rem) rotate(1deg);
  }
}

@media (max-width: 960px) {
  .hero-layout,
  .split-heading,
  .products-heading,
  .team-section,
  .contact-section {
    grid-template-columns: 1fr;
  }

  .hero-layout {
    padding: 5rem 0 4rem;
  }

  .hero-art {
    min-height: 28rem;
  }

  .hero-footprint {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero-footprint > p {
    grid-column: 1 / -1;
    padding: 1.2rem 0;
    border-top: 1px solid rgb(255 255 255 / 12%);
  }

  .capability-grid {
    grid-template-columns: 1fr;
  }

  .capability-card.featured {
    grid-row: auto;
    min-height: 30rem;
  }

  .product-row {
    grid-template-columns: 3rem 0.8fr 1fr 2rem;
  }

  .product-kind {
    display: none;
  }

  .team-manifesto {
    position: static;
  }

  .contact-actions {
    margin-top: 2rem;
  }
}

@media (max-width: 720px) {
  .site-header {
    min-height: 4.8rem;
    padding-right: 1.2rem;
    padding-left: 1.2rem;
  }

  .site-header.is-scrolled {
    min-height: 4.4rem;
  }

  .brand-lockup img {
    width: 2.75rem;
    height: 2.75rem;
  }

  .brand-lockup strong {
    font-size: 0.9rem;
  }

  .menu-toggle {
    display: block;
  }

  .site-navigation {
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    display: grid;
    gap: 0;
    padding: 0 1.2rem;
    color: var(--ink);
    background: rgb(243 240 232 / 97%);
    border-bottom: 1px solid var(--line);
    box-shadow: 0 1.2rem 2.5rem rgb(7 27 57 / 13%);
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    transform: translateY(-0.7rem);
    transition:
      opacity 200ms ease,
      transform 200ms ease,
      visibility 200ms ease;
    backdrop-filter: blur(18px);
  }

  .site-navigation.is-open {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
    transform: translateY(0);
  }

  .site-navigation a {
    padding: 1rem 0;
    border-bottom: 1px solid var(--line);
  }

  .hero {
    padding: 5rem 1.2rem 0;
  }

  .hero-layout {
    min-height: auto;
    padding-top: 4.8rem;
  }

  .hero-copy h1 {
    max-width: 100%;
    font-size: clamp(3rem, 14vw, 4.7rem);
    letter-spacing: -0.075em;
  }

  .hero-copy h1 span {
    display: block;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
    gap: 0.8rem;
  }

  .action-primary {
    width: 100%;
  }

  .action-text {
    align-self: flex-start;
  }

  .hero-art {
    min-height: 24rem;
  }

  .hero-art img {
    width: 74%;
  }

  .orbit-one {
    width: 26rem;
    height: 15rem;
  }

  .orbit-two {
    width: 18rem;
    height: 28rem;
  }

  .hero-art-note {
    min-width: 7rem;
    padding: 0.7rem;
  }

  .note-top {
    right: -0.5rem;
  }

  .note-bottom {
    left: -0.5rem;
  }

  .hero-footprint {
    grid-template-columns: 1fr 1fr;
  }

  .hero-footprint > div {
    padding: 1rem 0.6rem 1.1rem 0;
  }

  .hero-footprint > div + div {
    padding-left: 0.9rem;
  }

  .hero-footprint > div:nth-child(3) {
    grid-column: 1 / -1;
    padding-left: 0;
    border-top: 1px solid rgb(255 255 255 / 12%);
  }

  .section {
    padding: 6rem 1.2rem;
  }

  .section-heading h2,
  .team-manifesto h2,
  .contact-copy h2 {
    font-size: clamp(2.7rem, 12vw, 4.3rem);
  }

  .split-heading,
  .products-heading {
    gap: 1.5rem;
  }

  .capability-card {
    grid-template-columns: 2.6rem 1fr;
    min-height: 21rem;
    padding: 1.5rem;
  }

  .capability-card.featured {
    min-height: 29rem;
  }

  .products-heading {
    width: auto;
    margin-right: 1.2rem;
    margin-left: 1.2rem;
  }

  .product-row {
    grid-template-columns: 2rem 1fr 2rem;
    gap: 1rem;
    min-height: 9rem;
    padding: 1.4rem 1.2rem;
  }

  .product-row > p {
    grid-column: 2 / -1;
  }

  .product-arrow {
    grid-column: 3;
    grid-row: 1;
  }

  .team-section,
  .contact-section {
    gap: 4rem;
    padding: 6rem 1.2rem;
  }

  .team-cities {
    margin-top: 3rem;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
    padding: 2rem 1.2rem;
  }

  .footer-links {
    justify-content: flex-start;
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
