<script setup>
import { onMounted, computed } from 'vue';
import {
  BookOutlined,
  BulbOutlined,
  CodeOutlined,
  GithubOutlined,
  LinkOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons-vue';
const store = useNuxtStore();
definePageMeta({
  layout: 'classics',
});
useHead({
  script: [
    { type: 'text/javascript', src: '/blog/TagCanvas.js' },
  ],
});

// 安全解析配置内容（数据库JSON列已自动反序列化）
const safeParse = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val;
};

// 从配置中获取数据的计算属性
const basicInfo = computed(() => {
  return safeParse(store.$state.config['about-basic-info']?.content, {});
});

const socialLinks = computed(() => {
  return safeParse(store.$state.config['about-social-links']?.content, []);
});

const pageTexts = computed(() => {
  return safeParse(store.$state.config['about-page-texts']?.content, {});
});

const keywordDescription = computed(() => {
  return store.$state.config['about-keyword-description']?.content || '';
});

const finalThoughtsHint = computed(() => {
  return store.$state.config['final-thoughts-hint']?.content || '';
});

const isImageIcon = (value) => /^(https?:\/\/|\/)/i.test(String(value || ''));
const getIconComponent = (value) => {
  const name = String(value || '').toLowerCase();
  if (name.includes('github')) return GithubOutlined;
  if (name.includes('wechat') || name.includes('公众号')) return WechatOutlined;
  if (name.includes('book') || name.includes('文章')) return BookOutlined;
  if (name.includes('user') || name.includes('person')) return UserOutlined;
  if (name.includes('bulb') || name.includes('infj')) return BulbOutlined;
  if (name.includes('link') || name.includes('url')) return LinkOutlined;
  return CodeOutlined;
};

// #region 词云
const cloud = ref(null);
const cloudInit = () => {
  // 生成词云
  setTimeout(() => {
    try {
      TagCanvas.Start('cloud', 'cloud-tags', {
        textColour: '#777777',
        outlineColour: '#777777',
        dragControl: false, // 设置禁用鼠标拖动，跟着鼠标转动
        pinchZoom: true, // 设置为true通过捏合触摸屏设备来启用放大和缩小云
        reverse: true, // 设置为true以反转相对于鼠标位置的移动方向
        textHeight: 20, // 字体大小，单位px
        shape: 'Sphere', //目前支持的是Sphere hcylinder vcylinder 分别是圆形，立着的卷发棒，躺着的卷发棒
        depth: 0.8, // 控制透视图(0.0-1.0)
        decel: 1, // 鼠标离开画布时的减速率，设置0，鼠标离开就停止，设置1，鼠标离开还一直转
        padding: 5, // 文本框的padding
        wheelZoom: true, // 使用鼠标滚轮或滚动手势可以放大和缩小云
        fadeIn: 3, // 标签淡入的时间
        freezeActive: false, // 设置为true以在突出显示标记时暂停移动，这个必须是在dragControl:false才有效
        outlineMethod: 'outline', // 鼠标指到的元素变化类型，outline:显示边框线(有深度)，classic:显示边框线，block:改变背景颜色为边框线颜色，colour:改变颜色，颜色属性为outlineColour:'#fff'，size:改变文本大小，大小属性为outlineIncrease:20，none:不突出显示
        outlineOffset: '5', // 轮廓与文本的距离，单位px
        outlineRadius: '10', // 轮廓框上的圆角半径，单位px
        outlineThickness: '3', // 轮廓的粗细，单位px
        txtOpt: true, // 文本优化,将文本标签转换为图像以获得更好的性能
        maxSpeed: 0.05, // 最大旋转速度，设置小一点，转的慢一点
        initial: [0.1, -0.2], // 初始旋转，水平和垂直为数组，这个是鼠标未进行操控时的旋转
        hideTags: true, // 隐藏基础标签
      });
    } catch (e) {
      cloud.value.style.display = 'none';
    }
  }, 1000);
};
// #endregion

let thoughtsIndex = ref(0);
let thoughtsInterval = null;
const getRandomIndex = (arr, excludeIndex, clearIntervalOrNot = false) => {
  // 取数组的随机索引，除了excludeIndex
  // 创建一个包含所有可能索引的数组（排除 excludeIndex）
  const indices = arr.map((_, i) => i).filter((i) => i !== excludeIndex);
  // 如果没有可选索引，返回 null
  if (indices.length === 0) return null;
  // 从剩余索引中随机选择一个
  const randomIndex = Math.floor(Math.random() * indices.length);
  if (clearIntervalOrNot) {
    clearInterval(thoughtsInterval);
  }
  return indices[randomIndex];
};

const goTo = (url, event) => {
  // 跳转到新页面函数
  event.preventDefault();
  window.open(url, '_blank');
};

