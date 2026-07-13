<script setup>
import { MdPreview } from 'md-editor-v3';
// preview.css相比style.css少了编辑器那部分样式
import 'md-editor-v3/lib/preview.css';
const props = defineProps({
  mdContent: {
    type: String,
    default: '',
  }, // 文章的md内容
  onGetCatalog: {
    type: Function,
    default: () => {},
  }, // 获取目录的事件回调，返回数组[]，当前的preview的目录内容
  onHtmlChanged: {
    type: Function,
    default: () => {},
  }, // html内容变化的事件回调，返回string，当前的preview的html内容
});
</script>

<template>
  <MdPreview
    class="preview"
    editorId="preview"
    :modelValue="props.mdContent"
    @GetCatalog="props.onGetCatalog"
    @HtmlChanged="props.onHtmlChanged"
  />
</template>

<style lang="scss" scoped>
.preview {
  padding: 0;
}

:deep(.md-editor-preview-wrapper) {
  padding: 0;
}

:deep(#preview) {
  color: $main-text-color;
  background: transparent;
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

:deep(#preview h1),
:deep(#preview h2),
:deep(#preview h3) {
  color: $main-text-color;
  font-weight: 820;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

:deep(#preview p),
:deep(#preview li),
:deep(#preview blockquote),
:deep(#preview span) {
  font-size: 1.75rem;
  line-height: 1.85;
}

:deep(#preview p),
:deep(#preview ul),
:deep(#preview ol),
:deep(#preview blockquote) {
  max-width: 72ch;
}

:deep(#preview blockquote) {
  margin: 2rem 0;
  padding: 1.2rem 1.6rem;
  border-left: 4px solid $main-color;
  background: rgba(255, 255, 255, 0.46);
  border-radius: 0 8px 8px 0;
  color: $secondary-text-color;
}

:deep(#preview figure) {
  max-width: min(100%, 88rem);
  margin: 3rem auto;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 18px 58px rgba(23, 32, 29, 0.12);
}

:deep(#preview figure img) {
  width: 100%;
  height: auto;
  display: block;
}

:deep(#preview pre),
:deep(#preview code) {
  border-radius: 8px;
}
</style>
