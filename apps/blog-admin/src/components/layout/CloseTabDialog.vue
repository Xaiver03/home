<template>
  <a-modal
    :open="visible"
    title="关闭确认"
    :mask-closable="false"
    :keyboard="false"
    ok-text="保存并关闭"
    cancel-text="直接关闭"
    @ok="onSaveAndClose"
    @cancel="onCloseWithoutSave"
  >
    <p>页面「{{ tabTitle }}」有未保存的更改，是否保存后再关闭？</p>
    <template #footer>
      <a-button @click="onCancel">取消</a-button>
      <a-button danger @click="onCloseWithoutSave">直接关闭</a-button>
      <a-button type="primary" @click="onSaveAndClose">保存并关闭</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  tab: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['save-and-close', 'close-without-save', 'cancel']);

const tabTitle = computed(() => props.tab?.title || '');

function onSaveAndClose() {
  emit('save-and-close', props.tab);
}

function onCloseWithoutSave() {
  emit('close-without-save', props.tab);
}

function onCancel() {
  emit('cancel');
}
</script>
