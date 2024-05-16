<script lang="ts" setup>
import { deepClone, getNowDate } from '#imports'
import { v4 as uuidv4 } from 'uuid'

import { CloseOutlined, DeleteFilled, SearchOutlined, SendOutlined } from '@ant-design/icons-vue'

import { useChatPlaygroundViewStore } from '../../../../store/chatPlaygroundView'

export interface SessionItem {
  id: string
  textAreaValue: string
  sql: string
  selectedModel: string
  tabledata: string
  tip: string
}
const { $api } = useNuxtApp()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { setSessionItem, getCustomCatalogEntityTree, setChataiDataIsOpenMode, chataiApi } = store

const searchSessionText = ref<string>('') //搜索会话文本
const isShowSearchSessionResult = ref<boolean>(false) //是否显示搜索的会话结果
const searchSessionResult = ref<SessionItem[]>([]) //搜索会话的结果
const sessionList = ref<SessionItem[]>([]) //会话列表
const selectedSessionItem = ref<SessionItem>({
  id: '',
  textAreaValue: '',
  sql: '',
  selectedModel: '',
  tabledata: '',
  tip: '',
}) //被选中的会话
const isShowLoading = ref<boolean>(false) //加载效果
const textAreaValue = ref<string>('') //查询内容
const locale = {
  emptyText: '暂无数据',
}

onMounted(async () => {
  // 清空展示的会话信息
  setSessionItem({
    id: '',
    textAreaValue: '',
    sql: '',
    selectedModel: '',
    tabledata: '',
    tip: '',
  })
  try {
    isShowLoading.value = true
    // 获取模型数据
    if (!chataiData.value.modelData.length) await getCustomCatalogEntityTree()
  } catch (e: any) {
    console.log(e)
  } finally {
    isShowLoading.value = false
  }
})

//删除所有会话
const handldeleteAllSession = () => {
  setSessionItem({
    id: '',
    textAreaValue: '',
    sql: '',
    selectedModel: '',
    tabledata: '',
    tip: '',
  })
  sessionList.value = []
}

// 搜索会话
const handleSearchSession = () => {
  if (!searchSessionText.value.trim()) {
    handleClickCleanBtn()
  } else {
    isShowSearchSessionResult.value = true
    searchSessionResult.value = sessionList.value.filter((item: SessionItem) => {
      return item.textAreaValue.indexOf(searchSessionText.value) > -1
    })
  }
}

// 清空搜索内容
const handleClickCleanBtn = () => {
  searchSessionText.value = ''
  isShowSearchSessionResult.value = false
  setSessionItem(selectedSessionItem.value.id ? selectedSessionItem.value : sessionList.value[0])
}

//选中会话
const handleClickSessionItem = (sessionItem: SessionItem) => {
  selectedSessionItem.value = sessionItem
  setSessionItem(sessionItem)
}

//删除会话
const handleDeleteSessionItem = (deleteItem: SessionItem) => {
  sessionList.value = sessionList.value.filter((item) => item.id !== deleteItem.id)
  deleteItem.id === chataiData.value.sessionItem.id && setSessionItem(sessionList.value[0])
}

//获取查询范围
const getModelrange = async () => {
  let modelrange = []
  let deepCloneData = deepClone(chataiData.value.checkedModelData)
  if (deepCloneData.length) {
    for (let i = 0; i < deepCloneData.length; i++) {
      let modelItem = deepCloneData[i]
      if (modelItem?.fields && modelItem.fields.length == 0) {
        let modelInfo = await $api.smartData.entity({ entityId: modelItem.id })
        let fields = modelInfo[0].fields ?? []
        modelItem.fields = fields
      }
    }
  }
  modelrange = deepCloneData.map((item) => {
    let props = []
    if (item.fields.length) {
      props = item.fields.map((item1) => {
        return { prop_name: item1.fieldName }
      })
    }
    return { model_name: item.name, props }
  })
  return modelrange
}

