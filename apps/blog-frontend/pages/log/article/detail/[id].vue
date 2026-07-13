<script setup>
import { computed } from 'vue';
const router = useRouter();
const store = useNuxtStore();
const config = useRuntimeConfig();
const route = useRoute();
const articleAuthor = computed(() => store.$state.config['article-author']?.content || '邓湘雷');

definePageMeta({
  layout: 'classics',
});

// 获取文章数据以及文章内容
const { data: articleData, error: articleError } = await useAsyncData(
  'getArticleDetail',
  async () => {
    const id = route.params.id;
    return await api.getArticleContentById(id).then((res) => {
      if (res && res.code === 200) {
        return {
          mdContent: res.data.content,
          ...res.data.article,
        };
      }
      return null;
    });
  },
);
useHead({
  title: `${articleData.value?.topic} 【 邓湘雷的博客 】`,
  meta: [
    {
      name: 'description',
      content: articleData.value?.introduction,
    },
  ],
});
const getArticleType = (typeId) => {
  // 获取文章类别数据
  if (!typeId || !articleData.value) return;
  api.getArticleTypeById(typeId).then((res) => {
    if (articleData.value) {
      articleData.value.typeTheme = res?.theme || '';
    }
  });
};
watch(
  () => articleData.value?.typeId,
  (typeId) => {
    // 监听文章类目变化
    getArticleType(typeId);
    if (import.meta.client && window) {
      window.scrollTo(0, 0); // 滚动到页面顶部
    }
  },
  {
    immediate: true,
  },
);
const headerTopicRef = ref(null);
const headerIntroductionRef = ref(null);
const showIntroductionOrNot = (showOrNot) => {
  // 控制文章标题和简介的显示/隐藏
  if (showOrNot) {
    headerTopicRef.value.style.opacity = '0';
    headerTopicRef.value.style.height = '0';
    headerTopicRef.value.classList.remove('flex-auto');
    headerTopicRef.value.classList.add('flex-none');
    headerIntroductionRef.value.style.opacity = '1';
    headerIntroductionRef.value.classList.remove('flex-none');
    headerIntroductionRef.value.classList.add('flex-auto');
  } else {
    headerTopicRef.value.style.opacity = '1';
    headerTopicRef.value.classList.remove('flex-none');
    headerTopicRef.value.classList.add('flex-auto');
    headerIntroductionRef.value.style.opacity = '0';
    headerIntroductionRef.value.classList.remove('flex-auto');
    headerIntroductionRef.value.classList.add('flex-none');
  }
};

// #region 版权模块
const statementData = ref([
  {
    name: '发布于',
    attribute: 'createTime',
    time: true,
  },
  {
    name: '更新于',
    attribute: 'updatedTime',
    time: true,
  },
  {
    name: '类目',
    attribute: 'typeTheme',
  },
]);
const goTo = (url, $event) => {
  // 跳转到其他网站
  $event.stopPropagation();
  window.open(url, '_blank');
};
// #endregion

// #region 操作模块
const like = ref(false); // 标记是否喜欢
const likeEvent = () => {
  // 喜欢文章事件
  api.likeArticleById(articleData.value.id).then((res) => {
    if (utils.analysisData(res)) {
      like.value = true;
      articleData.value.like += 1;
    }
  });
};
const shareEvent = () => {
  // 分享文章url事件
  const url = window.location.href;
  const prompt = () => {
    // 提示成功函数
    notification.open({
      message: '🔗复制连接成功',
      description: '分享给小伙伴，但请务必尊重本文的版权协议。',
      placement: 'top',
      duration: 3,
    });
  };
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        prompt();
      })
      .catch((err) => {
        console.error('复制失败:', err);
      });
  } else {
    // 处理不支持 clipboard API 的情况
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      prompt();
    } catch (err) {
      notification.open({
        message: '❗️提示',
        description: '复制连接失败，浏览器版本过低🔍',
        placement: 'top',
        duration: 3,
      });
    }
    document.body.removeChild(textarea);
  }
};
const showReward = () => {
  // 显示打赏事件
  notification.open({
    message: '📌提示',
    description: '打赏功能还在开发中，感谢支持😘',
    placement: 'top',
    duration: 3,
  });
};
// #endregion

