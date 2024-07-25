<script lang="ts" setup>
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { useaiAnalyticsStore } from '../../store/aiAnalytics'

const { $api } = useNuxtApp()

const { activeTableId } = storeToRefs(useTablesStore())

const store = useaiAnalyticsStore()
const { dialogList, conversationId } = storeToRefs(store)

const isSending = ref(false)
const scrollContainer = ref(null)
const contentWidth = ref(490)

onMounted(() => {
  if (scrollContainer.value) {
    resizeObserver.observe(scrollContainer.value)
  }
})

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === scrollContainer.value) {
      contentWidth.value = parseInt(`${entry.contentRect.width}`)
    }
  }
})

//发送
const handleSend = async (searchValue: string, callback: () => void) => {
  try {
    if (!searchValue.trim() || isSending.value) return
    callback()
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
      conversation_id: conversationId.value[activeTableId.value!],
      datatype: 'text',
      question: searchValue,
    })
    if (res?.errormsg) {
      message.warning(res.errormsg)
    } else if (res.response?.datasets) {
      dialogList.value = {
        key: activeTableId.value,
        value: [
          ...dialogList.value,
          {
            type: 'table',
            id: uuidv4(),
            isQuestion: false,
            data: {
              columns: res.response?.datasets[0].columns,
              tabledata: res.response?.datasets[0].data,
            },
            questions: res?.questions,
          },
        ],
      }
    } else if (res.response?.text) {
      dialogList.value = {
        key: activeTableId.value,
        value: [
          ...dialogList.value,
          {
            type: 'md',
            id: uuidv4(),
            isQuestion: false,
            data: res.response.text,
            questions: res.questions,
          },
        ],
      }
    } else if (res.response?.images) {
      dialogList.value = {
        key: activeTableId.value,
        value: [
          ...dialogList.value,
          {
            type: 'img',
            id: uuidv4(),
            isQuestion: false,
            data: res.response.images,
            questions: res.questions,
          },
        ],
      }
    } else if (res.response?.files) {
      dialogList.value = {
        key: activeTableId.value,
        value: [
          ...dialogList.value,
          {
            type: 'file',
            id: uuidv4(),
            isQuestion: false,
            data: res.response.files,
            questions: res.questions,
          },
        ],
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSending.value = false
  }
}

//优化问题后提问
const rephrasequestion = async (message: string, callback: () => void) => {
  let res = await $api.smartData.rephrasequestion({
    conversation_id: conversationId.value[activeTableId.value!],
    question: message,
  })
  callback()
  res?.question && handleSend(res.question, () => {})
}

//删除会话
const deleteMessage = (deleteItem: any) => {
  let newDialogList = _.cloneDeep(dialogList.value)
  newDialogList = newDialogList.filter((item) => item.id !== deleteItem.id)
  dialogList.value = { key: activeTableId.value, value: newDialogList }
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

const scrollToBottom = (isAnimated: boolean = false) => {
  nextTick(() => {
    if (scrollContainer.value) {
      const container: {
        [x: string]: any
      } = scrollContainer.value
      if (isAnimated) {
        container?.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }
  })
}
</script>

<template>
  <div class="ai-analytics">
    <div class="ai-analytics-content">
      <DashboardAiAnalyticsHeader />
      <div ref="scrollContainer" class="nc-scrollbar-x-lg dialog-list">
        <DashboardAiAnalyticsDialogList
          :dialogList="dialogList"
          :download="download"
          :deleteMessage="deleteMessage"
          :handleSend="handleSend"
          :rephrasequestion="rephrasequestion"
          :isSending="isSending"
          :contentWidth="contentWidth"
        />
      </div>
      <DashboardAiAnalyticsSearch :handleSend="handleSend" :isSending="isSending" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-analytics {
  width: 100%;
  height: 100vh;
  padding: 20px 16px;
  background-color: #f3f4f6;

  .ai-analytics-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 20px;
    .dialog-list {
      flex: 1;
      padding: 16px 32px 0 16px;
      width: 100%;
    }
  }
}
</style>
