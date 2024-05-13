<script lang="ts" setup>
const props = defineProps<{
  isShow: boolean
}>()
</script>

<template>
  <div class="loading-content" :style="{ display: isShow ? 'flex' : 'none' }">
    <a-spin size="large" />
  </div>
</template>

<style scoped lang="scss">
.loading-content {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999999;
  .ant-spin {
    margin: auto !important;
  }
  ::v-deep .ant-spin-dot-item {
    background-color: rgb(25, 118, 210);
  }
}
</style>
