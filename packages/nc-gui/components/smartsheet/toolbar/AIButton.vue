<script setup lang="ts">
import { iconMap } from '#imports'

import { useIntelligentQuestionStore } from '../../../store/intellignetQuestion.ts'

const { isMobileMode } = useGlobal()
const { isIntelligentQuestionOpen } = storeToRefs(useIntelligentQuestionStore())
const { $api } = useNuxtApp()
const analysis = async () => {
  isIntelligentQuestionOpen.value = true
}
</script>

<template>
  <NcButton class="nc-toolbar-btn !h-7 !border-0" size="small" type="secondary" @click="analysis">
    <div class="flex items-center gap-1">
      <component :is="iconMap.magic" />
      <span v-if="!isMobileMode" class="!text-xs font-weight-normal">智能分析</span>
    </div>
  </NcButton>
  <!-- <NcTooltip placement="right">
    <template #title> 该模块建议中，敬请期待 </template>
    <NcButton class="nc-toolbar-btn !h-7 !border-0" size="small" type="secondary" @click="analysis">
      <div class="flex items-center gap-1">
        <component :is="iconMap.magic" />
        <span v-if="!isMobileMode" class="!text-xs font-weight-normal">智能分析</span>
      </div>
    </NcButton>
  </NcTooltip> -->
</template>
