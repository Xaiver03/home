<script setup>
import { computed } from 'vue';
const store = useNuxtStore();
const config = useRuntimeConfig();
definePageMeta({
  layout: 'classics',
});
let editorOptions = reactive({
  theme: 'dark', // 主题 dark | light
  toolbarsExclude: ['github'], // 不显示的tool
  showCodeRowNumber: true, // 显示代码块的行号
  autoFoldThreshold: 100, // 代码块，默认折叠代码的行数
  toolbars: [
    'revoke',
    'next',
    1,
    'image',
    'bold',
    'underline',
    'italic',
    '-',
    'title',
    'strikeThrough',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    'table',
    '-',
    '=',
    'preview',
    'previewOnly',
    'catalog',
  ], // 工具bar内容
  footers: ['markdownTotal', 0, '=', 'scrollSwitch'], // 页脚内容
}); // md编辑器组件配置
let editorPreview = ref(true);
watch(
  () => store.themeMode,
  (newVal) => {
    if (!utils.isNullOrEmpty(newVal)) {
      editorOptions.theme = newVal == 'Light' ? 'light' : 'dark';
    }
  },
  { immediate: true },
);
const initEditorPreview = () => {
  // 初始化md编辑器是否预览
  if (store.windowSize.width < 1024) {
    editorPreview.value = false;
  } else {
    editorPreview.value = true;
  }
};
const total = useState('total', () => 0);
const currentPage = useState('currentPage', () => 1);
const pageSize = useState('pageSize', () => 10);
const route = useRoute();
const activeSection = ref(route.query.tab === 'ask' ? 'ask' : 'message');
const askPublicPage = ref(1);
const askPublicTotal = ref(0);
const publicQuestions = ref([]);
const publicLoading = ref(false);
const submitQuestionLoading = ref(false);
const queryLoading = ref(false);
const submittedTrackingCode = ref('');
const emptyQueryMessage = ref('');
const queryResult = ref(null);
const questionForm = reactive({
  nickname: '',
  contact: '',
  question: '',
});
const queryForm = reactive({
  trackingCode: '',
});
const handleAvatarError = (event) => {
  event?.target?.removeAttribute?.('src');
};
// 服务端 - 获取留言
const { data: messageList, error: messageListError } = await useAsyncData(
  'getMessageList-index',
  async () => {
    currentPage.value = 1;
    pageSize.value = 10;
    total.value = 0;
    return await api
      .getComment({
        entityType: 'Message',
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        order: '[["createTime","DESC"],["like","DESC"]]',
      })
      .then((res) => {
        total.value = res.count;
        return res.rows;
      });
  },
);
/**
 * 获取所有留言
 * @param  { Boolean } init 是否初始化(pageSize=10,currentPage=1)，默认false
 * @param { Object } options 传递给后端的其他配置项
 */
const getMessageData = (
  init = false,
  options = { order: '[["createTime","DESC"],["like","DESC"]]' },
) => {
  api
    .getComment({
      entityType: 'Message',
      currentPage: init ? 1 : currentPage.value,
      pageSize: init ? 10 : pageSize.value,
      ...options,
    })
    .then((res) => {
      if (init) {
        messageList.value = res.rows;
      } else {
        messageList.value.push(...res.rows);
      }
      total.value = res.count;
    });
};
let actionBarShow = ref(false);
let messageSorting = ref(null); // 留言筛选器
const judgeMessageSortingGetMessageData = (init = false) => {
  // 判断当前messageSorting类型，请求对应数据
  switch (messageSorting.value) {
    case 'like':
      getMessageData(init, { order: '[["like", "DESC"]]' });
      break;
    case 'time':
      getMessageData(init, { order: '[["createTime", "DESC"]]' });
      break;
    case 'author':
      getMessageData(init, { userId: -1, order: '[["createTime", "DESC"]]' });
      break;
  }
};
watch(
  () => messageSorting.value,
  (newVal) => {
    if (!utils.isNullOrEmpty(newVal)) {
      currentPage.value = 2;
      judgeMessageSortingGetMessageData(true);
    }
  },
);
const getMoreMessage = () => {
  // 加载更多留言
  currentPage.value++;
  if (utils.isNullOrEmpty(messageSorting.value)) {
    getMessageData();
  } else {
    judgeMessageSortingGetMessageData();
  }
};

