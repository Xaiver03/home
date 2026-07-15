<template>
  <footer id="footer" :class="store.footerBlur ? 'blur' : null">
    <Transition name="fade" mode="out-in">
      <div v-if="!store.playerState || !store.playerLrcShow" class="power">
        <span>
          <span :class="startYear < fullYear ? 'c-hidden' : 'hidden'">Copyright&nbsp;</span>
          &copy;
          <span v-if="startYear < fullYear"
            class="site-start">
            {{ startYear }}
            -
          </span>
          {{ fullYear }}
          <a :href="siteUrl">{{ siteAuthor }}</a>
        </span>
        <!-- 以下信息请不要修改哦 -->
        <span class="hidden">
          &amp;&nbsp;Made&nbsp;by
          <a :href="config.github" target="_blank">
            {{ config.author }}
          </a>
        </span>
        <!-- 站点备案 -->
        <span>
          &amp;
          <a v-if="siteIcp" href="https://beian.miit.gov.cn" target="_blank">
            {{ siteIcp }}
          </a>
        </span>
      </div>
      <div v-else class="lrc">
        <Transition name="fade" mode="out-in">
          <div class="lrc-all" :key="store.getPlayerLrc">
            <music-one theme="filled" size="18" fill="#efefef" />
            <span class="lrc-text text-hidden" v-html="store.getPlayerLrc" />
            <music-one theme="filled" size="18" fill="#efefef" />
          </div>
        </Transition>
      </div>
    </Transition>
  </footer>
</template>

<script setup>
import { MusicOne } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { getGlobalConfig } from "@/api";
import config from "@/../package.json";

const store = mainStore();
const fullYear = new Date().getFullYear();

// 从API获取配置数据
const siteConfig = ref({});
const startYear = ref(null);
const siteIcp = ref(null);
const siteAuthor = ref(null);
const siteUrl = ref('/');

// 初始化配置
const initConfig = async () => {
  try {
    const configData = await getGlobalConfig();

    // 优先使用API配置，降级到环境变量
    if (configData && configData['home-texts']) {
      const homeTexts = configData['home-texts'].content || {};
      siteIcp.value = homeTexts.siteIcp || import.meta.env.VITE_SITE_ICP;
      siteAuthor.value = homeTexts.siteAuthor || import.meta.env.VITE_SITE_AUTHOR;
      const siteStart = homeTexts.siteStart || import.meta.env.VITE_SITE_START;
      if (siteStart?.length >= 4) {
        startYear.value = siteStart.substring(0, 4);
      }
      const siteUrlFromApi = homeTexts.siteUrl || import.meta.env.VITE_SITE_URL;
      if (siteUrlFromApi) {
        if (!siteUrlFromApi.startsWith("http://") && !siteUrlFromApi.startsWith("https://")) {
          siteUrl.value = "//" + siteUrlFromApi;
        } else {
          siteUrl.value = siteUrlFromApi;
        }
      }
    } else {
      // 降级到环境变量
      siteIcp.value = import.meta.env.VITE_SITE_ICP;
      siteAuthor.value = import.meta.env.VITE_SITE_AUTHOR;
      const siteStart = import.meta.env.VITE_SITE_START;
      if (siteStart?.length >= 4) {
        startYear.value = siteStart.substring(0, 4);
      }
      const url = import.meta.env.VITE_SITE_URL;
      if (url) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          siteUrl.value = "//" + url;
        } else {
          siteUrl.value = url;
        }
      }
    }
  } catch (error) {
    console.warn('配置加载失败，使用环境变量:', error);
    // 完全降级到环境变量
    siteIcp.value = import.meta.env.VITE_SITE_ICP;
    siteAuthor.value = import.meta.env.VITE_SITE_AUTHOR;
    const siteStart = import.meta.env.VITE_SITE_START;
    if (siteStart?.length >= 4) {
      startYear.value = siteStart.substring(0, 4);
    }
    const url = import.meta.env.VITE_SITE_URL;
    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        siteUrl.value = "//" + url;
      } else {
        siteUrl.value = url;
      }
    }
  }
};

// 页面加载时初始化配置
onMounted(() => {
  initConfig();
});
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 46px;
  line-height: 46px;
  text-align: center;
  z-index: 0;
  font-size: 14px;
  // 文字不换行
  word-break: keep-all;
  white-space: nowrap;
  .power {
    animation: fade 0.3s;
  }
  .lrc {
    padding: 0 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .lrc-all {
      width: 98%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .lrc-text {
        margin: 0 8px;
      }
      .i-icon {
        width: 18px;
        height: 18px;
        display: inherit;
      }
    }
  }
  &.blur {
    backdrop-filter: blur(10px);
    background: rgb(0 0 0 / 25%);
    font-size: 16px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease-in-out;
  }
  @media (max-width: 720px) {
    font-size: 0.9rem;
    &.blur {
      font-size: 0.9rem;
    }
  }
  @media (max-width: 560px) {
    .c-hidden {
      display: none;
    }
  }
  @media (max-width: 480px) {
    .hidden {
      display: none;
    }
  }
}
</style>
