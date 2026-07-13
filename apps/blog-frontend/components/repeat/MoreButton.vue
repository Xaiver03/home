<script setup>
const props = defineProps({
  text: {
    type: String,
    default: '查看更多',
  },
  clickEvent: {
    type: Function,
    default: () => {
      console.log('该组件使用clickEvent来绑定点击回调事件');
    },
  },
});
</script>

<template>
  <button class="more blog-action" type="button" @click="props.clickEvent">
    <span>{{ props.text }}</span>
    <span aria-hidden="true">→</span>
  </button>
</template>

<style lang="scss" scoped>
.more {
  width: min(100%, 38rem);
  margin: 2rem auto 0;
}
</style>
