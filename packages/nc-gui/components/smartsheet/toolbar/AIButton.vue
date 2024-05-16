<script setup lang="ts">
import { iconMap } from '#imports'

const { isMobileMode } = useGlobal()
</script>

<template>
  <div>
    <a-button class="nc-btn-find-row-by-scan nc-toolbar-btn">
      <div class="flex items-center gap-1">
        <component :is="iconMap.magic" />
        <span v-if="!isMobileMode" class="!text-xs font-weight-normal">智能分析</span>
      </div>
    </a-button>
  </div>
</template>
