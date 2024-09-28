<script lang="ts" setup>
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import Icon from '@ant-design/icons-vue'

import { useaiAnalyticsStore } from '../../store/aiAnalytics'

const filterType = ['error', 'confirmation_and_execution', 'SelectedGenerator', 'init_plan', 'plan', 'current_plan_step']
const { $api } = useNuxtApp()

const { activeTableId } = storeToRefs(useTablesStore())
const isOverSession = ref(false)
const store = useaiAnalyticsStore()
const { dialogList, conversationId, sendingTable, savedConversations } = storeToRefs(store)
const { setSendingTable, setDialogList, deleteDialogList, setTableNameList, updateDialogListItem, setSavedConversations } = store

const isSending = ref<{ [key: string]: any }>({})
const scrollContainer = ref(null)
const contentWidth = ref(490)
const { exeSql } = useChatAi()
const showNewCreateBtn = ref(false)
const isShowLoading = ref(false)

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
const handleSend = async (searchValue: string, isAdd: boolean, callback: () => void) => {
  if (conversationId.value[activeTableId.value!] === '') {
    message.warning('会话已结束，请重新创建会话')
    return
  }
  let res: any = null
  let res1: any = conversationId.value[activeTableId.value!]
  try {
    if (!searchValue.trim() || isSending.value[conversationId.value[activeTableId.value!]]) return
    callback()
    isSending.value[conversationId.value[activeTableId.value!]] = true
    let sendId = uuidv4()
    isAdd &&
      setDialogList(activeTableId.value!, {
        id: sendId,
        isQuestion: true,
        messages: searchValue,
      })
    setSavedConversations(activeTableId.value!, {
      type: 'send',
      id: sendId,
      content: searchValue,
    })
    scrollToBottom()
    setSendingTable(conversationId.value[activeTableId.value!], activeTableId.value!)
    res = await $api.smartData.talktodata({
      conversation_id: conversationId.value[activeTableId.value!],
      datatype: 'text',
      question: searchValue,
    })
    console.log('res', res)
    if (res?.errormsg) {
      message.warning(res.errormsg)
    } else if (res?.error && res?.conversationId) {
      // message.warning('会话已结束，请重新创建')
      showNewCreateBtn.value = true
    } else if (res?.error) {
      message.warning('没有找到会话，请重新创建')
    } else {
      let isOverSessionToItem = false
      let id = uuidv4()
      let tableName = 'Table'
      let tableRes: any = null
      let isShowSaveBtn = false
      let hasSqlRes = false
      let isRepair = false
      let errText = ''
      let parameters: any[] = []
      let sql = ''
      let attachments = res.attachments.filter((item: any) => !filterType.includes(item.type))
      let findSqlItem = res.attachments.find((item: any) => item.type === 'sql')
      let findErrorItem = res.attachments.find((item: any) => item.type === 'error')
      let findDataMeta = res.attachments.find((item: any) => item.type === 'data_meta')
      let findInitPlay = res.attachments.find((item: any) => item.type === 'init_plan')
      let findPlay = res.attachments.find((item: any) => item.type === 'plan')
      let findCurrentPlay = res.attachments.find((item: any) => item.type === 'current_plan_step')

      if (
        res.attachments.length === 3 &&
        findInitPlay &&
        findPlay &&
        findCurrentPlay &&
        (res.message.indexOf('会话') > -1 || res.message.indexOf('对话') > -1) &&
        res.message.indexOf('结束') > -1
      ) {
        isOverSessionToItem = true
        isOverSession.value = true
      }
      if (findDataMeta) {
        findDataMeta.content = JSON.parse(findDataMeta.content)
        findDataMeta.fields = Object.keys(findDataMeta.content.fields[0])
        findDataMeta.tableData = findDataMeta.content.fields
        if (findDataMeta.content?.parameters && findDataMeta.content?.parameters.length) {
          findDataMeta['parametersNew'] = {}
          findDataMeta['parametersNew']['fields'] = Object.keys(findDataMeta.content.parameters[0])
          findDataMeta['parametersNew']['tableData'] = findDataMeta.content.parameters
          parameters = findDataMeta.content.parameters
        }
      }
      if (findErrorItem) {
        errText = findErrorItem.content
      }
      if (findSqlItem) {
        hasSqlRes = true
        sql = findSqlItem.content.replace(/;$/, '')
        let exeRes =
          (!findDataMeta || !findDataMeta.content?.parameters || !findDataMeta.content?.parameters.length) && (await exeSql(sql))
        if (exeRes) {
          tableRes = {
            content: exeRes.success ? exeRes : exeRes.errorDetail,
            isExeSuccess: exeRes.success,
          }
          isShowSaveBtn = exeRes.success
          isRepair = exeRes.isRepair as boolean
          if (exeRes.success) setTableNameList(id, tableName)
        }
      }

      setDialogList(sendingTable.value[res.conversationId], {
        type: 'answer',
        id,
        isQuestion: false,
        detail: attachments,
        questions: [],
        data: res.message,
        isShowSaveBtn,
        tableRes,
        hasSqlRes,
        isRepair,
        errText,
        tableName,
        parameters,
        sql,
        isOverSession: isOverSessionToItem,
      })
      setSavedConversations(activeTableId.value!, {
        type: 'received',
        id: id,
        content: res,
      })
      if (isOverSessionToItem) conversationId.value = { key: activeTableId.value, value: '' }
      console.log('继续', dialogList.value[activeTableId.value!])
      console.log('保存', savedConversations.value[activeTableId.value!])
    }
    // if (res?.errormsg) {
    //   message.warning(res.errormsg)
    // } else if (res.response?.datasets) {
    //   setDialogList(sendingTable.value[res.conversationId], {
    //     type: 'table',
    //     id: uuidv4(),
    //     isQuestion: false,
    //     data: {
    //       columns: res.response?.datasets[0].columns,
    //       tabledata: res.response?.datasets[0].data,
    //     },
    //     questions: res?.questions,
    //   })
    // } else if (res.response?.text) {
    //   let data
    //   if (typeof res.response.text === 'object') {
    //     data = `${res.response.text.value}`
    //   } else {
    //     data = `${res.response.text}`
    //     if (res.response.text.trim().startsWith('{') && res.response.text.trim().endsWith('}')) {
    //       let obj = JSON.parse(res.response.text.replace(/'/g, '"'))
    //       console.log('obj', obj)
    //       data = `${obj.value}`
    //     }
    //   }
    //   setDialogList(sendingTable.value[res.conversationId], {
    //     type: 'md',
    //     id: uuidv4(),
    //     isQuestion: false,
    //     data,
    //     questions: res.questions,
    //   })
    // } else if (res.response?.images) {
    //   setDialogList(sendingTable.value[res.conversationId], {
    //     type: 'img',
    //     id: uuidv4(),
    //     isQuestion: false,
    //     data: res.response.images,
    //     questions: res.questions,
    //   })
    // } else if (res.response?.files) {
    //   setDialogList(sendingTable.value[res.conversationId], {
    //     type: 'file',
    //     id: uuidv4(),
    //     isQuestion: false,
    //     data: res.response.files,
    //     questions: res.questions,
    //   })
    // }
  } catch (error) {
    console.error(error)
    message.error(await extractSdkResponseErrorMsg(error as any))
  } finally {
    isSending.value[res?.conversationId || res1] = false
    setSendingTable(res?.conversationId || res1, '')
  }
}

