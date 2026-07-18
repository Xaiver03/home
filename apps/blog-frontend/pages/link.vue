<script setup>
const store = useNuxtStore();
definePageMeta({
  layout: 'classics',
});
// 服务端 - 获取友链数据
const { data: linkData, error: getLinkDataError } = await useAsyncData(
  'getLinkData',
  async () =>
    await api.getAllFriendLink().then((res) => {
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1)); // 生成随机索引
          [array[i], array[j]] = [array[j], array[i]]; // 交换元素
        }
        return array;
      };
      return {
        active: shuffleArray(res.rows.filter((item) => item.status == 'active')),
        inactive: shuffleArray(res.rows.filter((item) => item.status == 'inactive')),
      };
    }),
);
let collapseInactiveKey = ref([]);
let friendMsg = reactive({}); // 朋友信息
let addFriendLinkShow = ref(false);
const submitFriendMsg = () => {
  // 提交朋友信息
  api.submitFriendLink(friendMsg).then((res) => {
    utils.analysisData(res);
  });
};
</script>

<template>
  <main id="link-page" class="content-box blog-page-shell">
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Friends</span>
        <h1>朋友们</h1>
      </div>
      <p>从这里通向其他仍在认真写作、创造和维护个人空间的人。</p>
    </header>
    <section class="card blog-glass-panel" v-motion-fade-visible-once>
      <div class="card-header">
        <div>
          <div class="card-title">友链</div>
          <p>从这里通向其他的世界</p>
        </div>
        <button class="blog-action" type="button" @click="addFriendLinkShow = true">
          申请友链 <span aria-hidden="true">→</span>
        </button>
      </div>
      <RepeatEmptyPlaceholder
        :dataReady="Boolean(linkData)"
        :dataShow="linkData?.active?.length > 0"
      >
        <div class="active-box">
          <div v-for="item in linkData?.active" :key="item.id + 'activeLink'">
            <nuxt-link :to="item.url" target="_blank">
              <div class="active-item">
                <client-only>
                  <a-avatar :src="item.coverLink" :alt="item.id + '头像'" :size="64">
                    <template #icon>
                      <UserOutlined class="flex justify-center items-center w-full h-full" />
                    </template>
                  </a-avatar>
                </client-only>
                <div class="link-copy">
                  <h3>{{ item.friendName }}</h3>
                  <span class="text-truncation text-lg">{{ item.description }}</span>
                </div>
                <img
                  class="friend-img"
                  :src="item.coverLink"
                  onerror="this.style.display = 'none'"
                />
              </div>
            </nuxt-link>
          </div>
        </div>
      </RepeatEmptyPlaceholder>
      <div class="p-4">
        <a-alert class="my-4 w-full" message="友链申请说明" type="info" show-icon>
          <template #description>
            <p class="py-1">🔒 请确保全站使用https</p>
            <p class="py-1">在友链中添加了灯下灯</p>
            <p class="py-1">🔖 原创的博客内容</p>
          </template>
          <template #icon>
            <PushpinOutlined />
          </template>
        </a-alert>
      </div>
    </section>
    <section class="card blog-glass-panel" v-motion-fade-visible-once>
      <div class="card-title">失效友链</div>
      <a-collapse v-model:activeKey="collapseInactiveKey" ghost>
        <a-collapse-panel key="1" header="这些友链已经失效，如果恢复了请留言联系我⚠️">
          <div class="active-box">
            <div v-for="item in linkData?.inactive" :key="item.id + 'activeLink'">
              <div class="cursor-default active-item">
                <client-only>
                  <a-avatar :src="item.coverLink" :alt="item.id + '头像'" :size="64">
                    <template #icon>
                      <UserOutlined class="flex justify-center items-center w-full h-full" />
                    </template>
                  </a-avatar>
                </client-only>
                <div class="link-copy">
                  <h3>{{ item.friendName }}</h3>
                  <span class="text-truncation text-lg">{{ item.description }}</span>
                </div>
                <img
                  class="friend-img"
                  :src="item.coverLink"
                  onerror="this.style.display = 'none'"
                />
              </div>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </section>
    <a-modal
      v-model:open="addFriendLinkShow"
      title="添加友链🌐"
      width="700px"
      @ok="submitFriendMsg"
      cancelText="取消"
      okText="提交"
    >
      <div class="friend-input-box rounded p-4 flex flex-col items-center my-4 m-auto">
        <p class="pl-4 py-4">欢迎各位博主添加友链</p>
        <div class="md:columns-2 lg:columns-3 w-full">
          <div class="flex flex-col overflow-hidden">
            <div class="flex flex-col py-4">
              <span>名称</span>
              <a-input v-model:value="friendMsg.friendName" placeholder="请输入您的名称"></a-input>
            </div>
          </div>
          <div class="flex flex-col overflow-hidden">
            <div class="flex flex-col py-4">
              <span>网站链接</span>
              <a-input v-model:value="friendMsg.url" placeholder="请输入您的网站链接"></a-input>
            </div>
          </div>
          <div class="flex flex-col overflow-hidden">
            <div class="flex flex-col py-4">
              <span>头像链接</span>
              <a-input
                v-model:value="friendMsg.coverLink"
                placeholder="请输入您的头像链接"
              ></a-input>
            </div>
          </div>
        </div>
        <div class="columns-1 w-full">
          <div class="flex flex-col py-4">
            <span>描述</span>
            <a-textarea
              v-model:value="friendMsg.description"
              placeholder="请输入您的描述"
              :rows="2"
            />
          </div>
        </div>
        <a-alert class="my-4 w-full" message="我的网站信息" type="info" show-icon>
          <template #description>
            <p class="py-1">名称：灯下灯</p>
            <p class="py-1">简介：留下自己的痕迹</p>
            <p class="py-1">🔗链接：https://bokey.space/</p>
            <p class="py-1">📌头像：{{ store.$state.config['my-avatar']?.content || '未设置' }}</p>
          </template>
          <template #icon>
            <ApiOutlined />
          </template>
        </a-alert>
      </div>
    </a-modal>
  </main>