const questionStatusText = (status) => {
  switch (status) {
    case 'approved':
      return '审核通过';
    case 'rejected':
      return '未通过';
    case 'archived':
      return '已封存';
    case 'pending':
      return '待审核';
    default:
      return '未知状态';
  }
};
const questionStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'archived':
      return 'warning';
    default:
      return 'processing';
  }
};
const switchSection = (section) => {
  activeSection.value = section;
  navigateTo({ path: '/message', query: section === 'ask' ? { tab: 'ask' } : {} }, { replace: true });
};
const openMessageEditor = (parentId = null, subUserId = null) => {
  currentMessage.parentId = parentId;
  currentMessage.subUserId = subUserId;
  messageModelShow.value = true;
  phoneAdaptation();
};
const loadPublicQuestions = async (page = 1, append = false) => {
  publicLoading.value = true;
  try {
    const res = await api.searchPublicQuestion({
      currentPage: page,
      pageSize: 6,
      data: {},
    });
    const rows = Array.isArray(res?.rows) ? res.rows : [];
    askPublicTotal.value = Number(res?.count) || 0;
    publicQuestions.value = append ? [...publicQuestions.value, ...rows] : rows;
    askPublicPage.value = page;
  } catch (error) {
    // 公开树洞加载失败时保留页面和表单，不能因为接口暂时不可用卸载整页。
    publicQuestions.value = [];
    askPublicTotal.value = 0;
    console.warn('公开树洞加载失败:', error?.message || error);
  } finally {
    publicLoading.value = false;
  }
};
const submitQuestion = async () => {
  if (utils.isNullOrEmpty(questionForm.question)) {
    notification.open({
      message: '提示💡',
      description: '先把想问的写下来吧。',
      placement: 'top',
      duration: 3,
    });
    return;
  }
  submitQuestionLoading.value = true;
  try {
    const res = await api.addQuestion({ ...questionForm });
    if (utils.analysisData(res)) {
      submittedTrackingCode.value = res.data.trackingCode;
      queryForm.trackingCode = res.data.trackingCode;
      emptyQueryMessage.value = '';
      questionForm.nickname = '';
      questionForm.contact = '';
      questionForm.question = '';
    }
  } finally {
    submitQuestionLoading.value = false;
  }
};
const queryQuestion = async () => {
  if (utils.isNullOrEmpty(queryForm.trackingCode)) {
    notification.open({
      message: '提示💡',
      description: '请输入追踪码。',
      placement: 'top',
      duration: 3,
    });
    return;
  }
  queryLoading.value = true;
  emptyQueryMessage.value = '';
  try {
    const res = await api.getQuestionByTrackingCode({
      trackingCode: queryForm.trackingCode,
    });
    if (utils.analysisData(res, false)) {
      queryResult.value = res.data;
      emptyQueryMessage.value = '';
    } else {
      queryResult.value = null;
      emptyQueryMessage.value = '暂时没有查到这条提问，看看追踪码有没有输错。';
    }
  } finally {
    queryLoading.value = false;
  }
};
const copyTrackingCode = async (trackingCode) => {
  if (!trackingCode || !import.meta.client) return;
  await navigator.clipboard.writeText(trackingCode);
  notification.open({
    message: '已复制',
    description: '追踪码已复制，可以直接去查询。',
    placement: 'top',
    duration: 2,
  });
};
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
const mdEditor = ref(null); // md编辑器实体
let currentMessage = reactive({
  entityType: 'Message',
  entityId: -1,
});
const submitMessage = () => {
  // 提交留言
  if (utils.isNullOrEmpty(mdEditor.value?.mdContent)) {
    notification.open({
      message: '提示💡',
      description: '先写一点内容再提交吧。',
      placement: 'top',
      duration: 3,
    });
    return;
  }
  api
    .addComment({
      content: mdEditor.value.mdContent, // 读取mdEditor组件的输入内容
      ...currentMessage,
    })
    .then((res) => {
      if (utils.analysisData(res)) {
        // pushNewDataInMessageList(res.data)
        mdEditor.value.mdContent = null; // 清空内容
        currentMessage.parentId = null;
        currentMessage.subUserId = null;
        messageModelShow.value = false;
        uploadUnSaveImagesPath.value = []; // 清空图片暂存
        getMessageData(true);
      }
    });
};
const messageAuthorName = (message) => {
  if (message.userId === -1) return store.$state.config['my-name']?.content || '站长';
  return message.user?.name || '匿名访客';
};
const pushNewDataInMessageList = async (newData) => {
  // 将新数据添加到list
  newData.childrenCount = 0;
  newData.userId = userData.id;
  newData.user = {
    id: userData.id,
    name: userData.name,
  };
  if (!utils.isNullOrEmpty(newData.parentId)) {
    // 若是子级留言
    const parentMessage = messageList.value.find((message) => message.id == newData.parentId);
    await switchChildMessage(parentMessage, true); // 获取所有子评论
    parentMessage.childMessageShowStatus = true;
  } else {
    // 若是顶级留言
    messageList.value.unshift(newData);
  }
};
const likeMessage = (message) => {
  // 喜欢评论
  api.likeComment(message.id).then((res) => {
    if (utils.analysisData(res)) {
      message.like += 1;
    }
  });
};
let messageModelShow = ref(false);
// 在留言列表中查询留言的用户名
const currentParentMessageContent = computed(() => {
  if (utils.isNullOrEmpty(currentMessage.parentId))
    return {
      userName: '未知用户',
      messageContent: null,
    };
  let message = null;
  messageFor: for (const item of messageList.value) {
    if (currentMessage.subUserId) {
      // 若找的是二级评论
      if (item.childMessageList && item.childMessageList.length > 0) {
        for (const childItem of item.childMessageList) {
          if (
            childItem.parentId == currentMessage.parentId &&
            childItem.userId == currentMessage.subUserId
          ) {
            message = childItem;
            break messageFor; // 跳出整个循环
          }
        }
      }
    } else {
      // 找的是一级评论
      if (item.id == currentMessage.parentId) {
        message = item;
        break;
      }
    }
  }
  if (message?.userId == -1) {
    // 管理员
    return {
      userName: store.$state.config['my-name']?.content,
      messageContent: message.content,
    };
  } else {
    return {
      userName: message.user ? message.user?.name : '未知用户',
      messageContent: message.content,
    };
  }
});
const ParsingReplyObject = (message) => {
  // 判断当前留言是否正在被回复
  if (currentMessage.subUserId) {
    // 若留言的是某评论的子评论
    return (
      currentMessage.subUserId == message.userId && currentMessage.parentId == message.parentId
    );
  } else {
    // 留言的是某留言
    return currentMessage.parentId == message.id;
  }
};
/**
 * 获取所有子留言 or 展示/隐藏子留言
 * @param message 目标留言
 * @param { Boolean } refresh 是否强制刷新子留言，默认false
 */
