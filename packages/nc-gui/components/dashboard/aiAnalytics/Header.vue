<script lang="ts" setup>
import type { TableType } from 'nocodb-sdk'

import { useaiAnalyticsStore } from '../../../store/aiAnalytics'

const props = defineProps<{
  clearAllSession: () => void
  isSending: boolean
}>()

const { activeTable, activeTableId } = storeToRefs(useTablesStore())
const { isIntelligentQuestionOpen, conversationId, metaData } = storeToRefs(useaiAnalyticsStore())
const clicked = ref(false)
const { createNewSession } = useChataiStore()

const { $api } = useNuxtApp()
const { base } = storeToRefs(useBase())
const isShowLoading = ref(false)
const route = useRoute()

const newSessionHandle = () => {
  if (route.name === 'chat-ai') {
    createNewSession([])
  } else {
    createNewSessionInTable()
  }
}

const createNewSessionInTable = async () => {
  try {
    isShowLoading.value = true
    clicked.value = false
    let tableData: { [key: string]: any } = {}
    let fieldDescriptions: { [key: string]: any } = {}
    let response = await $api.dbViewRow.list('noco', base.value.id!, activeTableId.value!, activeTableId.value!)
    let tableDataRes = response?.list
    let columns = (metaData.value as TableType)?.columns?.filter((item) => !item?.system)
    columns?.map((item) => {
      fieldDescriptions[item.column_name!] = item.title
      tableData[item.column_name!] = []
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
      isUpdateSession: true,
    })
    if (createSessionRes?.conversation_id) {
      conversationId.value = { key: activeTableId.value, value: createSessionRes.conversation_id }
    }
    props.clearAllSession()
  } catch (error) {
    throw error
  } finally {
    isShowLoading.value = false
  }
}

const handleClickChange = (visible: boolean) => {
  if (props.isSending) return
  if (!visible) clicked.value = visible
}
</script>

<template>
  <div class="ai-analytics-header border-b-1 border-gray-200 group flex items-center md:(px-2 py-1.2) xs:(px-1 py-1)">
    <div class="table-name">{{ activeTable?.title || 'chatai' }}</div>
    <div class="right">
      <NcDropdown :placement="'bottomRight'" :trigger="['click']" :visible="clicked" @visibleChange="handleClickChange">
        <GeneralBaseIcon
          @click="
          (e:any) => {
            clicked = true
          }
        "
          :style="{ marginRight: '8px', marginTop: '1px' }"
        >
          <svg
            t="1722322194035"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="3849"
            width="20"
            height="20"
          >
            <path
              d="M419.037 287.953h413.124c17.673 0 32-14.327 32-32s-14.327-32-32-32H419.037c-17.673 0-32 14.327-32 32s14.327 32 32 32zM419.028 543.17h411.608c17.673 0 32-14.327 32-32s-14.327-32-32-32H419.028c-17.673 0-32 14.327-32 32s14.327 32 32 32zM832.161 735.802H419.037c-17.673 0-32 14.327-32 32s14.327 32 32 32h413.124c17.673 0 32-14.327 32-32s-14.327-32-32-32z"
              fill="#707070"
              p-id="3850"
            ></path>
            <path d="M256.037 255.953m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#707070" p-id="3851"></path>
            <path d="M256.037 510.787m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#707070" p-id="3852"></path>
            <path d="M256.037 767.621m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#707070" p-id="3853"></path>
          </svg>
        </GeneralBaseIcon>
        <template #overlay>
          <NcMenu>
            <NcMenuItem @click="newSessionHandle()">
              <div class="flex gap-2 items-center">
                <GeneralIcon icon="plus" class="text-gray-700" />
                {{ '新会话' }}
              </div>
            </NcMenuItem>

            <NcMenuItem v-if="route.name === 'chat-ai'">
              <div class="flex gap-2 items-center">
                <GeneralIcon icon="list" class="text-gray-700" />
                {{ '会话结果存储记录' }}
              </div>
            </NcMenuItem>

            <NcMenuItem @click="clearAllSession()">
              <div v-e="['c:table:duplicate']" class="flex gap-2 items-center">
                <GeneralIcon icon="delete" class="text-gray-700" />
                {{ '清空会话记录' }}
              </div>
            </NcMenuItem>
          </NcMenu>
        </template>
      </NcDropdown>
      <NcButton
        v-if="activeTable?.title"
        type="text"
        size="small"
        class="nc-sidebar-left-toggle-icon !text-gray-700 !hover:text-gray-800 !xs:(h-10.5 max-h-10.5 max-w-10.5) !md:(hover:bg-gray-200)"
        @click="isIntelligentQuestionOpen = !isIntelligentQuestionOpen"
      >
        <div class="flex items-center text-inherit">
          <GeneralIcon
            icon="doubleRightArrow"
            class="duration-150 transition-all !text-lg -mt-0.5 !text-gray-500/75 rotate-180"
          />
        </div>
      </NcButton>
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
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
  .right {
    display: flex;
    align-items: center;
  }
}
</style>
