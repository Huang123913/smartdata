<script lang="ts" setup></script>

<template>
  <div class="chat-playground-view">
    <div class="left-container"><SmartdataChatPlaygroundViewLeft /></div>
    <div class="right-container"><SmartdataChatPlaygroundViewRight /></div>
  </div>
</template>

<style scoped lang="scss">
.chat-playground-view {
  width: 100%;
  display: flex;
  height: calc(100vh - var(--topbar-height));
  overflow: hidden;
  .left-container,
  .right-container {
    width: 50%;
    height: 100%;
  }
}
</style>
