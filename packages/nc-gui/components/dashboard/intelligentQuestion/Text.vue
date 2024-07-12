<script lang="ts" setup>
import { marked } from 'marked'

const props = defineProps<{
  data: any
}>()

const markdowmText = computed(() => {
  return marked(props.data)
})
</script>

<template>
  <div class="markdown-content" v-html="markdowmText"></div>
</template>

<style lang="scss">
.markdown-content {
  p {
    @apply !mb-1;
    white-space: pre-wrap; /* 保持换行格式 */
  }

  ul,
  ol {
    padding-left: 2em;
  }

  ul {
    list-style-type: disc; /* 确保使用默认的列表项样式 */
  }

  ol {
    list-style-type: decimal; /* 确保有序列表项显示数字 */
  }

  ul li,
  ol li {
    margin-bottom: 0.5em;
  }

  pre {
    border-color: #d0d5dd;
    border: 1px;
    color: black;
    font-family: 'JetBrainsMono', monospace;
    padding: 1rem;
    border-radius: 0.5rem;
    @apply overflow-auto mt-3 bg-gray-100;
    white-space: pre-wrap;

    code {
      white-space: pre-wrap;
      @apply !px-0;
    }
  }

  code {
    @apply rounded-md px-2 py-1 bg-gray-100;
    color: inherit;
    font-size: 0.8rem;
  }

  h1 {
    font-weight: 700;
    font-size: 1.85rem;
    margin-bottom: 1rem;
    line-height: 36px;
  }

  h2 {
    font-weight: 600;
    font-size: 1.55rem;
    margin-bottom: 0.7em;
    line-height: 30px;
  }

  h3 {
    font-weight: 600;
    font-size: 1.35rem;
    margin-bottom: 0.7em;
    line-height: 24px;
  }

  h4 {
    font-weight: 800;
    font-size: 1rem;
    margin-bottom: 0.7rem;
  }

  h5 {
    font-weight: 800;
    font-size: 0.9rem;
    margin-bottom: 0.7rem;
  }

  h6 {
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 0.1rem;
  }
  blockquote {
    border-left: 3px solid #d0d5dd;
    padding: 0 1em;
    color: #666;
    margin: 1em 0;
  }

  hr {
    @apply !border-gray-300;
    border: 0;
    border-top: 2px solid #ccc;
    margin: 1.5em 0;
  }

  pre {
    height: fit-content;
  }
}
</style>
