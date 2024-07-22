<script lang="ts" setup>
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { ArrowRightOutlined } from '@ant-design/icons-vue'

import { useIntelligentQuestionStore } from '../../store/intellignetQuestion'

const { t } = useI18n()
const { $api } = useNuxtApp()
const { copy } = useCopy()
const store = useIntelligentQuestionStore()
const { dialogList, baseUrl, conversationId } = storeToRefs(store)

const scrollContainer = ref(null)
const isSending = ref(false)

const { activeTableId } = storeToRefs(useTablesStore())

//发送
const handleSend = async (searchValue: string, callback: () => void) => {
  try {
    if (!searchValue.trim() || isSending.value) return
    isSending.value = true
    dialogList.value = {
      key: activeTableId.value,
      value: [
        ...dialogList.value,
        {
          id: uuidv4(),
          isQuestion: true,
          messages: searchValue,
        },
      ],
    }
    scrollToBottom()
    let res = await $api.smartData.talktodata({
      conversation_id: conversationId.value[activeTableId.value],
      datatype: 'text',
      question: searchValue,
    })
    dialogList.value = {
      key: activeTableId.value,
      value: [
        ...dialogList.value,
        {
          type: 'md',
          id: '1',
          isQuestion: false,
          data: `${res.response}`,
          questions: res.questions,
        },
      ],
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSending.value = false
    callback()
  }
}

const scrollToBottom = (isAnimated: boolean = false) => {
  nextTick(() => {
    if (scrollContainer.value) {
      const container = scrollContainer.value
      if (isAnimated) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }
  })
}

const contentWidth = computed(() => {
  if (scrollContainer.value) return scrollContainer.value.offsetWidth
  return 0
})

const deleteMessage = (deleteItem: any) => {
  let newDialogList = _.cloneDeep(dialogList.value)
  newDialogList = newDialogList.filter((item) => item.id !== deleteItem.id)
  dialogList.value = { key: activeTableId.value, value: newDialogList }
}

const onCopyToClipboard = async (text: string) => {
  try {
    await copy(text)
    message.info(t('msg.info.copiedToClipboard'))
  } catch (e: any) {
    message.error(e.message)
  }
}

//下载
const download = (item: any, isAll: boolean, index: number) => {
  let fileIds = 'ff80818190bfd6f90190bffc353f23ba'
  let isDownLoadFile = true
  const host = window.location.host
  const token = {
    data: {
      dataId: fileIds,
      isMulti: false,
    },
  }
  const url = `module-operation!executeOperation?operation=${isDownLoadFile ? 'FileDown' : 'PreviewFileIcon'}`
  const uploadURL = `${baseUrl.value}/${url}&token=${encodeURI(JSON.stringify(token))}`
  let link = document.createElement('a')
  link.download = 'fileName'
  link.href = uploadURL
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>

<template>
  <div class="intellignet-question">
    <div class="intellignet-question-content">
      <DashboardIntelligentQuestionHeader />
      <div ref="scrollContainer" class="dialog-list">
        <div
          v-for="item in dialogList"
          class="dialog-list-item"
          :style="{ alignItems: item.isQuestion ? 'flex-end' : 'flex-start' }"
        >
          <div v-if="item.isQuestion" class="question">{{ item.messages }}</div>
          <div v-else class="answer">
            <DashboardIntelligentQuestionImage v-if="item.type === 'img'" :item="item" :download="download" />
            <DashboardIntelligentQuestionTable v-else-if="item.type === 'table'" :item="item" :contentWidth="contentWidth" />
            <DashboardIntelligentQuestionText v-else-if="item.type === 'md'" :data="item.data" />
            <DashboardIntelligentQuestionAnnex v-else :item="item" :download="download" />
          </div>
          <div class="action" :style="{ justifyContent: item.isQuestion ? 'flex-end' : 'flex-start' }">
            <div v-if="item.isQuestion" class="copy" @click="onCopyToClipboard(item.messages)">
              <GeneralIcon icon="duplicate" class="text-gray-700" />
              {{ $t('general.duplicate') }}
            </div>
            <div v-if="!item.isQuestion && ['img', 'annex'].includes(item.type)" :style="{ marginRight: '10px' }">
              <GeneralIcon icon="download" @click="download(item, true, 1)" />
            </div>
            <NcTooltip>
              <template #title>删除</template>
              <GeneralIcon icon="delete" @click="deleteMessage(item)" />
            </NcTooltip>
          </div>
          <div class="recommend" v-if="item.questions">
            <div class="recommend-list" @click="handleSend(recommend, () => {})" v-for="recommend in item.questions">
              <div class="text">
                {{ recommend }}
              </div>
              <arrow-right-outlined />
            </div>
          </div>
        </div>
        <DashboardIntelligentQuestionLoading :isSending="isSending" />
      </div>
      <DashboardIntelligentQuestionSearch :handleSend="handleSend" :isSending="isSending" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.intellignet-question {
  width: 100%;
  height: 100vh;
  padding: 20px 16px;
  background-color: #f3f4f6; //#cbdcf7; //f9f9fa

  .intellignet-question-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 20px;
    .dialog-list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 32px 0 16px;
      width: 100%;
      .dialog-list-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 30px;
        width: 100%;
        cursor: pointer;
        .question {
          width: fit-content;
          padding: 10px;
          background-color: #0b6bcb;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          border-top-left-radius: 12px;
          color: #fff;
        }
        .answer {
          width: 100%;
        }
        .action {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0 8px;
          margin-top: 10px;
          opacity: 0;
          .copy {
            margin-right: 20px;
          }
        }
        &:hover .action {
          opacity: 1;
        }
        .recommend {
          max-width: 100%;
          margin-top: 30px;
          .recommend-list {
            width: fit-content;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #f5f5f5;
            padding: 8px 16px;
            margin-bottom: 8px;
            border-radius: 10px;
            .text {
              max-width: calc(100% - 14px);
              overflow-wrap: break-word;
              margin-right: 8px;
            }
          }
        }
      }
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #e7e7e9;
        border-radius: 10px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background-color: #d5d5d9;
        border-radius: 10px;
      }
    }
  }
}
</style>