// #region 评论
const commentList = ref([]); // 评论列表
const currentCommentPage = ref(2); // 当前评论页
const pageSize = ref(10); // 页大小
const commentTotal = ref(0); // 总数
const currentComment = reactive({
  entityType: 'Article',
  content: null,
}); // 当前评论
const imageFileList = ref([]); // 图片上传数组
const commentListReady = ref(false); // 拿到评论列表状态量
/**
 * 获取该文章所有评论
 * @param  { Boolean } init 是否是评论区初始化(pageSize=10,currentPage=1)，默认false
 */
const getCommentData = (init = false) => {
  api
    .getComment({
      entityType: 'Article',
      entityId: router.currentRoute.value.query.id,
      currentPage: init ? 1 : currentCommentPage.value++,
      pageSize: init ? 10 : pageSize.value,
    })
    .then((res) => {
      if (init) {
        commentList.value = res.rows;
      } else {
        commentList.value.push(...res.rows);
      }
      commentTotal.value = res.count;
      commentListReady.value = true; // 已获取内容
    });
};
const commentBar = ref(null);
const commentBarScroll = () => {
  // 评论区滚动的事件监听
  if (
    commentBar.value.scrollTop + commentBar.value.clientHeight >=
      commentBar.value.scrollHeight - 200 &&
    commentList.value.length < commentTotal.value
  ) {
    getCommentData();
  }
};
const submittingCommentLoading = ref(false); // 正在提交评论状态量
const submitComment = () => {
  // 提交评论
  submittingCommentLoading.value = true;
  api
    .addComment({
      entityId: router.currentRoute.value.query.id,
      ...currentComment,
    })
    .then((res) => {
      if (utils.analysisData(res)) {
        currentComment.content = null;
        currentComment.parentId = null;
        pushNewDataInCommentList(res.data);
      }
      submittingCommentLoading.value = false;
    });
  // TODO 评论上传图片相关逻辑
};
const pushNewDataInCommentList = async (newData) => {
  // 将新数据添加到list
  newData.childrenCount = 0;
  newData.userId = userData.id;
  newData.user = {
    id: userData.id,
    name: userData.name,
  };
  if (!utils.isNullOrEmpty(newData.parentId)) {
    // 若是子级评论
    const parentComment = commentList.value.find((comment) => comment.id == newData.parentId);
    await switchChildComment(parentComment, true); // 获取所有子评论
    if (parentComment.childrenCount <= 0) {
      parentComment.childrenCount = 1;
    }
    parentComment.childCommentShowStatus = true;
  } else {
    // 若是顶级评论
    commentList.value.unshift(newData);
  }
};
/**
 * 获取所有子评论 or 展示/隐藏子评论
 * @param comment 目标评论
 * @param {Boolean} refresh 是否刷新数据，默认false
 */
const switchChildComment = async (comment, refresh = false) => {
  if (utils.isNullOrEmpty(comment.childCommentList) || refresh) {
    // 第一次获取
    await api.getSubComment({ id: comment.id }).then((res) => {
      comment.childCommentList = res.rows;
      comment.childCommentShowStatus = true;
    });
  } else {
    // 显示
    comment.childCommentShowStatus = !comment.childCommentShowStatus;
  }
};
// 在评论列表中查询评论的用户名
const currentParentCommentContent = computed(() => {
  if (utils.isNullOrEmpty(currentComment.parentId))
    return {
      userName: '未知用户',
      commentContent: null,
    };
  let comment = null;
  commentFor: for (const item of commentList.value) {
    if (currentComment.subUserId) {
      // 若找的是二级评论
      if (item.childCommentList && item.childCommentList.length > 0) {
        for (const childItem of item.childCommentList) {
          if (
            childItem.parentId == currentComment.parentId &&
            childItem.userId == currentComment.subUserId
          ) {
            comment = childItem;
            break commentFor; // 跳出整个循环
          }
        }
      }
    } else {
      // 找的是一级评论
      if (item.id == currentComment.parentId) {
        comment = item;
        break;
      }
    }
  }
  if (comment?.userId == -1) {
    // 管理员
    return {
      userName: store.$state.config['my-name']?.content,
      commentContent: comment.content,
    };
  } else {
    return {
      userName: comment.user ? comment.user?.name : '未知用户',
      commentContent: comment.content,
    };
  }
});
const addEmoji = (emoji) => {
  if (currentComment.content) {
    currentComment.content += emoji;
  } else {
    currentComment.content = emoji;
  }
};
const likeComment = (comment) => {
  // 喜欢评论
  api.likeComment(comment.id).then((res) => {
    if (utils.analysisData(res)) {
      comment.like += 1;
    }
  });
};
const getImageFileUrl = (fileObj) => {
  // 生成并得到文件URL
  let url = null;
  if (fileObj?.originFileObj) {
    url = URL.createObjectURL(fileObj.originFileObj); // 创建临时 URL
  }
  return url;
};
// #endregion

