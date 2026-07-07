<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <!-- 网站列表 -->
    <Swiper
      v-if="siteLinks[0]"
      :modules="[Pagination, Mousewheel]"
      :slides-per-view="1"
      :space-between="40"
      :pagination="{
        el: '.swiper-pagination',
        clickable: true,
        bulletElement: 'div',
      }"
      :mousewheel="true"
    >
      <SwiperSlide v-for="site in siteLinksList" :key="site">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in site" :span="8" :key="item">
            <div
              class="item cards"
              :style="index < 3 ? 'margin-bottom: 20px' : null"
              @click="jumpLink(item)"
            >
              <Icon size="26">
                <component :is="siteIcon[item.icon]" />
              </Icon>
              <span class="name text-hidden">{{ item.name }}</span>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
// 可前往 https://www.xicons.org 自行挑选并在此处引入
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode } from "@vicons/fa"; // 注意使用正确的类别
import { mainStore } from "@/store";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper/modules";
import { getGlobalConfig } from "@/api";

const store = mainStore();

// 初始化默认网站链接数据
const defaultSiteLinks = [
  { "icon": "Blog", "name": "博客", "link": "/blog" },
  { "icon": "Cloud", "name": "理想国文学网", "link": "https://litopia.space" },
  { "icon": "CompactDisc", "name": "音乐", "link": "/" },
  { "icon": "Compass", "name": "起始页", "link": "/" },
  { "icon": "Book", "name": "网址集", "link": "/" },
  { "icon": "Fire", "name": "创业OS", "link": "https://finlaw.cloud" },
  { "icon": "LaptopCode", "name": "站点监测", "link": "/" }
];

// 响应式数据 - 初始化为默认数据，确保组件始终有内容显示
const siteLinks = ref([...defaultSiteLinks]);

// 计算网站链接
const siteLinksList = computed(() => {
  const result = [];
  for (let i = 0; i < siteLinks.value.length; i += 6) {
    const subArr = siteLinks.value.slice(i, i + 6);
    result.push(subArr);
  }
  return result;
});

// 网站链接图标
const siteIcon = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
};

// 链接跳转
const jumpLink = (data) => {
  if (data.name === "音乐" && store.musicClick) {
    if (typeof $openList === "function") $openList();
  } else {
    window.open(data.link, "_blank");
  }
};

// 获取网站链接配置
const loadSiteLinks = async () => {
  try {
    const config = await getGlobalConfig();
    if (config && config['site-links'] && config['site-links'].content && Array.isArray(config['site-links'].content)) {
      siteLinks.value = config['site-links'].content;
      console.log('✅ 网站链接：使用后端API配置');
    } else {
      console.log('📄 网站链接：API无数据，保持默认配置');
    }
  } catch (error) {
    console.warn('⚠️ 网站链接：API获取失败，保持默认配置', error?.message || error);
  }
};

// 异步加载配置，但不阻塞组件渲染
onMounted(() => {
  // 使用 setTimeout 确保组件已经渲染，然后再尝试加载配置
  setTimeout(() => {
    loadSiteLinks().catch(err => {
      console.warn('网站链接配置加载失败，使用默认配置:', err);
    });
  }, 100);
});
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    animation: fade 0.5s;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;
    .swiper-slide {
      height: 100%;
    }
    .swiper-pagination {
      margin-top: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 20px;
        height: 4px;
        margin: 0 4px;
        border-radius: 4px;
        opacity: 0.2;
        transition: opacity 0.3s;
        &.swiper-pagination-bullet-active {
          opacity: 1;
        }
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  .link-all {
    height: 220px;
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      padding: 0 10px;
      animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }

      &:active {
        transform: scale(1);
      }

      .name {
        font-size: 1.1rem;
        margin-left: 8px;
      }
      @media (min-width: 720px) and (max-width: 820px) {
        .name {
          display: none;
        }
      }
      @media (max-width: 720px) {
        height: 80px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        .name {
          font-size: 1rem;
          margin-left: 0;
          margin-top: 8px;
        }
      }
    }
    @media (max-width: 720px) {
      height: 180px;
    }
  }
}
</style>
