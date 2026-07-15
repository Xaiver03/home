<template>
  <!-- 基本信息 -->
  <div class="message">
    <!-- Logo -->
    <div class="logo">
      <img class="logo-img" :src="siteLogo" alt="logo" />
      <div :class="{ name: true, 'text-hidden': true, long: siteUrl[0].length >= 6 }">
        <span class="bg">{{ siteUrl[0] }}</span>
        <span class="sm">.{{ siteUrl[1] }}</span>
      </div>
    </div>
    <!-- 简介 -->
    <div class="description cards" @click="changeBox">
      <div class="content">
        <Icon size="16">
          <QuoteLeft />
        </Icon>
        <Transition name="fade" mode="out-in">
          <div :key="descriptionText.hello + descriptionText.text" class="text">
            <p>{{ descriptionText.hello }}</p>
            <p>{{ descriptionText.text }}</p>
          </div>
        </Transition>
        <Icon size="16">
          <QuoteRight />
        </Icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { QuoteLeft, QuoteRight } from "@vicons/fa";
import { Error } from "@icon-park/vue-next";
import { getGlobalConfig } from "@/api";
import { mainStore } from "@/store";

const store = mainStore();

// 站点配置数据
const siteLogo = ref(import.meta.env.VITE_SITE_MAIN_LOGO);
const siteUrl = ref(['晓黎团队', '']);

// 简介区域文字
const descriptionText = reactive({
  hello: import.meta.env.VITE_DESC_HELLO,
  text: import.meta.env.VITE_DESC_TEXT,
});

// 备用文字（用于彩蛋）
const alternateText = reactive({
  hello: import.meta.env.VITE_DESC_HELLO_OTHER,
  text: import.meta.env.VITE_DESC_TEXT_OTHER,
});

// 初始化配置
const initConfig = async () => {
  try {
    const configData = await getGlobalConfig();

    // 优先使用API配置，降级到环境变量
    if (configData && configData['home-texts']) {
      const homeTexts = configData['home-texts'].content || {};

      // 站点URL
      const apiSiteUrl = homeTexts.siteUrl || import.meta.env.VITE_SITE_URL;
      if (apiSiteUrl) {
        let urlFormat = apiSiteUrl;
        if (urlFormat.startsWith("http://") || urlFormat.startsWith("https://")) {
          urlFormat = urlFormat.replace(/^(https?:\/\/)/, "");
        }
        siteUrl.value = urlFormat.split(".");
      }

      // 问候语和描述
      descriptionText.hello = homeTexts.helloText || import.meta.env.VITE_DESC_HELLO;
      descriptionText.text = homeTexts.descText || import.meta.env.VITE_DESC_TEXT;
      alternateText.hello = homeTexts.helloOther || import.meta.env.VITE_DESC_HELLO_OTHER;
      alternateText.text = homeTexts.descTextOther || import.meta.env.VITE_DESC_TEXT_OTHER;

      // 站点Logo
      if (homeTexts.siteLogo) {
        siteLogo.value = homeTexts.siteLogo;
      }
    } else {
      // 完全降级到环境变量
      const url = import.meta.env.VITE_SITE_URL;
      if (url) {
        let urlFormat = url;
        if (urlFormat.startsWith("http://") || urlFormat.startsWith("https://")) {
          urlFormat = urlFormat.replace(/^(https?:\/\/)/, "");
        }
        siteUrl.value = urlFormat.split(".");
      }
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT;
      alternateText.hello = import.meta.env.VITE_DESC_HELLO_OTHER;
      alternateText.text = import.meta.env.VITE_DESC_TEXT_OTHER;
    }
  } catch (error) {
    console.warn('配置加载失败，使用环境变量:', error);
    // 错误处理：使用环境变量
    const url = import.meta.env.VITE_SITE_URL;
    if (url) {
      let urlFormat = url;
      if (urlFormat.startsWith("http://") || urlFormat.startsWith("https://")) {
        urlFormat = urlFormat.replace(/^(https?:\/\/)/, "");
      }
      siteUrl.value = urlFormat.split(".");
    }
  }
};

// 切换右侧功能区
const changeBox = () => {
  if (store.getInnerWidth >= 721) {
    store.boxOpenState = !store.boxOpenState;
  } else {
    ElMessage({
      message: "当前页面宽度不足以开启盒子",
      grouping: true,
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  }
};

// 监听状态变化
watch(
  () => store.boxOpenState,
  (value) => {
    if (value) {
      descriptionText.hello = alternateText.hello;
      descriptionText.text = alternateText.text;
    } else {
      // 恢复到API配置的原始文字
      initConfig().then(() => {
        // 配置重新加载后，如果仍处于非激活状态，确保显示正确的文字
        if (!store.boxOpenState) {
          // 文字已在initConfig中设置
        }
      });
    }
  },
);

// 页面加载时初始化配置
onMounted(() => {
  initConfig();
});
</script>

<style lang="scss" scoped>
.message {
  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    animation: fade 0.5s;
    max-width: 460px;
    .logo-img {
      border-radius: 50%;
      width: 120px;
    }
    .name {
      width: 100%;
      padding-left: 22px;
      transform: translateY(-8px);
      font-family: "Pacifico-Regular";

      .bg {
        font-size: 5rem;
      }

      .sm {
        margin-left: 6px;
        font-size: 2rem;
        @media (min-width: 721px) and (max-width: 789px) {
          display: none;
        }
      }
    }
    @media (max-width: 768px) {
      .logo-img {
        width: 100px;
      }
      .name {
        height: 128px;
        .bg {
          font-size: 4.5rem;
        }
      }
    }

    @media (max-width: 720px) {
      max-width: 100%;
    }
  }

  .description {
    padding: 1rem;
    margin-top: 3.5rem;
    max-width: 460px;
    animation: fade 0.5s;

    .content {
      display: flex;
      justify-content: space-between;

      .text {
        margin: 0.75rem 1rem;
        line-height: 2rem;
        margin-right: auto;
        transition: opacity 0.2s;

        p {
          &:nth-of-type(1) {
            font-family: "Pacifico-Regular";
          }
        }
      }

      .xicon:nth-of-type(2) {
        align-self: flex-end;
      }
    }
    @media (max-width: 720px) {
      max-width: 100%;
      pointer-events: none;
    }
  }
  // @media (max-width: 390px) {
  //   .logo {
  //     flex-direction: column;
  //     .logo-img {
  //       display: none;
  //     }
  //     .name {
  //       margin-left: 0;
  //       height: auto;
  //       transform: none;
  //       text-align: center;
  //       .bg {
  //         font-size: 3.5rem;
  //       }
  //       .sm {
  //         font-size: 1.4rem;
  //       }
  //     }
  //   }
  //   .description {
  //     margin-top: 2.5rem;
  //   }
  // }
}
</style>
