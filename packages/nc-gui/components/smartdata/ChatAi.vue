<script setup lang="ts">
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { useChataiStore } from '../../store/chatai'

const { $api } = useNuxtApp()

const { activeTableId } = storeToRefs(useTablesStore())

const chataiStore = useChataiStore()
const { initData } = chataiStore
const { chataiData, conversationId, dialogList, isOpenTableTree } = storeToRefs(chataiStore)

const isSending = ref(false)
const projectid = ref<any>('')
const isLoading = ref(false)

const route = useRoute()
onMounted(async () => {
  console.log('route', route)
  projectid.value = route.query?.projectid || ''
  try {
    isLoading.value = true
    await initData()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

//发送
const handleSend = async (searchValue: string, callback: () => void) => {
  try {
    if (!searchValue.trim() || isSending.value) return
    callback()
    isSending.value = true
    dialogList.value = [
      ...dialogList.value,
      {
        id: uuidv4(),
        isQuestion: true,
        messages: searchValue,
      },
    ]
    //171102ab-9b24-4683-8509-17a27c819664 abdd5148-e326-4343-b021-4f7888b7e4fe
    let res = await $api.smartData.talktodata({
      conversation_id: 'abdd5148-e326-4343-b021-4f7888b7e4fe',
      datatype: 'text',
      question: searchValue,
    })
    if (res?.errormsg) {
      message.warning(res.errormsg)
    } else if (res.response?.datasets) {
      dialogList.value = [
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
      ]
    } else if (res.response?.text) {
      dialogList.value = [
        ...dialogList.value,
        {
          type: 'md',
          id: uuidv4(),
          isQuestion: false,
          data: typeof res.response.text === 'object' ? `${res.response.text.value}` : `${res.response.text}`,
          questions: res.questions,
        },
      ]
    } else if (res.response?.images) {
      dialogList.value = [
        ...dialogList.value,
        {
          type: 'img',
          id: uuidv4(),
          isQuestion: false,
          data: res.response.images,
          questions: res.questions,
        },
      ]
    } else if (res.response?.files) {
      dialogList.value = [
        ...dialogList.value,
        {
          type: 'file',
          id: uuidv4(),
          isQuestion: false,
          data: res.response.files,
          questions: res.questions,
        },
      ]
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
  dialogList.value = newDialogList
}

//清空会话记录
const clearAllSession = () => {
  dialogList.value = []
}
</script>

<template>
  <div class="intelligent-chat">
    <div class="intelligent-chat-conetnt left" :style="{ width: isOpenTableTree ? '50%' : '100%' }">
      <DashboardAiAnalyticsHeader :clearAllSession="clearAllSession" :isSending="isSending" />
      <div ref="scrollContainer" class="nc-scrollbar-x-lg dialog-list">
        <DashboardAiAnalyticsDialogList
          :dialogList="dialogList"
          :deleteMessage="deleteMessage"
          :handleSend="handleSend"
          :rephrasequestion="rephrasequestion"
          :isSending="isSending"
        />
      </div>
      <div class="search-main">
        <DashboardAiAnalyticsSearch :handleSend="handleSend" :isSending="isSending" />
      </div>
    </div>
    <div class="right" :style="{ width: isOpenTableTree ? '50%' : 0 }">
      <SmartdataChataiTableTree />
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isLoading" />
</template>

<style lang="scss" scoped>
.intelligent-chat {
  width: 100%;
  height: 100vh;
  display: flex;
  .intelligent-chat-conetnt {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 20px;
    transition: 0.5s;
    .dialog-list {
      flex: 1;
      padding: 16px 32px 0 16px;
      width: 100%;
    }
    .search-main {
      width: 100%;
      padding: 0 10%;
    }
  }
}
</style>
