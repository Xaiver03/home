<script setup>
import {
  LinkOutlined,
  MenuOutlined,
  ReadOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { MdCatalog } from 'md-editor-v3'

const router = useRouter()
const route = useRoute()
const toTopRef = ref(null)
const mdCatalogShow = ref(false)
const catalogToolShow = ref(false)
let catalogObserver

const toTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toTopShow = () => {
  if (!toTopRef.value) return
  const visible = document.body.scrollTop > 700 || document.documentElement.scrollTop > 700
  toTopRef.value.style.height = visible ? '7rem' : '0px'
  toTopRef.value.style.border = visible ? 'auto' : 'none'
}

const randomArticle = () => {
  notification.open({
    message: '📌提示',
    description: '正在开往其他随机文章🎲',
    placement: 'top',
    duration: 3,
  })
  api.getRandomArticleId(route.params.id).then((res) => {
    router.push(`/log/article/detail/${res.id}`)
  })
}

const laterFriendLinkId = ref(null)
const randomFriend = () => {
  notification.open({
    message: '📌提示',
    description: '正在开往其他友链🎰',
    placement: 'top',
    duration: 3,
  })
  api.getRandomFriendLink(laterFriendLinkId.value).then((res) => {
    laterFriendLinkId.value = res.id
    window.open(res.url, '_blank')
  })
}

const refreshCatalogVisibility = async () => {
  await nextTick()
  const isArticlePage = /^\/log\/article\/.*/.test(router.currentRoute.value.path)
  const hasCatalog = document.querySelectorAll(
    '#preview h1, #preview h2, #preview h3, #preview h4, #preview h5, #preview h6',
  ).length > 0
  catalogToolShow.value = isArticlePage && hasCatalog
}

watch(() => router.currentRoute.value.path, refreshCatalogVisibility, { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', toTopShow)
  catalogObserver = new MutationObserver(refreshCatalogVisibility)
  catalogObserver.observe(document.body, { childList: true, subtree: true })
  refreshCatalogVisibility()
})

onUnmounted(() => {
  window.removeEventListener('scroll', toTopShow)
  catalogObserver?.disconnect()
})
</script>

<template>
  <div id="flexed-tool" class="fixed bottom-24 right-16">
    <a-space size="middle" class="flex flex-col">
      <button
        v-if="catalogToolShow"
        class="tool-item"
        title="目录"
        type="button"
        @click="mdCatalogShow = true"
      >
        <MenuOutlined />
      </button>
      <button class="tool-item" title="随便看看" type="button" @click="randomArticle">
        <ReadOutlined />
      </button>
      <button class="tool-item" title="开往友链" type="button" @click="randomFriend">
        <LinkOutlined />
      </button>
      <button ref="toTopRef" class="tool-item" title="回到顶部" type="button" @click="toTop">
        <VerticalAlignTopOutlined />
      </button>
    </a-space>
    <a-drawer
      v-model:open="mdCatalogShow"
      class="article-catalog-bar"
      title="🔖目录"
      placement="left"
    >
      <MdCatalog
        v-if="mdCatalogShow"
        editorId="preview"
        scrollElement="html"
        :scrollElementOffsetTop="96"
      />
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
#flexed-tool {
  .tool-item {
    align-items: center;
    appearance: none;
    background-color: $main-car-color;
    border: 0.3px solid $main-background-color;
    border-radius: 50%;
    color: $main-text-color;
    cursor: $hover-cursor;
    display: inline-flex;
    font-size: 2.4rem;
    height: 7rem;
    justify-content: center;
    overflow: hidden;
    transition: all 0.5s;
    width: 7rem;

    &:hover {
      color: $main-color;
    }
  }
}
</style>

<style lang="scss">
.article-catalog-bar {
  background: $main-background-color !important;
  color: $main-text-color;

  .ant-drawer-header {
    .ant-drawer-close,
    .ant-drawer-title {
      color: $main-text-color;
    }
  }
}
</style>