const switchChildMessage = async (message, refresh = false) => {
  if (utils.isNullOrEmpty(message.childMessageList) || refresh) {
    // 第一次获取或者强制刷新
    await api.getSubComment({ id: message.id }).then((res) => {
      message.childMessageList = res.rows;
      message.childMessageShowStatus = true;
    });
  } else {
    // 显示
    message.childMessageShowStatus = !message.childMessageShowStatus;
  }
};
let uploadUnSaveImagesPath = ref([]); // 上传过未保存的图片路径
const messageImageUpload = async (files, callback) => {
  // 留言图片上传
  const res = await Promise.all(
    // 处理各个图片的上传
    files.map((file) => {
      return new Promise((rev, rej) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', `/image/messageImage/`); // 上传到oss的路径
        formData.append('uuidOrNot', true); // 上传到oss的路径
        api.uploadImage(formData).then((res) => {
          // 上传oss图片
          if (utils.analysisData(res)) {
            uploadUnSaveImagesPath.value.push(res.data.path); // 记录上传的未保存图片路径
            rev(res);
          } else {
            rej(res);
          }
        });
      });
    }),
  );
  callback(res.map((item) => item.data.url)); // 执行回调，插入图片url
};
const deleteAllUploadImage = () => {
  // 删除所有上传到oss未保存的图片
  if (uploadUnSaveImagesPath.value.length > 0) {
    for (let path of uploadUnSaveImagesPath.value) {
      api.deleteImage({ path: path });
    }
    uploadUnSaveImagesPath.value = []; // 清空图片暂存
  }
};
const defaultUnSaveTip = () => {
  // 离开浏览器删除未保存的图片，用于浏览器的beforeUnload事件
  deleteAllUploadImage();
};
onBeforeRouteLeave(async (to, form, next) => {
  // 监听路由离开，删除未保存的图片
  await deleteAllUploadImage();
  next();
});
const phoneAdaptation = () => {
  // 手机端的留言工具栏适配
  // 等待 DOM 渲染完成后添加监听
  setTimeout(() => {
    const dropdowns = document.querySelectorAll('.md-editor-toolbar-wrapper');
    dropdowns.forEach((el) => {
      const scrollORClickEvent = () => {
        setTimeout(() => {
          const allDropdowns = document.querySelectorAll('.md-editor-dropdown');
          const hiddenDropdowns = document.querySelectorAll('.md-editor-dropdown-hidden');
          if (allDropdowns.length > hiddenDropdowns.length) {
            // 展示了
            el.style.overflow = 'visible';
          } else {
            // 隐藏了
            el.style.overflow = 'auto';
          }
        }, 100);
      };
      el.addEventListener('pointerdown', scrollORClickEvent);
    });
  }, 100);
};

