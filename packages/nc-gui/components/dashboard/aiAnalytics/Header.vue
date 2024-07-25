<script lang="ts" setup>
import { useaiAnalyticsStore } from '../../../store/aiAnalytics'

const { activeTable } = storeToRefs(useTablesStore())
const { isIntelligentQuestionOpen } = storeToRefs(useaiAnalyticsStore())
</script>

<template>
  <div class="ai-analytics-header border-b-1 border-gray-200 group flex items-center md:(px-2 py-1.2) xs:(px-1 py-1)">
    <div class="table-name">{{ activeTable?.title }}</div>
    <NcButton
      type="text"
      size="small"
      class="nc-sidebar-left-toggle-icon !text-gray-700 !hover:text-gray-800 !xs:(h-10.5 max-h-10.5 max-w-10.5) !md:(hover:bg-gray-200)"
      @click="isIntelligentQuestionOpen = !isIntelligentQuestionOpen"
    >
      <div class="flex items-center text-inherit">
        <GeneralIcon icon="doubleRightArrow" class="duration-150 transition-all !text-lg -mt-0.5 !text-gray-500/75 rotate-180" />
      </div>
    </NcButton>
  </div>
</template>

<style lang="scss" scoped>
.ai-analytics-header {
  height: var(--topbar-height);
  justify-content: space-between;
  font-weight: 600;
  color: #1f293a;
  .table-name {
    margin-left: 4px;
  }
}
</style>
