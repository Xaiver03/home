<script setup>
import { COMPANY_BRAND } from '~/composables/companyBrand';
const getDateBefore = (date) => { // 获取日期与现在之间的天数
  // 将输入的日期字符串转换为 Date 对象
  const targetDate = typeof date == 'Date' ? date :new Date(date);
  // 获取当前日期
  const currentDate = new Date();
  // 计算两个日期之间的毫秒差异
  const timeDifference = currentDate - targetDate;
  // 将毫秒差异转换为天数
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return daysDifference;
}
let beforeDate = ref(0) // 发电天数
onMounted(() => {
  beforeDate.value = getDateBefore('2025/04/09')
})
</script>

<template>
  <div id="bottom" class="w-full py-12 ">
    <div class="h-full mx-auto w-3/5 my-0 flex flex-col justify-around ">
      <div>Designed and developed by {{ COMPANY_BRAND.name }}</div>
      <div>本站已经持续运行 <span class="main-color">{{ beforeDate }}</span> 天</div>
      <a-divider class="text-second-color">技术创造能力，人文定义方向</a-divider>
      <div class="flex justify-between">
        <div>Copyright © 2024-2029 <a href="/">{{ COMPANY_BRAND.legalName }}</a></div>
        <span>文章版权以页面声明为准</span>
      </div>
      <a href="https://beian.miit.gov.cn" target="_blank">湘ICP备2026026942号-1</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#bottom {
  background-color: $main-car-color;
  font-size: $xx-small-font-size;
  color: $secondary-text-color;

  .main-color {
    color: $main-color;
  }
  .text-second-color {
    color: $secondary-text-color;
  }

}
</style>