//优化问题后提问
const rephrasequestion = async (message: string, callback: () => void) => {
  let res = await $api.smartData.rephrasequestion({
    conversation_id: conversationId.value[activeTableId.value!],
    question: message,
  })
  callback()
  res?.question && handleSend(res.question, true, () => {})
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
const clearAllSession = (isCreateNewSession = false) => {
  deleteDialogList(activeTableId.value!, true, '')
  if (isCreateNewSession) {
    isOverSession.value = false
  }
}

const createNewSessionInTable = async () => {
  try {
    showNewCreateBtn.value = false
    isShowLoading.value = true
    let createSessionRes = await $api.smartData.createSession({
      entityId: activeTableId.value,
      datafiles: JSON.stringify([]),
      isUpdateSession: true,
    })
    if (createSessionRes?.conversation_id) {
      conversationId.value = { key: activeTableId.value, value: createSessionRes.conversation_id }
    }
    clearAllSession(true)
  } catch (error) {
    throw error
  } finally {
    isShowLoading.value = false
  }
}

const replacePlaceholders = (sqlQuery: string, params: any) => {
  return sqlQuery.replace(/:(\w+)/g, (match, key) => {
    if (params[key] !== undefined) {
      // 如果值是用于 LIKE 查询的，将其包裹在 '%' 中
      if (sqlQuery.includes(`LIKE :${key}`)) {
        return `'%${params[key]}%'`
      }
      // 其他值直接替换
      return `'${params[key]}'`
    }
    return match
  })
}

const runManualSql = async (item: any) => {
  try {
    isShowLoading.value = true
    let newItem = { ...item }
    let sql = replacePlaceholders(item.sql, item.parametersObj)
    let exeRes = await exeSql(sql)
    if (exeRes) {
      newItem.tableRes = {
        content: exeRes.success ? exeRes : exeRes.errorDetail,
        isExeSuccess: exeRes.success,
      }
      newItem.isShowSaveBtn = exeRes.success
      newItem.isRepair = exeRes.isRepair as boolean
      if (exeRes.success) setTableNameList(newItem.id, newItem.tableName)
    }
    updateDialogListItem(newItem, activeTableId.value!)
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
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
          :runManualSql="runManualSql"
        />
      </div>
      <DashboardAiAnalyticsSearch
        :isOverSession="isOverSession"
        :handleSend="handleSend"
        :isSending="isSending[conversationId[activeTableId!]]"
        :clearAllSession="clearAllSession"
      />
    </div>
  </div>
  <div class="analytics-tip-content" :class="{ anite: showNewCreateBtn }">
    <icon>
      <template #component>
        <svg
          t="1726196016042"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="6662"
          width="16"
          height="16"
        >
          <path
            d="M511.999488 62.400189c-248.307296 0-449.599811 201.292516-449.599811 449.599811s201.292516 449.599811 449.599811 449.599811 449.599811-201.292516 449.599812-449.599811-201.292516-449.599811-449.599812-449.599811z m40.932248 692.043562c0 22.606881-18.325367 40.932248-40.932248 40.932248s-40.932248-18.325367-40.932248-40.932248V430.375981c0-22.605857 18.325367-40.932248 40.932248-40.932248s40.932248 18.326391 40.932248 40.932248v324.06777z m0-483.5746c0 22.606881-18.325367 40.932248-40.932248 40.932248-22.605857 0-40.932248-18.325367-40.932248-40.932248v-1.312902c0-22.606881 18.326391-40.932248 40.932248-40.932248 22.606881 0 40.932248 18.325367 40.932248 40.932248v1.312902z"
            fill="#1890FF"
            p-id="6663"
          ></path>
        </svg>
      </template>
    </icon>
    <div class="tip">{{ '会话已结束，请重新创建' }}</div>
    <div class="look" @click="createNewSessionInTable()">
      <a-button type="link" size="middle">新建会话</a-button>
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
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

.analytics-tip-content {
  position: fixed;
  top: -100px; /* 初始在视图之外 */
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  opacity: 0;
  transition: 0.5s ease;
  z-index: 999;
  padding: 8px 22px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  .look {
    cursor: pointer;
    color: var(--ant-primary-color);
    text-align: center;
    height: 31px;
    line-height: 31px;
  }
  .tip {
    margin-left: 5px;
  }
}
.anite {
  top: 20px;
  opacity: 1;
}
</style>