let userData = reactive({}); // 登录用户数据
const getUserData = () => {
  // 获取用户数据
  const token = utils.getCookie('token');
  if (!utils.isNullOrEmpty(token)) {
    // 若登录了
    api.getUserDataByToken().then((res) => {
      if (utils.analysisData(res, false)) {
        // 信息获取成功
        Object.assign(userData, res.data);
      } else {
        // 信息获取失败
        utils.removeCookie('token'); // 去除token
        userData = {};
      }
    });
  }
};
onMounted(() => {
  getUserData();
  getCommentData(true);
});
</script>

<template>
  <div id="log-page" class="content-box blog-page-shell">
    <!-- 顶部文章卡片 -->
    <article
      id="log-header"
      class="blog-glass-panel"
      @mouseenter="showIntroductionOrNot(true)"
      @mouseleave="showIntroductionOrNot(false)"
    >
      <div class="header">
        <div class="article-kicker">
          <span>{{ articleData?.typeTheme || 'Writing' }}</span>
          <span>{{ utils.formatDate(articleData?.createTime) }}</span>
        </div>
        <h1 ref="headerTopicRef" class="topic">
          {{ articleData?.topic }}
        </h1>
        <h2 ref="headerIntroductionRef" class="introduction">
          {{ articleData?.introduction }}
        </h2>
        <div class="article-stats">
          <span>喜欢 {{ articleData?.like }}</span>
          <span>阅读 {{ articleData?.popularity }}</span>
        </div>
      </div>
      <div id="image-box">
        <img
          :src="`${config.public.ossUrl}/image/articleCover/${articleData?.id}.png`"
          :alt="articleData?.topic"
          :preview="false"
        />
      </div>
    </article>
    <!-- 文章内容 -->
    <div id="log-content" class="blog-glass-panel">
      <RepeatEmptyPlaceholder :data-show="articleData?.mdContent?.length > 0" class="w-full">
        <RepeatMdPreView :md-content="articleData?.mdContent" />
      </RepeatEmptyPlaceholder>
    </div>
    <!-- 版权 -->
    <div id="statement-bar" class="blog-glass-panel">
      <div class="statement-title">
        {{ articleData?.topic }}
      </div>
      <ul>
        <li v-for="item in statementData" :key="item.name">
          <p>{{ item.name }}</p>
          <p>
            {{
              item.time
                ? utils.formatDate(articleData?.[item.attribute])
                : articleData?.[item.attribute]
            }}
          </p>
        </li>
        <li>
          <p>作者</p>
          <p>{{ articleAuthor }}</p>
        </li>
        <li>
          <p>版权协议</p>
          <div id="copyright">
            <p
              class="iconfont icon-creativecommonssharealike"
              title="Creative Commons"
              @click="goTo('https://creativecommons.org/', $event)"
            ></p>
            <p
              class="iconfont icon-attribute1"
              title="Attribution"
              @click="goTo('https://creativecommons.org/licenses/by/4.0/', $event)"
            ></p>
            <p
              class="iconfont icon-creative-commons-noncommercial-us"
              title="NonCommercial"
              @click="goTo('https://creativecommons.org/licenses/by-nc/4.0/', $event)"
            ></p>
            <p
              class="iconfont icon-creativecommonssharealike"
              title="ShareAlike"
              @click="goTo('https://creativecommons.org/licenses/by-nc-sa/4.0/', $event)"
            ></p>
          </div>
        </li>
      </ul>
    </div>
    <!-- 操作 -->
    <div id="action-bar">
      <a-tooltip placement="bottom" title="喜欢这篇文章">
        <button
          :id="like ? 'active' : ''"
          class="icon iconfont icon-dianzan blog-action"
          title="点赞"
          type="button"
          @click="likeEvent"
        ></button>
      </a-tooltip>
      <a-tooltip placement="bottom" title="复制文章链接">
        <button
          class="icon iconfont icon-fenxiang blog-action"
          title="分享"
          type="button"
          @click="shareEvent"
        ></button>
      </a-tooltip>
      <a-tooltip placement="bottom" title="打赏功能开发中">
        <button
          class="icon iconfont icon-liwu blog-action"
          title="打赏"
          type="button"
          @click="showReward"
        ></button>
      </a-tooltip>
      <!-- <a-popover :overlay-inner-style="{ padding: 0 }">
                <template #content>
                    <div>
                        <a-qrcode :value="config.public.baseUrl + '/reward'" :bordered="false" />
                    </div>
                </template>
