<!-- 经典布局，头部，内容区，底部 -->
<script setup>

</script>

<template>
    <div id="classics-layout" >
        <CommonNaviHeader></CommonNaviHeader>
        <div id="content">
            <slot></slot>
        </div>
        <CommonBottomContent></CommonBottomContent>
        <RepeatFlexedTool></RepeatFlexedTool>
    </div>
</template>

<style lang="scss" scoped>
#classics-layout {
    background-color: $main-background-color;
    color: $main-text-color;

    #content {
        min-height: calc(100dvh - 11rem);
    }

    @media (max-width: 640px) {
        #content {
            padding-bottom: calc(7.6rem + env(safe-area-inset-bottom));
        }
    }

}
</style>