onMounted(() => {
  getUserData();
  initEditorPreview();
  loadPublicQuestions();
  const trackingCode = String(route.query.trackingCode || '').trim().toUpperCase();
  if (trackingCode) {
    activeSection.value = 'ask';
    queryForm.trackingCode = trackingCode;
    nextTick(queryQuestion);
  }
  window.addEventListener('beforeunload', defaultUnSaveTip); // 监听浏览器关闭和刷新事件，提示还没保存
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', defaultUnSaveTip);
});
</script>

<template>
  <main id="message-page" class="content-box blog-page-shell">
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Messages</span>
        <h1>留言板</h1>
      </div>
      <p>公开留言板保留交流，也可以进入匿名树洞，留下不想署名的问题。</p>
    </header>
    <div id="message-page-content">
      <div class="message-toolbar blog-glass-panel">
        <a-space class="section-tabs" role="tablist" aria-label="留言功能">
          <a-button :type="activeSection === 'message' ? 'primary' : 'default'" :aria-pressed="activeSection === 'message'" @click="switchSection('message')">留言板</a-button>
          <a-button :type="activeSection === 'ask' ? 'primary' : 'default'" :aria-pressed="activeSection === 'ask'" @click="switchSection('ask')">匿名树洞</a-button>
        </a-space>
        <a-space v-if="activeSection === 'message'" class="hidden md:flex">
          <a-space direction="vertical">
            <a-radio-group v-model:value="messageSorting">
              <a-radio-button value="like">按热度</a-radio-button>
              <a-radio-button value="time">按时间</a-radio-button>
              <a-radio-button value="author">作者</a-radio-button>
            </a-radio-group>
          </a-space>
          <a-button
            @click="openMessageEditor()"
          >
            <template #icon>
              <FormatPainterOutlined />
            </template>
            写留言
          </a-button>
        </a-space>
        <a-space v-if="activeSection === 'message'" class="flex md:hidden mobile-toolbar-actions">
          <a-button
            v-if="activeSection === 'message'"
            class="flex justify-center items-center"
            @click="openMessageEditor()"
          >
            <FormatPainterOutlined />
            <span>写留言</span>
          </a-button>
          <a-button v-if="activeSection === 'message'" class="flex justify-center items-center" @click="actionBarShow = true">
            <EllipsisOutlined />
          </a-button>
        </a-space>
      </div>
      <div v-if="activeSection === 'message'" class="message-card">
        <RepeatEmptyPlaceholder
          :dataReady="Boolean(messageList)"
          :dataShow="messageList?.length > 0"
        >
          <!-- 父评论 -->
          <div v-for="(message, index) in messageList" :key="message.id" v-motion-fade-visible-once>
            <div class="flex flex-row">
              <a-avatar
                :src="
                  message.userId <= 0
                    ? store.$state.config['my-avatar']?.content
                    : `${config.public.storageUrl}/image/userAvatar/${message.user?.id}.png`
                "
                :alt="message.user?.name + '头像'"
                :size="store.phoneModelOrNot ? 32 : 64"
                @error="handleAvatarError"
              >
                <template #icon>
                  <UserOutlined
                    class="flex justify-center items-center w-full h-full user-outlined"
                  />
                </template>
              </a-avatar>
              <div class="md-view-box ml-8 pt-0 flex-1 overflow-hidden">
                <div class="view-box-top-bar flex items-center justify-between py-4 px-8">
                  <div class="flex items-center message-text">
                    <h4>
                      {{
                        messageAuthorName(message)
                      }}
                    </h4>
                    <a-tooltip :title="utils.formatDate(message.createTime, true)">
                      <p class="ml-4 cursor-point">
                        {{ utils.formatDateSimple(message.createTime, true) }}
                      </p>
                    </a-tooltip>
                  </div>
                  <a-dropdown>
                    <EllipsisOutlined class="cursor-point text-5xl" />
                    <template #overlay>
                      <a-menu>
                        <a-menu-item @click="likeMessage(message)"> ❤️喜欢 </a-menu-item>
                        <a-menu-item
                          v-if="message.childrenCount > 0"
                          @click="switchChildMessage(message)"
                        >
                          {{ message.childMessageShowStatus ? '收起' : '展开' }}所有留言
                        </a-menu-item>
                        <a-menu-item
                          @click="openMessageEditor(message.id, null)">
                          ✏️{{ (ParsingReplyObject(message) ? "回复中" : "回复") }}
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
                <RepeatMdPreView :mdContent="message.content" class="w-full"> </RepeatMdPreView>
                <div
                  class="flex justify-end p-8 pt-0"
                  v-if="message.childrenCount > 0 || message.like > 0"
                >
                  <p class="mx-4">💭{{ message.childrenCount }}</p>
                  <p class="mx-4">❤️{{ message.like }}</p>
                </div>
              </div>
            </div>
            <div class="message-parting ml-64 h-16"></div>
            <!-- 子评论 -->
            <div
              class="child-message-box relative pl-48 pb-16"
              v-if="message.childMessageShowStatus && message.childMessageList.length > 0"
            >
              <div
                class="pl-16 z-20 relative"
                style="transform: translateX(-16px)"
                v-for="childMessage in message.childMessageList"
                :key="childMessage.id"
              >
                <a-comment>
                  <template #actions>
                    <a-space :size="32">
                      <div class="actions flex items-center" @click="likeMessage(childMessage)">
                        <LikeOutlined />
                        <span class="ml-4">{{
                          childMessage.like > 0 ? childMessage.like : '喜欢'
                        }}</span>
                      </div>
                      <div class="actions flex items-center"
                        @click="openMessageEditor(childMessage.parentId, childMessage.userId)">
                        <MessageOutlined />
                        <span class="ml-4">回复</span>
                      </div>
                    </a-space>
                  </template>
                  <template #author>
                    <h4 class="username">
                      {{
                        messageAuthorName(childMessage)
                      }}
                    </h4>
                  </template>
                  <template #avatar>
                    <a-avatar
                      class="cursor-default"
                      :src="
                        childMessage.userId <= 0
                          ? store.$state.config['my-avatar']?.content
                          : `${config.public.storageUrl}/image/userAvatar/${childMessage.user?.id}.png`
                      "
                      :alt="childMessage.user?.name + '头像'"
                      @error="handleAvatarError"
                    >
                      <template #icon>
                        <UserOutlined
                          class="flex justify-center items-center w-full h-full user-outlined"
                        />
                      </template>
                    </a-avatar>
                  </template>
                  <template #content>
                    <RepeatMdPreView :mdContent="childMessage.content" class="child-md-view w-full">
                    </RepeatMdPreView>
                  </template>
                  <template #datetime>
                    <span class="mr-2" v-if="!utils.isNullOrEmpty(childMessage.subUserId)">{{
                      `@${
                        childMessage.subUserId == -1
                          ? store.$state.config['my-name']?.content
                          : childMessage.subUser?.name
                      }`
                    }}</span>
                    <a-tooltip :title="utils.formatDate(childMessage.createTime, true)">
                      <span class="cursor-point">{{
                        utils.formatDateSimple(childMessage.createTime, true)
                      }}</span>
                    </a-tooltip>
                  </template>
                </a-comment>
              </div>
              <div class="child-message-parting z-10 absolute h-full top-0 left-64"></div>
            </div>
            <div
              class="relative ml-64"
              v-if="index >= messageList?.length - 1 && index < total - 1"
            >
              <button class="add-more-btn blog-action" type="button" @click="getMoreMessage">
                加载更多 <span aria-hidden="true">→</span>
              </button>
              <!-- 撑开宽度的假按钮 -->
              <button class="invisible blog-action" type="button">加载更多</button>
            </div>
            <div class="no-more-line" v-else-if="index >= messageList?.length - 1">
              已经到底了，新的留言会继续出现在这里。
            </div>
          </div>
        </RepeatEmptyPlaceholder>
      </div>
      <div v-else class="ask-shell">
        <section class="ask-panel blog-glass-panel" v-motion-fade-visible-once>
          <div class="panel-heading">
            <span>01</span>
            <div>
              <h2>匿名树洞</h2>
              <p>不需要登录。默认不会公开，只有站长能看到；是否公开，会根据内容再决定。</p>
            </div>
          </div>
          <p class="helper-copy">把想说的话写下来。提交成功后会生成追踪码，记得保存，后面查询回复要用。</p>
          <div class="form-stack">
            <label>
              <span>昵称（可选）</span>
              <a-input v-model:value="questionForm.nickname" placeholder="留空则显示为“匿名访客”" :maxlength="100" />
            </label>
            <label>
              <span>联系方式（可选，仅用于必要时联系，不会公开）</span>
              <a-input v-model:value="questionForm.contact" placeholder="比如邮箱或微信，方便需要时联系你" :maxlength="255" />
            </label>
            <label>
              <span>问题</span>
              <a-textarea
                v-model:value="questionForm.question"
                placeholder="把想问的写在这里。请不要留下密码、验证码、密钥或其他敏感信息。"
                :rows="8"
                :maxlength="1500"
                show-count
              />
            </label>
            <button class="blog-action" type="button" :disabled="submitQuestionLoading" @click="submitQuestion">
              {{ submitQuestionLoading ? '提交中...' : '投进树洞' }} <span aria-hidden="true">→</span>
            </button>
          </div>
          <a-alert v-if="submittedTrackingCode" class="tracking-alert" type="success" show-icon message="提问已收到">
            <template #description>
              <p>你的追踪码是：</p>
              <button class="tracking-code" type="button" @click="copyTrackingCode(submittedTrackingCode)">
                {{ submittedTrackingCode }}
              </button>
              <p>这串追踪码只会出现这一次，记得截图或复制保存。</p>
              <p>之后查询树洞回复，需要用到它。</p>
            </template>
          </a-alert>
        </section>

        <section class="ask-panel blog-glass-panel" v-motion-fade-visible-once>
          <div class="panel-heading">
            <span>02</span>
            <div>
              <h2>查询树洞回复</h2>
              <p>输入追踪码，就能查看这条提问的审核状态和回复。</p>
            </div>
          </div>
          <div class="query-row">
            <a-input v-model:value="queryForm.trackingCode" placeholder="输入你的追踪码，例如 QA8F3K2M9P" @pressEnter="queryQuestion" />
            <button class="blog-action secondary" type="button" :disabled="queryLoading" @click="queryQuestion">
              {{ queryLoading ? '查询中...' : '查询' }}
            </button>
          </div>
          <div v-if="queryResult" class="query-result">
            <div class="result-meta">
              <a-tag :color="questionStatusColor(queryResult.status)">{{ questionStatusText(queryResult.status) }}</a-tag>
              <a-tag v-if="queryResult.answer" color="blue">已回复</a-tag>
              <a-tag v-else color="default">待回复</a-tag>
              <span>{{ utils.formatDate(queryResult.createTime, true) }}</span>
            </div>
            <h3>你的问题</h3>
            <p class="preserve-text">{{ queryResult.question }}</p>
            <template v-if="queryResult.answer">
              <h3>回复</h3>
              <p class="preserve-text answer-text">{{ queryResult.answer }}</p>
            </template>
            <p v-else class="muted-text">暂时还没有回复。如果状态还是“待审核”，这条内容目前也不会出现在公开列表里。</p>
          </div>
          <a-alert v-else-if="emptyQueryMessage" class="query-empty" type="info" show-icon :message="emptyQueryMessage" />
        </section>

        <section class="ask-panel public-panel blog-glass-panel" v-motion-fade-visible-once>
          <div class="panel-heading">
            <span>03</span>
            <div>
              <h2>最近公开树洞</h2>
              <p>这里只展示已通过审核、允许公开，并且已经回复的问题。</p>
            </div>
          </div>
          <p class="helper-copy">提问前可以先看看这里，也许已经有人问过相似的问题。</p>
          <RepeatEmptyPlaceholder :dataReady="Boolean(publicQuestions)" :dataShow="publicQuestions.length > 0">
            <div class="public-list">
              <article v-for="item in publicQuestions" :key="item.id" class="public-item">
                <div class="result-meta">
                  <span>{{ item.nickname || '匿名访客' }}</span>
                  <span>{{ utils.formatDate(item.answerTime || item.updatedTime, true) }}</span>
                </div>
                <div class="qa-block">
                  <span class="qa-label">问题</span>
                  <h3>{{ item.question }}</h3>
                </div>
                <div class="qa-block">
                  <span class="qa-label">回复</span>
                  <p class="preserve-text answer-text">{{ item.answer }}</p>
                </div>
              </article>
            </div>
            <div v-if="publicQuestions.length < askPublicTotal" class="load-more-row">
              <button class="blog-action secondary" type="button" :disabled="publicLoading" @click="loadPublicQuestions(askPublicPage + 1, true)">
                {{ publicLoading ? '加载中...' : '加载更多' }}
              </button>
            </div>
          </RepeatEmptyPlaceholder>
        </section>
      </div>
      <a-modal
        v-model:open="messageModelShow"
        class="addMessageModal"
        title="留言"
        ok-text="提交"
        cancel-text="取消"
        :width="store.$state.windowSize.width < 768 ? '100vw' : '60vw'"
        @ok="submitMessage"
      >
        <div class="model-content flex flex-col">
          <p class="mt-4 mb-4">⚠️限制1500字，留言板支持匿名发表（工具栏可以拖动）</p>
          <div v-if="currentMessage.parentId" id="replyObj" class="py-2 flex items-center">
            <p>
              回复@{{ currentParentMessageContent.userName }}:{{
                currentParentMessageContent.messageContent
              }}
            </p>
            <CloseOutlined
              class="p-2 ml-4"
              @click="
                currentMessage.parentId = null;
                currentMessage.subUserId = null;
              "
            />
          </div>
          <client-only>
            <RepeatMdEditor
              ref="mdEditor"
              class="message-md-editor"
              :options="editorOptions"
              :preview="false"
              :uploadImage="messageImageUpload"
            >
            </RepeatMdEditor>
          </client-only>
        </div>
      </a-modal>
    </div>
    <a-drawer v-model:open="actionBarShow" title="ACTION" width="70vw">
      <a-radio-group v-model:value="messageSorting" class="flex flex-col">
        <a-radio value="like" class="mb-4">按热度</a-radio>
        <a-radio value="time" class="mb-4">按时间</a-radio>
        <a-radio value="author" class="mb-4">作者</a-radio>
      </a-radio-group>
    </a-drawer>
  </main>