<a-tooltip placement="bottom" title="🍭赏点银子，拿去恰饭">
    <p class="icon iconfont icon-liwu rounded-full mx-8 text-center" title="打赏" @click="showReward"></p>
</a-tooltip>
</a-popover> -->
    </div>
    <!-- TODO 公安备案注释TEMP -->
    <!-- 评论 -->
    <!-- <div id="comment-bar" ref="comment-bar" class="mb-36 p-16">
            <h2>评论列表☁️</h2>
            <RepeatEmptyPlaceholder :dataReady="commentListReady" :dataShow="commentList.length > 0">
                <div @scroll="commentBarScroll" ref="commentBar" class="overflow-y-auto comment-list">
                    <a-comment v-for="comment in commentList" :key="comment.id + 'comment'">
                        <template #actions>
                            <a-space>
                                <template #split>
                                    <a-divider type="vertical" />
                                </template>
                                <a-button type="text"
                                    @click="currentComment.parentId = comment.id; currentComment.subUserId = null;">
                                    回复
                                </a-button>
                                <a-button type="text" @click="likeComment(comment)">
                                    点赞
                                </a-button>
                                <a-button type="text" v-if="comment.childrenCount > 0"
                                    @click="switchChildComment(comment)">{{
                                        (comment.childCommentShowStatus ? '收起' : '展开') + comment.childrenCount
                                    }}条评论</a-button>
                            </a-space>
                        </template>
                        <template #author>
                            <p>{{ comment.userId == -1 ? store.$state.config['my-name']?.content : comment.user?.name }}
                            </p>
                        </template>
                        <template #avatar>
                            <a-avatar
                                :src="comment.userId == -1 ? store.$state.config['my-avatar']?.content : `${config.public.ossUrl}/image/userAvatar/${comment.user?.id}.png`"
                                :alt="comment.user?.name + '头像'">
                                <template #icon>
                                    <UserOutlined class="flex justify-center items-center w-full h-full" />
                                </template>
                            </a-avatar>
                        </template>
                        <template #content>
                            <p class="comment-content">
                                {{ comment.content }}
                            </p>
                            <div class="flex items-center justify-between pt-4">
                                <a-tooltip :title="utils.formatDate(comment.createTime, true)">
                                    <p class="comment-time">{{ utils.formatDateSimple(comment.createTime) }}</p>
                                </a-tooltip>
                                <span>
                                    {{ '❤️' + comment.like }}
                                </span>
                            </div>
                        </template>
                        <template v-if="comment.childCommentShowStatus">
                            <a-comment v-for="childComment in comment.childCommentList"
                                :key="childComment.id + 'childComment'">
                                <template #actions>
                                    <a-space>
                                        <template #split>
                                            <a-divider type="vertical" />
                                        </template>
                                        <a-button type="text"
                                            @click="currentComment.parentId = childComment.parentId; currentComment.subUserId = childComment.userId;">
                                            回复
                                        </a-button>
                                        <a-button type="text" @click="likeComment(childComment)">
                                            点赞
                                        </a-button>
                                    </a-space>
                                </template>
                                <template #author>
                                    <p>{{ childComment.userId == -1 ? store.$state.config['my-name']?.content :
                                        childComment.user?.name }}</p>
                                </template>
                                <template #avatar>
                                    <a-avatar
                                        :src="childComment.userId == -1 ? store.$state.config['my-avatar']?.content : `${config.public.ossUrl}/image/userAvatar/${childComment.user?.id}.png`"
                                        :alt="childComment.user?.name + '头像'">
                                        <template #icon>
                                            <UserOutlined class="flex justify-center items-center w-full h-full" />
                                        </template>
                                    </a-avatar>
                                </template>
                                <template #content>
                                    <p class="comment-content">
                                        <span v-if="childComment.subUserId">
                                            <span>回复</span>
                                            <span class="reply-user-span mx-4 h-full p-1">{{
                                                `@${childComment.subUserId == -1 ?
                                                    store.$state.config['my-name']?.content : childComment.subUser?.name}:`
                                            }}</span>
                                        </span>
                                        <span>{{ childComment.content }}</span>
                                    </p>
                                    <div class="flex items-center justify-between pt-4">
                                        <a-tooltip :title="utils.formatDate(childComment.createTime, true)">
                                            <p class="comment-time">{{ utils.formatDateSimple(childComment.createTime)
                                                }}
                                            </p>
                                        </a-tooltip>
                                        <span>
                                            {{ '❤️' + childComment.like }}
                                        </span>
                                    </div>
                                </template>
                            </a-comment>
                        </template>
                    </a-comment>
                    <div class="text-center my-16 text-3xl">- 这是我的底线了 -</div>
                </div>
            </RepeatEmptyPlaceholder>
            <!== 新增评论 ==>
            <hr>
            <a-comment>
                <template #content>
                    <div v-if="currentComment.parentId" id="replyObj" class="px-8 py-2 flex items-center">
                        <p>回复@{{ currentParentCommentContent.userName }}:{{
                            currentParentCommentContent.commentContent }}</p>
                        <CloseOutlined class="p-2 ml-4"
                            @click="currentComment.parentId = null; currentComment.subUserId = null;" />
                    </div>
                    <div class="submit-comment-bar min-h-24 flex flex-col justify-end items-end gap-4 p-4">
                        <a-textarea :bordered="false" v-model:value="currentComment.content" :rows="2"
                            placeholder="留下你的痕迹叭" />
                        <div class="flex w-full px-4 items-start" v-if="imageFileList.length > 0">
                            <a-image class="max-h-60 min-h-80" :src="getImageFileUrl(imageFileList[0])"></a-image>
                            <CloseOutlined class="p-2 ml-4" @click="imageFileList.splice(0, imageFileList.length)" />
                        </div>
                        <div id="submit-bar" class="flex gap-x-4">
                            <a-upload v-model:file-list="imageFileList" name="file" class="hidden mx-4" :max-count="1"
                                accept="image/*" :showUploadList="false">
                                <FileImageOutlined class="font-size-medium" title="上传图片" />
                            </a-upload>
                            <a-dropdown :placement="'top'">
                                <SmileOutlined class="mx-4" />
                                <template #overlay>
                                    <div title="表情"
                                        class="emoji-bar flex flex-wrap max-w-screen-sm md:max-w-screen-md border-2 p-4 justify-center">
                                        <div class="emoji"
                                            v-for="(emoji, index) in store.$state.config['emojis']?.content"
                                            :key="index + 'emoji'" @click="addEmoji(emoji)">
                                            {{ emoji }}
                                        </div>
                                    </div>
                                </template>
                            </a-dropdown>
                            <SendOutlined class="mx-4" @click="submitComment" title="发送评论"
                                v-if="!submittingCommentLoading" />
                            <sync-outlined class="mx-4" spin v-else />
                        </div>
                    </div>
                </template>
            </a-comment>
        </div> -->
  </div>
