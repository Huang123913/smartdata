<script lang="ts" setup>
const props = defineProps<{
  isSending: boolean
}>()
</script>

<template>
  <div class="loading-container" v-if="isSending">
    <div class="loading-circle" v-for="n in 3" :key="n" :class="'circle-' + n"></div>
  </div>
</template>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.loading-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #3498db;
  opacity: 0.3;
  animation: pulse 1.5s infinite;
  margin-right: 5px;
}

.circle-1 {
  animation-delay: 0s;
}

.circle-2 {
  animation-delay: 0.5s;
}

.circle-3 {
  animation-delay: 1s;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
</style>
