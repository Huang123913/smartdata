<script setup lang="ts">
import { iconMap } from '#imports'

const { isMobileMode } = useGlobal()
</script>

<template>
  <NcTooltip placement="right">
    <template #title> 该模块建议中，敬请期待 </template>
    <NcButton class="nc-toolbar-btn !h-7 !border-0" size="small" type="secondary">
      <div class="flex items-center gap-1">
        <component :is="iconMap.magic" />
        <span v-if="!isMobileMode" class="!text-xs font-weight-normal">智能分析</span>
      </div>
    </NcButton>
  </NcTooltip>
</template>
