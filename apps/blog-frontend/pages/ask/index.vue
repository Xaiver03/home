<script setup>
definePageMeta({
  layout: 'classics',
});

const originPageSize = 6;
const currentPage = ref(1);
const total = ref(0);
const publicQuestions = ref([]);
const publicLoading = ref(false);
const submitLoading = ref(false);
const queryLoading = ref(false);
const submittedTrackingCode = ref('');
const emptyQueryMessage = ref('');

const questionForm = reactive({
  nickname: '',
  contact: '',
  question: '',
});
const queryForm = reactive({
  trackingCode: '',
});

const statusText = (status) => {
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

const statusColor = (status) => {
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

const loadPublicQuestions = async (page = 1, append = false) => {
  publicLoading.value = true;
  try {
    const res = await api.searchPublicQuestion({
      currentPage: page,
      pageSize: originPageSize,
      data: {},
    });
    total.value = res.count || 0;
    publicQuestions.value = append ? [...publicQuestions.value, ...res.rows] : res.rows;
    currentPage.value = page;
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
  submitLoading.value = true;
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
    submitLoading.value = false;
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

await loadPublicQuestions();
</script>

<template>
  <main id="ask-page" class="content-box blog-page-shell">
    <header class="blog-section-head">
      <div>
        <span class="blog-eyebrow">Anonymous Q&A</span>
        <h1>匿名问答</h1>
      </div>
      <p>你可以匿名提问。提交后记得保存追踪码，之后可以回来查看回复和审核进度。通过审核的内容，才会出现在公开列表里。</p>
    </header>

    <div class="ask-grid">
      <section class="ask-panel blog-glass-panel" v-motion-fade-visible-once>
        <div class="panel-heading">
          <span>01</span>
          <div>
            <h2>提交问题</h2>
            <p>默认不会公开，只有站长能看到。是否公开，会根据内容再决定。</p>
          </div>
        </div>
        <p class="helper-copy">提交成功后会生成追踪码，记得保存，后面查询回复要用。</p>
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
          <button class="blog-action" type="button" :disabled="submitLoading" @click="submitQuestion">
            {{ submitLoading ? '提交中...' : '提交问题' }} <span aria-hidden="true">→</span>
          </button>
        </div>
        <a-alert
          v-if="submittedTrackingCode"
          class="tracking-alert"
          type="success"
          show-icon
          message="提问已收到"
        >
          <template #description>
            <p>你的追踪码是：</p>
            <button class="tracking-code" type="button" @click="copyTrackingCode(submittedTrackingCode)">
              {{ submittedTrackingCode }}
            </button>
            <p>这串追踪码只会出现这一次，记得截图或复制保存。</p>
            <p>之后查询回复，需要用到它。</p>
          </template>
        </a-alert>
      </section>

      <section class="ask-panel blog-glass-panel" v-motion-fade-visible-once>
        <div class="panel-heading">
          <span>02</span>
          <div>
            <h2>查询回复</h2>
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
            <a-tag :color="statusColor(queryResult.status)">{{ statusText(queryResult.status) }}</a-tag>
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
    </div>

    <section class="ask-panel public-panel blog-glass-panel" v-motion-fade-visible-once>
      <div class="panel-heading">
        <span>03</span>
        <div>
          <h2>公开问答</h2>
          <p>这里只展示已通过审核、允许公开，并且已经回复的问题。</p>
        </div>
      </div>
      <p class="helper-copy">也许你想问的问题，别人已经先问过了。</p>
      <RepeatEmptyPlaceholder :dataReady="Boolean(publicQuestions)" :dataShow="publicQuestions.length > 0">
        <div class="public-list">
          <article v-for="item in publicQuestions" :key="item.id" class="public-item">
            <div class="result-meta">
              <span>{{ item.nickname || '匿名访客' }}</span>
              <span>{{ utils.formatDate(item.answerTime || item.updatedTime, true) }}</span>
            </div>
            <h3>{{ item.question }}</h3>
            <p class="preserve-text answer-text">{{ item.answer }}</p>
          </article>
        </div>
        <div v-if="publicQuestions.length < total" class="load-more-row">
          <button class="blog-action secondary" type="button" :disabled="publicLoading" @click="loadPublicQuestions(currentPage + 1, true)">
            {{ publicLoading ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </RepeatEmptyPlaceholder>
    </section>
  </main>
</template>

<style lang="scss" scoped>
#ask-page {
  .ask-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
    max-width: 112rem;
    width: 100%;
    margin: 0 auto 2rem;
  }

  .ask-panel {
    padding: 2.4rem;
    color: $main-text-color;
  }

  .public-panel {
    max-width: 112rem;
    width: 100%;
    margin: 0 auto;
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

  .load-more-row {
    display: flex;
    justify-content: center;
    margin-top: 1.6rem;
  }

  @media screen and (max-width: 768px) {
    .ask-grid {
      grid-template-columns: 1fr;
    }

    .query-row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
