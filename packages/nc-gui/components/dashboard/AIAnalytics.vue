<script lang="ts" setup>
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { useaiAnalyticsStore } from '../../store/aiAnalytics'

const { $api } = useNuxtApp()

const { activeTableId } = storeToRefs(useTablesStore())

const store = useaiAnalyticsStore()
const { dialogList, conversationId, sendingTable } = storeToRefs(store)
const { setSendingTable, setDialogList, deleteDialogList } = store

const isSending = ref<{ [key: string]: any }>({})
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
  let res = null
  try {
    if (!searchValue.trim() || isSending.value[conversationId.value[activeTableId.value!]]) return
    callback()
    isSending.value[conversationId.value[activeTableId.value!]] = true
    setDialogList(activeTableId.value!, {
      id: uuidv4(),
      isQuestion: true,
      messages: searchValue,
    })
    scrollToBottom()
    setSendingTable(conversationId.value[activeTableId.value!], activeTableId.value!)
    res = await $api.smartData.talktodata({
      conversation_id: conversationId.value[activeTableId.value!],
      datatype: 'text',
      question: searchValue,
    })
    if (res?.errormsg) {
      message.warning(res.errormsg)
    } else if (res.response?.datasets) {
      setDialogList(sendingTable.value[res.conversationId], {
        type: 'table',
        id: uuidv4(),
        isQuestion: false,
        data: {
          columns: res.response?.datasets[0].columns,
          tabledata: res.response?.datasets[0].data,
        },
        questions: res?.questions,
      })
    } else if (res.response?.text) {
      let data
      if (typeof res.response.text === 'object') {
        data = `${res.response.text.value}`
      } else {
        data = `${res.response.text}`
        if (res.response.text.trim().startsWith('{') && res.response.text.trim().endsWith('}')) {
          let obj = JSON.parse(res.response.text.replace(/'/g, '"'))
          console.log('obj', obj)
          data = `${obj.value}`
        }
      }
      setDialogList(sendingTable.value[res.conversationId], {
        type: 'md',
        id: uuidv4(),
        isQuestion: false,
        data,
        questions: res.questions,
      })
    } else if (res.response?.images) {
      setDialogList(sendingTable.value[res.conversationId], {
        type: 'img',
        id: uuidv4(),
        isQuestion: false,
        data: res.response.images,
        questions: res.questions,
      })
    } else if (res.response?.files) {
      setDialogList(sendingTable.value[res.conversationId], {
        type: 'file',
        id: uuidv4(),
        isQuestion: false,
        data: res.response.files,
        questions: res.questions,
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSending.value[res.conversationId] = false
    setSendingTable(res.conversationId, '')
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
  deleteDialogList(activeTableId.value!, false, deleteItem.id)
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

//清空会话
const clearAllSession = () => {
  deleteDialogList(activeTableId.value!, true, '')
}
</script>

<template>
  <div class="ai-analytics">
    <div class="ai-analytics-content">
      <DashboardAiAnalyticsHeader :clearAllSession="clearAllSession" :isSending="isSending[conversationId[activeTableId!]]" />
      <div ref="scrollContainer" class="nc-scrollbar-x-lg dialog-list">
        <DashboardAiAnalyticsDialogList
          :dialogList="dialogList[activeTableId!]"
          :deleteMessage="deleteMessage"
          :handleSend="handleSend"
          :rephrasequestion="rephrasequestion"
          :isSending="isSending[conversationId[activeTableId!]]"
          :contentWidth="contentWidth"
        />
      </div>
      <DashboardAiAnalyticsSearch :handleSend="handleSend" :isSending="isSending[conversationId[activeTableId!]]" />
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
