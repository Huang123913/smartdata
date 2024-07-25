<script setup lang="ts">
import { iconMap } from '#imports'
import type { TableType } from 'nocodb-sdk'

import { useIntelligentQuestionStore } from '../../../store/intellignetQuestion.ts'

const { base } = storeToRefs(useBase())
const { isMobileMode } = useGlobal()
const store = useIntelligentQuestionStore()
const { isIntelligentQuestionOpen, baseUrl, conversationId } = storeToRefs(store)
const { getBaseUrl } = store
const { $api } = useNuxtApp()
const { activeTableId, activeTable } = storeToRefs(useTablesStore())
const { meta } = useSmartsheetStoreOrThrow()
const isCreateing = ref(false)
const analysis = async () => {
  try {
    if (isIntelligentQuestionOpen.value) return
    if (!baseUrl.value) getBaseUrl()
    if (conversationId.value[activeTableId.value]) {
      isIntelligentQuestionOpen.value = true
      return
    }
    let tableInfo = await $api.smartData.entity({
      entityId: activeTableId.value,
    })
    isCreateing.value = true
    let props = tableInfo && tableInfo[0]?.props ? tableInfo[0]?.props : []
    let belongConversationIdProp = props.length ? props.findLast((p) => p.code == 'belongConversationId') : null
    if (belongConversationIdProp) {
      conversationId.value = { key: activeTableId.value, value: belongConversationIdProp.value }
      isIntelligentQuestionOpen.value = true
      return
    }
    let tableData = {}
    let fieldDescriptions = {}
    let response = await $api.dbViewRow.list('noco', base.value.id!, activeTableId.value!, activeTableId.value!)
    let tableDataRes = response.list
    let columns = (meta.value as TableType)?.columns?.filter((item) => !item?.system)
    columns?.map((item) => {
      fieldDescriptions[item.column_name] = item.title
      tableData[item.column_name] = []
    })
    tableDataRes.map((item) => {
      for (const key in tableData) {
        tableData[key].push(item[fieldDescriptions[key]])
      }
    })
    let datafiles = [
      {
        data: tableData,
        field_descriptions: fieldDescriptions,
        name: activeTable.value?.name,
      },
    ]
    let createSessionRes = await $api.smartData.createSession({
      entityId: activeTableId.value,
      datafiles: JSON.stringify(datafiles),
    })
    conversationId.value = { key: activeTableId.value, value: createSessionRes.conversation_id }
    isIntelligentQuestionOpen.value = true
  } catch (error) {
    message.error('会话创建失败')
    console.error(error)
  } finally {
    isCreateing.value = false
  }
}
</script>

<template>
  <NcButton class="nc-toolbar-btn !h-7 !border-0" size="small" type="secondary" @click="analysis">
    <div class="flex items-center gap-1">
      <GeneralLoader v-if="isCreateing" />
      <component v-else :is="iconMap.magic" />
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