onMounted(() => {
  cloudInit();
  thoughtsInterval = setInterval(() => {
    thoughtsIndex.value = getRandomIndex(
      store.$state.config['final-thoughts']?.content,
      thoughtsIndex.value,
    );
  }, 5000);
});

onBeforeUnmount(() => {
  clearInterval(thoughtsInterval);
});
</script>

<template>
  <div id="about-page" class="content-box blog-page-shell overflow-hidden">
    <!-- xaiver bar -->
    <a-card hoverable id="xaiver" class="relative blog-glass-panel">
      <img
        class="w-80 h-80 rounded-full mx-auto mb-6 mt-12 p-2"
        :src="store.$state.config['my-avatar']?.content"
        :alt="basicInfo.name || 'Avatar'"
        v-motion-pop-visible-once
      />
      <h1 class="text-center text-6xl font-bold">{{ basicInfo.name || 'Name' }}</h1>
      <p id="description" class="text-center text-2xl font-normal my-4">
        {{ basicInfo.tagline || 'Tagline' }}
      </p>
      <div class="mx-auto my-8 flex justify-center items-center gap-12">
        <div
          v-for="link in socialLinks"
          :key="link.name"
          class="about-social-icon"
          @click="goTo(link.url, $event)"
          :title="link.name"
        >
          <img v-if="isImageIcon(link.icon)" :src="link.icon" :alt="link.name" />
          <component v-else :is="getIconComponent(link.iconClass || link.icon || link.name)" />
        </div>
      </div>
    </a-card>

    <!-- 关于本站 -->
    <h1>
      {{ pageTexts.aboutWebTitle || '关于本站'
      }}<span>{{ pageTexts.aboutWebSubtitle || 'About Web' }}</span>
    </h1>
    <a-card
      class="card about-web-card overflow-hidden relative my-8 blog-glass-panel"
      v-motion-fade-visible-once
    >
      <RepeatParallaxSlide :containerClass="'describe-card'">
        <div v-for="item in store.$state.config['about-me-slide']?.content" :key="item.title">
          <div class="describe-card relative card flex flex-col justify-center items-center">
            <img class="md:w-full absolute top-0" :src="item.image" />
            <h3 class="card-title text-center mb-8">{{ item.title }}</h3>
            <p
              class="w-4/5 text-center my-8"
              v-for="text in item.text"
              :key="text"
              v-html="text"
            ></p>
          </div>
        </div>
      </RepeatParallaxSlide>
    </a-card>

    <!-- about me -->
    <h1>
      {{ pageTexts.aboutMeTitle || '关于我'
      }}<span>{{ pageTexts.aboutMeSubtitle || 'About Me' }}</span>
    </h1>
    <!-- 渐变bar -->
    <a-card
      id="gradient-card"
      class="card my-8 p-8 relative blog-glass-panel"
      v-motion-slide-visible-top
    >
      <span class="card-title absolute top-8">Hi👏🏻</span>
      <div class="card-text">{{ basicInfo.welcomeText || '🎉欢迎来到我的空间🎉' }}</div>
      <div class="card-text">
        {{ basicInfo.introduction || '' }}<BulbOutlined v-if="basicInfo.introduction || basicInfo.profession" class="about-inline-icon mx-4" />{{ basicInfo.profession || '' }}
      </div>
      <div id="INFJ-bg" class="absolute text-9xl top-8 right-8">
        {{ basicInfo.personality || '' }}
      </div>
      <div id="INFJ-attach" class="absolute text-9xl left-8">
        {{ basicInfo.personalityDesc || '' }}
      </div>
    </a-card>

    <!-- 技能 / 生涯 -->
    <div class="flex flex-wrap">
      <div class="w-full lg:w-1/2 pr-0 lg:pr-4 my-4">
        <a-card
          class="w-full card overflow-hidden flex blog-glass-panel"
          style="height: 60rem"
          v-motion-slide-visible-left
        >
          <span class="card-title">{{ pageTexts.skillTitle || '技能' }}</span>
          <div
            class="scroll-hidden h-full w-full pb-40 my-8 flex gap-8 flex-wrap justify-start content-start flex-1 overflow-y-scroll"
          >
            <div
              v-for="item in store.$state.config['skill-item']?.content"
              :key="item.name"
              :class="item.type == 'parting' ? 'w-full' : ''"
            >
              <a-tag
                class="tag py-4 p-8 flex justify-center items-center"
                v-if="item.type == 'tag'"
                @click="goTo(item.url, $event)"
                :color="item.color"
              >
                <template #icon>
                  <component :is="getIconComponent(item.iconClass || item.name)" class="about-inline-icon mr-4" />
                </template>
                {{ item.name }}
              </a-tag>
              <div v-else-if="item.type == 'parting'" class="w-full">
                <a-divider orientation="left">{{ item.title }}</a-divider>
              </div>
            </div>
          </div>
        </a-card>
      </div>
      <div class="w-full lg:w-1/2 pl-0 lg:pl-4 my-4">
        <a-card
          class="w-full card overflow-hidden flex blog-glass-panel"
          style="height: 60rem"
          v-motion-slide-visible-right
        >
          <span class="card-title">{{ pageTexts.careerTitle || '生涯' }}</span>
          <div
            class="scroll-hidden h-full w-full my-8 flex gap-8 flex-wrap justify-start content-start flex-1 overflow-y-scroll"
          >
            <a-timeline pending="加载中..." mode="alternate" reverse class="py-8">
              <a-timeline-item
                class="timeline-item"
                v-for="(item, index) in store.$state.config['career-line']?.content"
                :key="index"
              >
                <template #dot>
                  <div class="dot">{{ item.icon }}</div>
                </template>
                <div
                  class="line-info mx-4 flex flex-col items-center"
                  :class="
                    (store.$state.config['career-line']?.content?.length - index - 1) % 2 == 0
                      ? 'text-right'
                      : 'text-left'
                  "
                >
                  <div class="time mx-4 flex-1 w-full">{{ item.time }}</div>
                  <div class="w-full">{{ item.label }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 词云cloud -->
    <a-card class="card relative my-8 blog-glass-panel" v-motion-slide-visible-top>
      <span class="card-title">{{ pageTexts.keywordTitle || '关键词' }}</span>
      <div id="word-cloud">
        <div class="flex justify-center items-center">
          <canvas width="600" height="350" id="cloud" ref="cloud"></canvas>
        </div>
        <div
          id="cloud-tags"
          class="hidden"
          v-html="store.$state.config['about-me-cloud-tags']?.content"
        ></div>
        <div class="small-tips text-end">{{ keywordDescription }}</div>
      </div>
    </a-card>

    <!-- 写在最后 -->
    <h1>
      {{ pageTexts.finalThoughtsTitle || '写在最后'
      }}<span>{{ pageTexts.finalThoughtsSubtitle || 'Final Thoughts' }}</span>
    </h1>
    <a-card
      class="card my-8 cursor-point blog-glass-panel"
      @click="
        thoughtsIndex = getRandomIndex(
          store.$state.config['final-thoughts']?.content,
          thoughtsIndex,
          true,
        )
      "
      v-motion-slide-visible-top
    >
      <p
        class="card-title mt-4"
        v-for="(item, index) in store.$state.config['final-thoughts']?.content"
        :key="index + 'thoughts'"
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 300,
          },
        }"
        v-show="index == thoughtsIndex"
        v-html="item"
      ></p>
      <div class="small-tips text-end">{{ finalThoughtsHint }}</div>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