</template>

<style lang="scss" scoped>
#log-page {
  // 文章头部
  #log-header {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(26rem, 0.8fr);
    gap: 3rem;
    min-height: 34rem;
    padding: clamp(2.4rem, 5vw, 5rem);
    overflow: hidden;
    color: $main-text-color;

    .header {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
      gap: 2rem;

      .article-kicker,
      .article-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 1.6rem;
        color: $secondary-text-color;
        font-size: 1.25rem;
        font-weight: 760;
      }

      .topic,
      .introduction {
        margin: 0;
        transition:
          opacity 0.28s ease,
          height 0.28s ease;
        overflow: hidden;
        text-wrap: balance;
      }

      .topic {
        opacity: 1;
        height: auto;
        font-size: clamp(3.6rem, 7vw, 7.8rem);
        line-height: 1.02;
        font-weight: 880;
        letter-spacing: 0;
      }

      .introduction {
        opacity: 0;
        height: 0;
        color: $secondary-text-color;
        font-size: clamp(2.2rem, 4vw, 4rem);
        line-height: 1.35;
        font-weight: 720;
      }
    }

    #image-box {
      align-self: stretch;
      min-height: 26rem;
      overflow: hidden;
      border-radius: 8px;
      background-color: $main-background-color;
      box-shadow: 0 22px 70px rgba(23, 32, 29, 0.14);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // 文章内容
  #log-content,
  #comment-bar {
    padding: clamp(2rem, 4vw, 5rem);

    .comment-time {
      font-size: $xx-small-font-size;
      color: $secondary-text-color;
    }

    .reply-user-span {
      color: $secondary-text-color;
    }
  }

  // 版权声明
  #statement-bar {
    padding: 2.2rem;
    overflow: hidden;

    .statement-title {
      margin-bottom: 1.6rem;
      font-size: 1.8rem;
      font-weight: 800;
    }

    ul {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 1.2rem;
      margin: 0;
      color: $secondary-text-color;
      font-size: 1.25rem;
      list-style: none;
    }

    li p:first-child {
      margin-bottom: 0.4rem;
      color: $main-text-color;
      font-weight: 800;
    }

    #copyright {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    #copyright p {
      cursor: $hover-cursor;
      margin: 0;
      font-size: 1.8rem;
    }
  }

  // 操作
  #action-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin: 3rem 0 5rem;

    .icon {
      min-width: 5rem;
      width: 5rem;
      padding: 0;
      font-size: 2rem;
      color: $main-text-color;
      cursor: $hover-cursor;

      &:hover {
        color: $main-color;
      }
    }

    #active {
      color: $main-color;
      border-color: $main-color;
    }
  }

  // # 评论区
  #comment-bar {
    font-size: $medium-font-size;

    .comment-list {
      max-height: 70vh;

      /* 定义滚动条整体样式 */
      &::-webkit-scrollbar {
        display: none;
      }
    }

    .comment-content {
      font-size: $small-font-size;
    }
  }

  #replyObj {
    font-size: $x-small-font-size;

    p {
      color: $secondary-text-color;
      /* 禁止换行 */
      white-space: nowrap;
      /* 隐藏超出部分 */
      overflow: hidden;
      /* 使用省略号表示超出部分 */
      text-overflow: ellipsis;
    }

    // 回复相关评论的关闭按钮
    .anticon-close {
      background-color: $main-background-color;
      color: $main-text-color;
      border-radius: 50%;
      cursor: $hover-cursor;
    }
  }

  .submit-comment-bar {
    border-radius: 20px;
    border: 1px solid $secondary-text-color;

    #submit-bar {
      font-size: $medium-font-size;

      * {
        cursor: $hover-cursor;
      }

      .font-size-medium {
        font-size: $medium-font-size;
        color: $main-text-color;
      }
    }
  }
}

.emoji-bar {
  border-color: $secondary-text-color;
  background-color: $secondary-car-color;
  border-radius: 20px;
  max-height: 30rem;
  max-width: 60rem;
  overflow-y: scroll;

  /* 定义滚动条整体样式 */
  &::-webkit-scrollbar {
    display: none;
  }

  .emoji {
    font-size: $medium-font-size;
    cursor: $hover-cursor;
  }
}

:deep(#preview) {
  border-radius: 8px;
}

@media (max-width: 900px) {
  #log-page {
    #log-header {
      grid-template-columns: 1fr;
    }

    #statement-bar ul {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