</template>

<style lang="scss" scoped>
#link-page {
  .card {
    padding: 2.4rem;
    color: $main-text-color;

    .card-title {
      font-size: clamp(2.2rem, 3vw, 3.4rem);
      line-height: 1.15;
      font-weight: 600;
      letter-spacing: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1.6rem;
    margin-bottom: 2rem;

    p {
      margin-top: 0.8rem;
      color: $secondary-text-color;
      font-size: 1.45rem;
      line-height: 1.75;
    }
  }

  .active-box {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.2rem;

    .active-item {
      position: relative;
      display: flex;
      gap: 1.4rem;
      min-height: 10rem;
      padding: 1.8rem;
      overflow: hidden;
      border: 1px solid $surface-border;
      border-radius: 8px;
      background: $surface-control;
      cursor: $hover-cursor;
      transition:
        transform 180ms ease,
        background 180ms ease;

      &:hover {
        transform: translateY(-2px);
        background: $surface-hover;
      }

      h3 {
        margin: 0;
        font-size: 1.7rem;
        font-weight: 600;
      }

      *:not(.img) {
        z-index: 5;
      }

      .friend-img {
        position: absolute;
        top: 50%;
        right: 0;
        z-index: 1;
        opacity: 0.7;
        transform: translateY(-50%) translateX(20%);
        mask-image: linear-gradient(
          to right,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.6) 90%,
          rgba(0, 0, 0, 1) 100%
        );
        -webkit-mask-image: linear-gradient(
          to right,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.6) 90%,
          rgba(0, 0, 0, 1) 100%
        );
      }

      .link-copy {
        min-width: 0;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: center;
      }

      .text-truncation {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        /* 显示2行 */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 1.4rem;
        line-height: 1.65;
      }
    }
  }

  @media (max-width: 900px) {
    .active-box {
      grid-template-columns: 1fr;
    }

    .card-header {
      display: grid;
    }
  }
}
</style>
