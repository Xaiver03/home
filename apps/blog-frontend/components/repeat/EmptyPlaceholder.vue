<script setup>
import { computed, useSlots } from 'vue';
const slots = useSlots();
const hasEmptyIcon = computed(() => !!slots.emptyIcon);
const hasLoadingIcon = computed(() => !!slots.loadingIcon);
const props = defineProps({
  dataReady: {
    type: Boolean,
    default: false,
  },
  dataShow: {
    type: Boolean,
    default: true,
  },
  emptyText: {
    type: String,
    default: '暂时没有内容🙌',
  },
  loadingText: {
    type: String,
    default: '内容正在加载中，请稍后',
  },
});
</script>

<template>
  <div id="empty-state-box">
    <div v-if="dataShow">
      <slot></slot>
    </div>
    <div v-else-if="dataReady" class="empty-panel blog-glass-panel">
      <div class="flex flex-col">
        <template v-if="!hasEmptyIcon">
          <InboxOutlined class="state-icon flex justify-center" />
        </template>
        <slot v-else name="emptyIcon"></slot>
        <p>{{ props.emptyText }}</p>
      </div>
    </div>
    <div id="loading" class="blog-glass-panel" v-else>
      <template v-if="!hasLoadingIcon">
        <span class="iconfont icon-diqiu"></span>
      </template>
      <slot v-else name="loadingIcon"></slot>
      <p>{{ props.loadingText }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#empty-state-box {
  .empty-panel,
  #loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 24rem;
    padding: 5rem 2rem;
    color: $secondary-text-color;
    text-align: center;
  }

  .iconfont {
    font-size: 5rem;
  }

  .state-icon {
    font-size: 5rem;
    margin-bottom: 1.4rem;
  }

  p {
    margin: 1.4rem 0 0;
    font-size: 1.6rem;
    line-height: 1.7;
  }

  #loading {
    flex-direction: column;

    span {
      animation: rotateAnimation 2s linear infinite;
    }

    p {
      animation: gradientAnimation 2s linear infinite;
    }
  }
}

// loading旋转动画
@keyframes rotateAnimation {
  0% {
    transform: rotate(0deg);
    opacity: 0.3;
  }

  50% {
    transform: rotate(180deg);
    opacity: 1;
  }

  100% {
    transform: rotate(360deg);
    opacity: 0.3;
  }
}

// loading渐变动画
@keyframes gradientAnimation {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.3;
  }
}
</style>