#about-page {
  max-width: min(112rem, calc(100vw - 3.2rem));
  padding-top: clamp(2.4rem, 5vw, 6.4rem);
  color: #26332c;

  // xaiver bar
  #xaiver {
    overflow: hidden;
    border-radius: 8px;
    text-align: center;

    :deep(.ant-card-body) {
      padding: clamp(2.4rem, 5vw, 5.6rem);
    }

    &:hover img {
      transform: translateY(-2px);
    }

    img {
      width: clamp(12rem, 20vw, 18rem) !important;
      height: clamp(12rem, 20vw, 18rem) !important;
      padding: 0.4rem !important;
      border-radius: 8px !important;
      background: $surface-hover;
      object-fit: cover;
      box-shadow: 0 18px 44px rgba(48, 69, 56, 0.16);
    }

    img,
    .icon {
      transition:
        transform 0.25s ease,
        color 0.25s ease,
        border-color 0.25s ease;
    }

    #description {
      color: $secondary-text-color;
      font-size: clamp(1.5rem, 2vw, 1.9rem);
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4.4rem;
      height: 4.4rem;
      border: 1px solid $surface-border;
      border-radius: $radius-control;
      color: $main-text-color;
      font-size: 2.2rem;
      background: $surface-control;
      box-shadow: $surface-inner-highlight;

      &:hover {
        transform: translateY(-2px);
        border-color: $color-border-strong;
      }
    }

    .about-social-icon {
      align-items: center;
      background: $surface-control;
      border: 1px solid $color-border-strong;
      border-radius: $radius-control;
      color: $color-accent-primary;
      display: inline-flex;
      font-size: 2.4rem;
      height: 4.4rem;
      justify-content: center;
      transition:
        transform 0.25s ease,
        color 0.25s ease,
        border-color 0.25s ease;
      width: 4.4rem;

      &:hover {
        border-color: $color-accent-primary;
        color: $main-text-color;
        transform: translateY(-2px);
      }

      img {
        border-radius: 4px !important;
        box-shadow: none;
        height: 2.4rem !important;
        padding: 0 !important;
        width: 2.4rem !important;
      }
    }

    .about-inline-icon {
      color: $color-accent-primary;
      vertical-align: -0.12em;
    }
  }

  h1 {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1.2rem;
    margin: clamp(3.2rem, 6vw, 6rem) 0 1.6rem;
    color: $main-text-color;
    font-family: $font-display;
    font-size: clamp(2.8rem, 4vw, 5rem);
    font-weight: 650;
    line-height: 1.04;

    span {
      color: $secondary-text-color;
      font-family: $font-display;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-left: 1rem;
      text-transform: uppercase;
    }
  }

  #gradient-card {
    background:
      linear-gradient(135deg, $surface-hover, $surface-glass),
      radial-gradient(circle at 18% 18%, rgba(112, 142, 115, 0.22), transparent 30%);
    overflow: hidden;
    color: $main-text-color;
    box-shadow: $surface-inner-highlight, $surface-shadow;

    & > * {
      opacity: 0.92;
    }

    // 字体反向
    .reverse-text {
      transform: scaleX(-1);
      display: inline-block;
      /* 确保反向显示在块级或行内级元素中都生效 */
    }

    .card-text {
      text-align: left;
      opacity: 1;
      color: rgba(38, 51, 44, 0.84);
      font-size: clamp(1.6rem, 2vw, 2rem);
      line-height: 1.8;
    }

    &:hover #INFJ-bg {
      font-size: 10rem;
    }

    &:hover #INFJ-attach {
      top: -100%;
      opacity: 0;
    }

    #INFJ-bg,
    #INFJ-attach {
      z-index: -1;
      transition: all 0.5s;
      font-size: 20rem;
      opacity: 0.07;
    }

    #INFJ-attach {
      top: -20%;
      font-size: 15rem;
    }

    @media (max-width: 1020px) {
      #INFJ-bg {
        font-size: 10rem;
      }

      #INFJ-attach {
        top: -100%;
        opacity: 0;
      }
    }
  }

  .about-web-card {
    font-weight: 650;

    .describe-card {
      height: 40rem;

      &:hover .card-title::after {
        width: 100%;
      }

      .card-title {
        color: $main-text-color;
        font-size: clamp(2rem, 3vw, 3.6rem);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          background: $main-color;
          bottom: 0;
          left: 0;
          border-radius: 20px;
          transition: width 0.5s ease;
        }
      }

      .card-title,
      p {
        z-index: 2;
        opacity: 1;
      }

      p {
        color: rgba(38, 51, 44, 0.76);
        font-size: clamp(1.5rem, 2vw, 1.8rem);
        margin: 1rem auto;
      }

      * {
        z-index: 1;
        opacity: 0.8;
      }
    }
  }

  .card-title {
    color: #26332c;
    font-size: clamp(1.8rem, 2vw, 2.4rem);
    font-weight: 720;
    transition: color 0.25s ease;
  }

  .card {
    color: #26332c;
    border-radius: 8px;

    :deep(.ant-card-body) {
      width: 100%;
    }

    .tag {
      border-radius: 8px;
      font-size: 1.4rem;
      cursor: $hover-cursor;
      transition:
        transform 0.2s ease,
        border-color 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }

    &:hover .card-title {
      color: #3f5946;
    }

    // 生涯item
    .timeline-item {
      cursor: $hover-cursor;

      &:hover .dot,
      &:hover .line-info .time {
        font-weight: $large-font-weight;
      }

      .dot {
        font-size: $medium-font-size;
        transition: all 0.5s;
      }

      .line-info {
        color: rgba(38, 51, 44, 0.74);
        font-size: 1.3rem;
        width: 90%;

        .time {
          color: #26332c;
          font-size: 1.35rem;
          transition: font-weight 0.3s;
        }
      }
    }

    .small-tips {
      color: rgba(55, 72, 62, 0.58);
    }
  }

  // 隐藏滚动条
  .scroll-hidden {
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* Internet Explorer 和 Edge */

    &::-webkit-scrollbar {
      display: none;
      /* Chrome, Safari, Opera */
    }
  }
}

@media (max-width: 768px) {
  #about-page {
    max-width: calc(100vw - 2.4rem);

    h1 {
      align-items: flex-start;
      flex-direction: column;
      margin-top: 3.2rem;
    }

    #xaiver :deep(.ant-card-body) {
      padding: 2.4rem;
    }
  }
}
</style>
<style lang="scss">
.about-web-card {
  .ant-card-body {
    padding: 0 !important;
  }
}
</style>
