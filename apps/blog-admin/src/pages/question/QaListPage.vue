<template>
  <div id="qa-list-page">
    <a-space class="text-nowrap px-1 py-3 flex items-center justify-center" size="middle" wrap>
      追踪码
      <a-input v-model:value="searchData.trackingCode" placeholder="请输入追踪码" style="width: 18rem" />
      内容
      <a-input v-model:value="searchData.keyword" placeholder="搜索问题/回答" style="width: 20rem" />
      时间
      <a-range-picker v-model:value="searchData.time" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']" style="width: 25rem" />
      <a-select v-model:value="searchData.status" mode="multiple" style="width: 18rem" placeholder="审核状态" :options="statusOptions" />
      <a-select v-model:value="searchData.isPublic" style="width: 14rem" placeholder="公开状态" :options="publicOptions" allow-clear />
      <a-button @click="search">搜索</a-button>
      <a-button @click="clear">清空</a-button>
    </a-space>

    <a-table :columns="columns" :data-source="listData" :pagination="pagination" :rowKey="record => record.id" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'trackingCode'">
          <a-tag color="blue">{{ record.trackingCode }}</a-tag>
        </template>
        <template v-else-if="column.key === 'question'">
          <div class="question-cell">{{ record.question }}</div>
        </template>
        <template v-else-if="column.key === 'answer'">
          <a-tag :color="record.answer ? 'success' : 'default'">{{ record.answer ? '已回答' : '未回答' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="statusColor(record.status)">{{ statusText(record.status) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'isPublic'">
          <a-tag :color="record.isPublic ? 'green' : 'default'">{{ record.isPublic ? '公开' : '私密' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'createTime'">
          {{ utils.formatDate(record.createTime, true) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" @click="openEdit(record)">审核/回答</a-button>
            <a-button type="link" danger @click="deleteQuestion(record)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="editModalOpen" title="审核匿名问答" ok-text="保存" cancel-text="取消" width="760px" @ok="saveQuestion">
      <div class="edit-stack">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="ID">{{ currentQuestion.id }}</a-descriptions-item>
          <a-descriptions-item label="追踪码">{{ currentQuestion.trackingCode }}</a-descriptions-item>
          <a-descriptions-item label="昵称">{{ currentQuestion.nickname || '匿名访客' }}</a-descriptions-item>
          <a-descriptions-item label="联系方式">{{ currentQuestion.contact || '-' }}</a-descriptions-item>
          <a-descriptions-item label="提交时间">{{ currentQuestion.createTime ? utils.formatDate(currentQuestion.createTime, true) : '-' }}</a-descriptions-item>
          <a-descriptions-item label="回答时间">{{ currentQuestion.answerTime ? utils.formatDate(currentQuestion.answerTime, true) : '-' }}</a-descriptions-item>
        </a-descriptions>

        <label>
          <span>问题</span>
          <a-textarea v-model:value="currentQuestion.question" :rows="5" :maxlength="1500" show-count />
        </label>
        <label>
          <span>回答</span>
          <a-textarea v-model:value="currentQuestion.answer" :rows="8" placeholder="填写回答后，可将审核状态设为通过。公开展示必须先审核通过。" />
        </label>
        <div class="control-grid">
          <label>
            <span>审核状态</span>
            <a-select v-model:value="currentQuestion.status" :options="statusOptions" style="width: 100%" />
          </label>
          <label>
            <span>公开展示</span>
            <a-switch v-model:checked="currentQuestion.isPublic" checked-children="公开" un-checked-children="私密" />
          </label>
        </div>
        <a-alert type="info" show-icon message="发布规则">
          <template #description>
            匿名问答必须先审核通过，并且已填写回答后，才能公开展示到前台公开列表。
          </template>
        </a-alert>
        <label>
          <span>后台备注</span>
          <a-textarea v-model:value="currentQuestion.remark" :rows="3" />
        </label>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import utils from '@/utils';
import { reactive, ref, computed, getCurrentInstance, onMounted, createVNode } from 'vue';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

const { proxy } = getCurrentInstance();
const originPageSize = 10;
const currentPage = ref(1);
const pageSize = ref(originPageSize);
const total = ref(0);
const listData = ref([]);
const searchOrNot = ref(false);
const editModalOpen = ref(false);
const currentQuestion = reactive({});

const statusOptions = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '不通过' },
  { value: 'archived', label: '封存' },
];
const publicOptions = [
  { value: true, label: '公开' },
  { value: false, label: '私密' },
];
const searchData = reactive({
  order: '[["createTime", "DESC"]]',
});

const columns = [
  { title: '追踪码', key: 'trackingCode', dataIndex: 'trackingCode', width: 150 },
  { title: '问题', key: 'question', dataIndex: 'question' },
  { title: '回答', key: 'answer', dataIndex: 'answer', width: 100 },
  { title: '审核状态', key: 'status', dataIndex: 'status', width: 120 },
  { title: '公开', key: 'isPublic', dataIndex: 'isPublic', width: 90 },
  { title: '提交时间', key: 'createTime', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 160 },
];

const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  onChange: pageChange,
  showTotal: (totals) => `共 ${totals} 条数据`,
}));

const statusText = (status) => {
  switch (status) {
    case 'approved':
      return '审核通过';
    case 'rejected':
      return '不通过';
    case 'archived':
      return '封存';
    default:
      return '待审核';
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

const pageChange = (page) => {
  currentPage.value = page;
  searchOrNot.value ? search(true) : getListData(true);
};

const getListData = (pageChangeOrNot = false) => {
  if (!pageChangeOrNot) currentPage.value = 1;
  pageSize.value = originPageSize;
  proxy.$api.getQuestionList([currentPage.value, pageSize.value], { order: '[["createTime", "DESC"]]' }).then((res) => {
    total.value = res.count;
    listData.value = res.rows;
  });
};

const search = (pageChangeOrNot = false) => {
  searchOrNot.value = true;
  if (!pageChangeOrNot) currentPage.value = 1;
  pageSize.value = originPageSize;
  proxy.$api.searchQuestion({ data: searchData, currentPage: currentPage.value, pageSize: pageSize.value }).then((res) => {
    total.value = res.count;
    listData.value = res.rows;
  });
};

const clear = () => {
  currentPage.value = 1;
  Object.keys(searchData).forEach((key) => {
    if (key === 'order') return;
    searchData[key] = key === 'status' ? [] : null;
  });
  searchOrNot.value = false;
  getListData();
};

const openEdit = (record) => {
  Object.keys(currentQuestion).forEach((key) => delete currentQuestion[key]);
  utils.currentDataChange(record, currentQuestion);
  editModalOpen.value = true;
};

const saveQuestion = () => {
  if (currentQuestion.isPublic && currentQuestion.status !== 'approved') {
    Modal.warning({ title: '不能公开', content: '匿名问答必须审核通过后才能公开展示。' });
    return;
  }
  if (currentQuestion.isPublic && utils.isNullOrEmpty(currentQuestion.answer)) {
    Modal.warning({ title: '不能公开', content: '请先填写回答，再公开展示。' });
    return;
  }
  proxy.$api.updateQuestion(currentQuestion).then((res) => {
    if (utils.analysisData(res)) {
      editModalOpen.value = false;
      searchOrNot.value ? search(true) : getListData(true);
    }
  });
};

const deleteQuestion = (record) => {
  Modal.confirm({
    title: '确定删除该匿名问答吗？',
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      proxy.$api.deleteQuestionById({ id: record.id }).then((res) => {
        if (utils.analysisData(res)) getListData();
      });
    },
  });
};

onMounted(() => {
  getListData();
});
</script>

<style lang="scss" scoped>
#qa-list-page {
  .question-cell {
    max-width: 38rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .edit-stack {
    display: grid;
    gap: 1.6rem;

    label {
      display: grid;
      gap: 0.6rem;
    }
  }

  .control-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.6rem;
    align-items: end;
  }
}
</style>
