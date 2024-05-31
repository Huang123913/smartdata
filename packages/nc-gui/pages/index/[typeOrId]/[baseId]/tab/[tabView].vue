<script setup lang="ts">
const route = useRoute()
const activeKey = ref('consoleDesk')
const { isMobileMode } = useGlobal()
watch(
  () => route.fullPath,
  () => {
    activeKey.value = route.fullPath.indexOf('playground') > -1 ? 'playground' : 'consoleDesk'
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="!isMobileMode">
    <div v-show="activeKey === 'playground'" class="h-full nc-base-view">
      <SmartdataToolbar />
      <SmartdataChatPlaygroundView />
    </div>
    <ProjectView v-show="activeKey === 'consoleDesk'" />
  </div>
</template>