</template>

<style lang="scss" scoped>
#message-page {
  #message-page-content {
    display: grid;
    gap: 2rem;
    max-width: 96rem;
    width: 100%;
    margin: 0 auto;

    .message-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      flex-wrap: wrap;

      .section-tabs {
        flex-wrap: wrap;
      }
    }

    .mobile-toolbar-actions {
      margin-left: auto;
    }

    .ask-shell {
      display: grid;
      gap: 2rem;
    }

    .ask-panel {
      padding: 2.4rem;
      color: $main-text-color;
    }

    .panel-heading {
      display: flex;
      gap: 1.4rem;
      margin-bottom: 2rem;

      > span {
        color: $secondary-text-color;
        font-size: 1.3rem;
        font-weight: 820;
        letter-spacing: 0.12em;
      }

      h2 {
        margin: 0;
        font-size: clamp(2rem, 2.4vw, 3rem);
        font-weight: 820;
      }

      p {
        margin-top: 0.8rem;
        color: $secondary-text-color;
        font-size: 1.4rem;
      }
    }

    .form-stack {
      display: grid;
      gap: 1.4rem;

      label {
        display: grid;
        gap: 0.6rem;

        span {
          color: $secondary-text-color;
          font-size: 1.3rem;
        }
      }
    }

    .helper-copy {
      margin-bottom: 1.4rem;
      color: $secondary-text-color;
      font-size: 1.35rem;
      line-height: 1.7;
    }

    .tracking-alert {
      margin-top: 1.6rem;
    }

    .tracking-code {
      margin: 0.8rem 0;
      padding: 0.8rem 1.2rem;
      border: 1px dashed $surface-border;
      border-radius: 8px;
      background: $surface-control;
      color: $main-text-color;
      font-size: 2rem;
      font-weight: 820;
      letter-spacing: 0.08em;
      cursor: $hover-cursor;
    }

    .query-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1rem;
    }

    .query-result,
    .public-item {
      margin-top: 1.6rem;
      padding: 1.6rem;
      border: 1px solid $surface-border;
      border-radius: 8px;
      background: $surface-control;
    }

    .query-empty {
      margin-top: 1.6rem;
    }

    .result-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      align-items: center;
      margin-bottom: 1rem;
      color: $secondary-text-color;
      font-size: 1.25rem;
    }

    .preserve-text {
      white-space: pre-wrap;
      line-height: 1.8;
    }

    .answer-text {
      color: $main-text-color;
    }

    .muted-text {
      color: $secondary-text-color;
    }

    .public-list {
      display: grid;
      gap: 1.2rem;
    }

    .qa-block + .qa-block {
      margin-top: 1.4rem;
    }

    .qa-label {
      display: inline-block;
      margin-bottom: 0.6rem;
      color: $secondary-text-color;
      font-size: 1.2rem;
      letter-spacing: 0.08em;
    }

    .load-more-row {
      display: flex;
      justify-content: center;
      margin-top: 1.6rem;
    }

    .message-card {
      min-height: 30vh;
      color: $main-text-color;
    }

    .message-parting {
      margin-left: 3.2rem;
      border-left: 1px solid rgba(101, 112, 106, 0.28);
    }

    .add-more-btn {
      transform: translateX(-50%);
    }

    .no-more-line {
      margin: 1rem 0 0 6rem;
      padding: 1.6rem 0 0;
      border-top: solid 1px rgba(101, 112, 106, 0.24);
      color: $secondary-text-color;
      font-size: 1.4rem;
    }

    .md-view-box {
      border-radius: 8px;
      border: 1px solid $surface-border;
      background: $surface-glass;
      box-shadow: $surface-inner-highlight, $surface-shadow-soft;
      backdrop-filter: blur(18px) saturate(160%);

      .view-box-top-bar {
        border-bottom: 1px solid rgba(101, 112, 106, 0.18);
        background: $surface-control;

        .message-text {
          h4 {
            font-size: 1.6rem;
            font-weight: 820;
          }

          p {
            color: $secondary-text-color;
            font-size: 1.25rem;
          }
        }
      }
    }

    .child-message-box {
      .child-md-view {
        padding: 1rem 2rem;
        background-color: transparent !important;
      }

      .username {
        color: $main-text-color;
        font-size: $small-font-size;
      }

      .actions {
        cursor: $hover-cursor;
        color: $main-text-color;

        &:hover {
          color: $main-text-color;
        }
      }

      .child-message-parting {
        border-left: 1px solid rgba(101, 112, 106, 0.28);
      }
    }

    @media (max-width: 767px) {
      .message-toolbar {
        align-items: stretch;
      }

      .section-tabs,
      .mobile-toolbar-actions {
        width: 100%;
      }

      .section-tabs :deep(.ant-space-item) {
        flex: 1;
      }

      .section-tabs :deep(.ant-btn) {
        width: 100%;
      }

      .mobile-toolbar-actions {
        justify-content: flex-end;
        margin-left: 0;
      }
    }
  }
}

.model-content {
  color: $main-text-color;
  height: 60vh;
  display: flex;
  flex-direction: column;

  .message-md-editor {
    flex: 1;
    min-height: 320px;
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
}

.user-outlined {
  background-color: #585858;
}
</style>
<style>
.md-editor-toolbar-wrapper {
  overflow: auto;
}

.md-editor-dropdown {
  /* position: fixed; */
}

/* .md-editor-toolbar-wrapper .md-editor-toolbar-left, .md-editor-toolbar-wrapper .md-editor-toolbar-right {
    flex-wrap: wrap;
    padding: 0;
} */
</style>
