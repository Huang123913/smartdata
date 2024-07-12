<script setup lang="ts">
import { iconMap } from '#imports'

import { useIntelligentQuestionStore } from '../../../store/intellignetQuestion.ts'

const { isMobileMode } = useGlobal()
const { $api } = useNuxtApp()
const { isIntelligentQuestionOpen } = storeToRefs(useIntelligentQuestionStore())
const analysis = async () => {
  const data = {
    entityId: '38318c433f0adf465e0c9c945fc55fc2',
    columnJson: '["projectName","projectType","description"]',
    fileId: 'ff80818190a6643c0190a669fb381cdb',
  }
  await $api.smartData.toBeProcessed({
    entityId: data.entityId,
    columnsJson: data.columnJson,
    fileId: data.fileId,
  })
  isIntelligentQuestionOpen.value = !isIntelligentQuestionOpen.value
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