//发送按钮
const handleSend = async () => {
  try {
    if (!textAreaValue.value.trim()) return
    isShowLoading.value = true
    const id = uuidv4()
    let modelrange = await getModelrange()
    let getSqlParams = {
      question: textAreaValue.value,
      id,
      orgid: '1',
      projectid: '1',
      modelrange: JSON.stringify(modelrange),
    }
    let getSqlRes = await $api.smartData.getSql(getSqlParams)
    if (getSqlRes) {
      let sql = getSqlRes.text
      let sqlId = getSqlRes.id
      if (sql.indexOf('SELECT') === -1) {
        message.warning(getSqlRes.text)
        isShowLoading.value = false
        return
      }
      sql = sql.replace(/;/g, '')
      let queryBizCustomEntityData = await $api.smartData.exeSql({ sql })
      if (!queryBizCustomEntityData?.success || !queryBizCustomEntityData?.data?.success) {
        if (queryBizCustomEntityData?.exceptionType && queryBizCustomEntityData?.exceptionType.indexOf('VSQL') > -1) {
          message.warning('抱歉，我不能理解你的问题，请调整后再重试')
        } else {
          let err_msg = queryBizCustomEntityData?.success
            ? queryBizCustomEntityData?.data.errorDetail
            : queryBizCustomEntityData?.data.errorDetail.allStackMsg
          let newExeRes = await repeatRepair(sqlId, err_msg, textAreaValue.value)
          if (!newExeRes?.success || !newExeRes?.data.success) {
            message.warning('抱歉，我不能理解你的问题，请调整后再重试')
          }
          queryBizCustomEntityData = newExeRes
        }
      }
      if (queryBizCustomEntityData?.data) {
        let fields = queryBizCustomEntityData?.data?.fields
        let datas = queryBizCustomEntityData?.data?.datas
        let newSessionItem = {
          id,
          textAreaValue: textAreaValue.value,
          sql: queryBizCustomEntityData?.sql ? queryBizCustomEntityData?.sql : sql,
          searchTime: getNowDate(),
          selectedModel: chataiData.value.checkedModelData.length ? JSON.stringify(chataiData.value.checkedModelData) : '',
          tabledata: JSON.stringify({ fields, datas }),
          tip: textAreaValue.value,
        }
        sessionList.value.unshift(newSessionItem)
        textAreaValue.value = ''
        setSessionItem(newSessionItem)
        selectedSessionItem.value = {
          id: '',
          textAreaValue: '',
          sql: '',
          selectedModel: '',
          tabledata: '',
          tip: '',
        }
      }
    }
  } catch (e: any) {
    console.log(e)
  } finally {
    isShowLoading.value = false
  }
}

const repeatRepair = async (id: string, error_msg: string, question: string, maxRetries = 3) => {
  let retriesCount = 0
  let returnRes = null
  while (retriesCount < maxRetries) {
    try {
      let response: any = await $api.smartData.repair({ id, orgid: '1', projectid: '1', error_msg, question })
      if (response.text.indexOf('SELECT') > -1) {
        let sql = response.text.replace(/;/g, '')
        let result: any = await $api.smartData.exeSql({ sql })
        if (result?.success && result?.data.success) {
          result.sql = sql
          return result
        } else {
          returnRes = result
          retriesCount++
        }
      } else {
        retriesCount++
        returnRes = {
          data: {
            datas: [],
            fields: [],
          },
        }
      }
    } catch (error) {
      retriesCount++
    }
  }
  return returnRes
}
</script>

<template>
  <div class="left-container-content" direction="vertical" size="middle">
    <!-- 顶部 -->
    <div class="top-title">
      <a-badge
        :count="sessionList.length"
        :number-style="{
          backgroundColor: 'rgb(235, 240, 255)',
          color: 'rgb(18, 70, 123)',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 0 0 0 transparent',
        }"
        :offset="[10, 2]"
      >
        <a-typography-title :level="4">会话</a-typography-title>
      </a-badge>
      <delete-filled class="delete-icon" @click="handldeleteAllSession()" />
    </div>
    <!-- 搜索会话 -->
    <div class="search-session">
      <a-input placeholder="搜索会话" v-model:value="searchSessionText" @keyup.enter="handleSearchSession()">
        <template #suffix>
          <CloseOutlined @click="handleClickCleanBtn()" v-show="searchSessionText.trim()" style="margin-right: 5px" />
          <search-outlined @click="handleSearchSession()" />
        </template>
      </a-input>
    </div>
    <!-- 会话列表 -->
    <a-list
      :locale="locale"
      class="session-list"
      item-layout="horizontal"
      :data-source="isShowSearchSessionResult ? searchSessionResult : sessionList"
    >
      <template #renderItem="{ item }">
        <a-list-item :class="{ background: item.id === selectedSessionItem?.id }">
          <div @click="handleClickSessionItem(item)" class="list-item">
            <div class="list-item-left">
              <div class="list-item-left-content">
                <a-typography-text class="list-item-left-content-textAreaValue">{{ item.textAreaValue }}</a-typography-text>
                <a-typography-text>{{
                  item.selectedModel
                    ? JSON.parse(item.selectedModel)
                        .map((item: any) => item.name_cn)
                        .join(';')
                    : ''
                }}</a-typography-text>
                <a-typography-text>{{ item.sql }}</a-typography-text>
              </div>
              <div class="list-item-left-time">{{ item.searchTime }}</div>
            </div>
            <delete-filled
              class="delete-icon delete-session-item-btn"
              @click="
                (e) => {
                  e.stopPropagation()
                  handleDeleteSessionItem(item)
                }
              "
            />
          </div>
        </a-list-item>
      </template>
    </a-list>
    <!-- textArea输入框模块  -->
    <a-card style="width: 100%">
      <template #title>
        <a-textarea
          :auto-size="{ minRows: 3, maxRows: 10 }"
          v-model:value="textAreaValue"
          :bordered="false"
          placeholder="请输入你的查询要求"
        />
      </template>
      <SmartdataChatPlaygroundViewLeftIndexPopover />
      <div class="btn-right">
        <a-button type="primary" size="middle" class="select-btn send-btn" @click="setChataiDataIsOpenMode(true)">
          选择范围
        </a-button>
        <a-button type="primary" size="middle" class="send-btn" @click="handleSend()">
          发送
          <send-outlined />
        </a-button>
      </div>
    </a-card>
    <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
  </div>
