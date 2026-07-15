<template>
  <!-- 社交链接 -->
  <div class="social">
    <div class="link">
      <a
        v-for="item in socialLinks"
        :key="item.name"
        :href="item.url === '#wechat-qr' ? undefined : item.url"
        target="_blank"
        @click.prevent="item.url === '#wechat-qr' ? showWechatQr = true : null"
        @mouseenter="socialTip = item.tip"
        @mouseleave="socialTip = '通过这里联系团队'"
      >
        <img class="icon" :src="item.icon" height="24" />
      </a>
    </div>
    <span class="tip">{{ socialTip }}</span>

    <!-- 公众号二维码弹窗 -->
    <el-dialog v-model="showWechatQr" title="关注公众号" width="320px" :align-center="true" destroy-on-close>
      <div style="text-align:center">
        <img :src="'/uploads/wechat-qr.jpg'" alt="公众号二维码" style="width:240px;height:240px;border-radius:8px" />
        <p style="margin-top:12px;color:#888;font-size:13px">扫码关注「晓黎团队」</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import socialLinksDefault from "@/assets/socialLinks.json";
import { getGlobalConfig } from "@/api";

// 响应式数据 - 初始化为默认数据，确保组件始终有内容显示
const socialLinks = ref([...socialLinksDefault]);
const socialTip = ref('通过这里联系团队');
const showWechatQr = ref(false);

// 加载社交链接配置
const loadSocialLinks = async () => {
  try {
    const config = await getGlobalConfig();
    if (config && config['social-links'] && config['social-links'].content && Array.isArray(config['social-links'].content)) {
      socialLinks.value = config['social-links'].content;
      console.log('✅ 社交链接：使用后端API配置');
    } else {
      console.log('📄 社交链接：API无数据，保持默认配置');
    }
  } catch (error) {
    console.warn('⚠️ 社交链接：API获取失败，保持默认配置', error?.message || error);
  }
};

// 异步加载配置，但不阻塞组件渲染
onMounted(() => {
  // 使用 setTimeout 确保组件已经渲染，然后再尝试加载配置
  setTimeout(() => {
    loadSocialLinks().catch(err => {
      console.warn('社交链接配置加载失败，使用默认配置:', err);
    });
  }, 100);
});
</script>

<style lang="scss" scoped>
.social {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 460px;
  width: 100%;
  height: 42px;
  background-color: transparent;
  border-radius: 6px;
  backdrop-filter: blur(0);
  animation: fade 0.5s;
  transition:
    background-color 0.3s,
    backdrop-filter 0.3s;
  @media (max-width: 840px) {
    max-width: 100%;
    justify-content: center;
    .link {
      justify-content: space-evenly !important;
      width: 90%;
    }
    .tip {
      display: none !important;
    }
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    a {
      display: inherit;
      .icon {
        margin: 0 12px;
        transition: transform 0.3s;
        &:hover {
          transform: scale(1.1);
        }
        &:active {
          transform: scale(1);
        }
      }
    }
  }
  .tip {
    display: none;
    margin-right: 12px;
    animation: fade 0.5s;
  }
  @media (min-width: 768px) {
    &:hover {
      background-color: #00000040;
      backdrop-filter: blur(5px);
      .tip {
        display: block;
      }
    }
  }
}
</style>
