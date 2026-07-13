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
          icon: '时间',
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
const candidateImageSrc = computed(() => {
  if (props.imagePath) return props.imagePath;
  if (!props.data?.id) return null;
  return `${config.public.ossUrl}/image/articleCover/${props.data.id}.png`;
});
const imageStatus = ref('missing');
let imageProbeId = 0;
const probeImage = () => {
  const src = candidateImageSrc.value;
  imageProbeId += 1;
  const currentProbeId = imageProbeId;
  if (!src || import.meta.server) {
    imageStatus.value = 'missing';
    return;
  }

  imageStatus.value = 'loading';
  const image = new Image();
  image.onload = () => {
    if (currentProbeId === imageProbeId) {
      imageStatus.value = 'loaded';
    }
  };
  image.onerror = () => {
    if (currentProbeId === imageProbeId) {
      imageStatus.value = 'missing';
    }
  };
  image.src = src;
};
const showImage = computed(() => imageStatus.value === 'loaded');
// 手机端自动横向展示
let phoneOrNot = ref(false);
watch(candidateImageSrc, probeImage, { immediate: true });
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
  <article
    class="article-card"
    :class="{
      column: props.column || phoneOrNot,
      'with-image': showImage,
      'text-only': !showImage,
    }"
  >
    <div v-if="showImage" id="pic-box">
      <img :src="candidateImageSrc" alt="文章封面" loading="lazy" decoding="async" />
    </div>
    <div id="info">
      <div>
        <h3 class="limit-text-2 card-title">{{ props.data[props.dataOption.mainAttribute] }}</h3>
        <p class="limit-text-2 card-desc">{{ props.data[props.dataOption.secondAttribute] }}</p>
      </div>
      <div class="card-meta">
        <span>{{ props.dataOption.additional.icon }}</span>
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
  grid-template-columns: minmax(0, 1fr);
  min-height: 21rem;
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

    img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: inherit;
      object-fit: cover;
      transition: transform 300ms ease;
    }
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
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.8rem;
      color: $secondary-text-color;
      font-size: 1.3rem;
      font-weight: 700;
      text-align: right;

      span {
        color: rgba(38, 51, 44, 0.54);
        font-size: 1.15rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
    }

    .limit-text-2 {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &.with-image {
    grid-template-columns: minmax(18rem, 0.95fr) minmax(0, 1.25fr);

    &:hover #pic-box img {
      transform: scale(1.035);
    }
  }

  &.text-only {
    min-height: 20rem;

    #info {
      min-height: 20rem;
      padding: clamp(2.4rem, 4vw, 4.8rem);
    }

    .card-title {
      max-width: 17ch;
      font-size: clamp(2.5rem, 4vw, 4.4rem);
    }

    .card-desc {
      max-width: 62ch;
      -webkit-line-clamp: 3;
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

    &.text-only {
      min-height: 18rem;

      #info {
        min-height: 18rem;
      }

      .card-title {
        max-width: none;
        font-size: clamp(2.2rem, 8vw, 3.4rem);
      }
    }
  }
}
</style>