</template>

<style scoped lang="scss">
.left-container-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 24px 16px;
  border-right: 1px solid;
  border-color: rgba(99, 107, 116, 0.2);
  background-color: rgb(240, 244, 248);
  .delete-icon {
    color: rgb(99, 107, 116);
  }
  .top-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    .ant-typography {
      font-size: 18px;
      margin: 0;
    }
  }
  .search-session {
    margin: 16px 0;
    ::v-deep .ant-input-affix-wrapper {
      border-radius: 5px;
    }
    ::v-deep .ant-input-affix-wrapper {
      box-sizing: border-box;
      border: 1px solid rgb(217, 217, 217) !important;
    }
    ::v-deep .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
      box-shadow: none;
    }
    ::v-deep .ant-input-affix-wrapper-focused,
    .ant-input-affix-wrapper:focus {
      box-shadow: 0 0 0 2px #0b6bcb !important;
    }
  }
  .session-list {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #c1c1c1;
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: rgb(168, 168, 168);
      border-radius: 10px;
    }
    &::-webkit-scrollbar-track {
      background-color: #e0e0e0;
      border-radius: 10px;
    }
    .ant-list-item {
      width: 100%;
      padding: 16px 18px;
      border-bottom: 1px solid rgba(99, 107, 116, 0.2);
      cursor: pointer;
      &:hover .delete-session-item-btn {
        opacity: 1;
      }
    }
    .list-item {
      width: 100%;
      display: flex;
      align-items: center;
      position: relative;
    }
    .list-item-left {
      flex-grow: 1;
      display: flex;
      justify-content: space-between;

      .list-item-left-content {
        flex: 1;
        .ant-typography {
          display: flex;
          flex-wrap: wrap;
          line-height: 21px;
          color: rgb(85, 94, 104);
          font-size: 14px;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        }
        .list-item-left-content-textAreaValue {
          color: rgb(23, 26, 28);
          margin-bottom: 5px;
          font-size: 16px;
          font-weight: 500;
        }
      }
      .list-item-left-time {
        color: rgb(85, 94, 104);
        font-size: 12px;
        font-weight: 500;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
          'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      }
    }
    .delete-session-item-btn {
      position: absolute;
      right: -16px;
      opacity: 0;
    }
  }
  .ant-card {
    border-radius: 8px !important;
    border-color: rgb(205, 215, 225) !important;
    padding: 0 6px;
    &:focus-within {
      outline: 2px solid #0b6bcb;
    }
    &:focus-visible {
      outline: 2px solid #0b6bcb;
    }
    ::v-deep .ant-card-head {
      padding: 0 !important;
      border-color: rgba(99, 107, 116, 0.2);
    }
    ::v-deep .ant-card-head-title {
      padding: 0px !important;
    }
    ::v-deep .ant-input {
      padding: 8px 6px;
      font-size: 16px !important;
      color: #32383e;
    }
    ::v-deep .ant-input::placeholder {
      font-size: 16px !important;
    }
    ::v-deep .ant-card-body {
      display: flex;
      justify-content: space-between;
      padding: 16px 8px;
    }
    .btn-right {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      .select-btn {
        margin-right: 20px;
      }
    }
    .send-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #0b6bcb;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      .anticon-send {
        color: white;
        position: relative;
        top: -1px;
      }
    }
  }

  .background {
    background-color: rgb(221, 231, 238);
    font-weight: 500 !important;
  }
}
</style>
