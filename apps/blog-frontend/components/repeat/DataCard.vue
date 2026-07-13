<script setup>
const config = useRuntimeConfig();
const store = useNuxtStore();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  }, // 文章数据
  column: {
    type: Boolean,
    default: false,
  }, // 是否纵列
  dataOption: {
    type: Object,
    default: () => {
      return {
        mainAttribute: 'topic',
        secondAttribute: 'introduction',
        additional: {
          icon: '🕘',
          attribute: 'createTime',
        },
      };
    },
  }, // 数据选项，用于配置展示内容在数据中对应的字段，默认是按文章的配置，传入数据需对应字段！
  imagePath: {
    type: String,
    default: null,
  }, // 图片路径，默认是 ${config.public.ossUrl}/image/articleCover/${props.articleData.id}.png
});
// 手机端自动横向展示
let phoneOrNot = ref(false);
watch(
  () => store.$state.windowSize.width,
  (newVal) => {
    if (newVal < 768) {
      phoneOrNot.value = true;
    } else {
      phoneOrNot.value = false;
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <article class="article-card" :class="{ column: props.column || phoneOrNot }">
    <div id="pic-box">
      <client-only>
        <a-image
          :src="
            props.imagePath
              ? props.imagePath
              : `${config.public.ossUrl}/image/articleCover/${props.data.id}.png`
          "
          alt="文章封面"
          :preview="false"
          style="height: 100%; width: 100%; object-fit: cover"
          :fallback="store.$state.config['not-found-image']?.content"
        ></a-image>
      </client-only>
    </div>
    <div id="info">
      <div>
        <h3 class="limit-text-2 card-title">{{ props.data[props.dataOption.mainAttribute] }}</h3>
        <p class="limit-text-2 card-desc">{{ props.data[props.dataOption.secondAttribute] }}</p>
      </div>
      <div class="card-meta">
        {{ props.dataOption.additional.icon }}
        {{
          String(props.dataOption.additional.attribute).toLowerCase().includes('time') ||
          String(props.dataOption.additional.attribute).toLowerCase().includes('date')
            ? utils.formatDate(props.data[props.dataOption.additional.attribute])
            : props.data[props.dataOption.additional.attribute]
        }}
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.article-card {
  display: grid;
  grid-template-columns: minmax(18rem, 0.95fr) minmax(0, 1.25fr);
  min-height: 23rem;
  overflow: hidden;
  background: rgba(246, 247, 241, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 8px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 22px 64px rgba(23, 32, 29, 0.1);
  backdrop-filter: blur(20px) saturate(165%);
  cursor: $hover-cursor;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    background 220ms ease;

  &:hover {
    transform: translateY(-4px) !important;
    background: rgba(255, 255, 255, 0.82);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      0 28px 90px rgba(23, 32, 29, 0.14);
  }

  &:active {
    transform: scale(0.99) !important;
  }

  #pic-box {
    overflow: hidden;
    min-height: 18rem;
    background: $secondary-car-color;
  }

  #info {
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2.4rem;
    padding: clamp(2rem, 4vw, 4.2rem);

    .card-title {
      margin: 0;
      color: $main-text-color;
      font-size: clamp(2.2rem, 3vw, 3.5rem);
      line-height: 1.12;
      font-weight: 820;
      letter-spacing: -0.01em;
      text-wrap: balance;
    }

    .card-desc {
      margin: 1.4rem 0 0;
      color: $secondary-text-color;
      font-size: 1.55rem;
      line-height: 1.7;
    }

    .card-meta {
      color: $secondary-text-color;
      font-size: 1.3rem;
      font-weight: 700;
      text-align: right;
    }

    .limit-text-2 {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &.column {
    grid-template-columns: 1fr;
    min-height: 36rem;

    #pic-box {
      min-height: 18rem;
    }

    #info {
      min-height: 18rem;
      padding: 2.4rem;
    }
  }
}

:deep(.ant-image) {
  height: 100%;
  width: 100%;
}

@media (max-width: 768px) {
  .article-card {
    grid-template-columns: 1fr;
    min-height: auto;

    #pic-box {
      min-height: 18rem;
    }

    #info {
      padding: 2.2rem;
    }
  }
}
</style>
