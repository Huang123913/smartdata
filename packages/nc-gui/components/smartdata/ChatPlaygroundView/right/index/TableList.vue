<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'

import { CloseOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons-vue'

import { useChatPlaygroundViewStore } from '../../../../../store/chatPlaygroundView'

const { $api } = useNuxtApp()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { getCustomCatalogEntityTree, setSessionItem } = store

const isShowSelectCatalogModal = ref<boolean>(false) //是否显示选择目录弹框
const isEdited = ref<boolean>(false)
const editText = ref<string>('')
const elementRef = ref(null)
const tableWidth = ref<number>(0)
const tableHeight = ref<number>(0)
const elementRef1 = ref(null)
const myTable = ref(null)
const updateTimeValue = ref<string>('realTimeView') //模型数据更新方式-默认实时视图
const isShowLoading = ref<boolean>(false)
const isPublishCatalog = ref<boolean>(true) //是否发布至模型目录
const targetField = ref<any[]>([]) //目标字段
const dropVisible = ref<boolean>(false)
const searchModel = ref<string>('')
const searchModelRes = ref<any[]>([])
const isShowSearchModelRes = ref<boolean>(false)
const existingModelField = ref<{
  [key: string]: any
}>({})
const selectPublishMode = ref<object>({})

onMounted(() => {
  tableWidth.value = parseInt(elementRef1.value.clientWidth)
  tableHeight.value = parseInt(elementRef1.value.clientHeight)
  if (myTable.value) {
    const headerElement = myTable.value.$el.querySelector('.ant-table-thead')
    if (headerElement) {
      const height = headerElement.clientHeight
      tableHeight.value = parseInt(tableHeight.value) - parseInt(height)
    }
  }
  resizeObserver1.observe(elementRef1.value)
})

const isShow = computed(() => {
  return chataiData.value.sessionItem?.sql
})

const columns = computed(() => {
  if (!chataiData.value.sessionItem?.sql) return []
  let result = JSON.parse(chataiData.value.sessionItem.tabledata).fields
  if (!result) return []
  let fileds = result?.filter((item) => item.name !== 'id')
  let newFileds = fileds?.map((item) => {
    return {
      ...item,
      title: item.name_cn ?? item.name ?? item.code,
      dataIndex: item.name ?? item.code,
      name_en: item.name ?? item.code,
      width: 'fit-content',
      value: item.name,
      label: item.name,
    }
  })
  return newFileds
})

const tableData = computed(() => {
  if (!chataiData.value.sessionItem?.sql) return []
  let result = JSON.parse(chataiData.value.sessionItem.tabledata).datas
  if (!result) return []
  let newDatas = result?.map((item) => {
    let newItem = { ...item }
    return newItem
  })
  return newDatas
})

const existingModelData = computed(() => {
  return chataiData.value.modelData.filter((item) => !item.isCatalog)
})

const resizeObserver1 = new ResizeObserver((entries) => {
  // 当尺寸发生变化时更新宽度值
  for (const entry of entries) {
    if (entry.target === elementRef1.value) {
      tableWidth.value = parseInt(entry.contentRect.width)
      tableHeight.value = parseInt(entry.contentRect.height)
    }
  }
  if (myTable.value) {
    const headerElement = myTable.value.$el.querySelector('.ant-table-thead')
    if (headerElement) {
      const height = headerElement.clientHeight
      tableHeight.value = parseInt(tableHeight.value) - parseInt(height)
    }
  }
})

const handleEdit = (value: boolean) => {
  if (value) editText.value = chataiData.value.sessionItem.textAreaValue
  isEdited.value = value
  if (!value) {
    let newResulr = { ...chataiData.value.sessionItem, textAreaValue: editText.value }
    setSessionItem(newResulr)
  }
}

// 发布按钮
const handleSaveBtn = () => {
  isShowSelectCatalogModal.value = true
  isPublishCatalog.value = true
  dropVisible.value = false
}

// 选择模型目录弹框确定事件
const handleOk = async (selectedCatalog: object) => {
  try {
    isShowSelectCatalogModal.value = false
    isShowLoading.value = true
    let exeRes = null
    if (isPublishCatalog.value) {
      let params = {
        tableData: chataiData.value.sessionItem.tabledata,
        sql: chataiData.value.sessionItem.sql,
        question: chataiData.value.sessionItem.tip,
        modelName: chataiData.value.sessionItem.textAreaValue,
        belongCatalog: selectedCatalog.code,
      }
      exeRes = await $api.smartData.publicModelToCatalog(params)
    } else {
      let params = {
        mapingData: selectedCatalog,
        tableData: chataiData.value.sessionItem.tabledata,
        existingModelId: selectPublishMode.value.id,
      }
      exeRes = await $api.smartData.publishModelToExistingModel(params)
    }
    exeRes && exeRes?.success && message.success('发布成功')
  } catch (e: any) {
    console.log(e)
  } finally {
    isShowLoading.value = false
    await getCustomCatalogEntityTree()
  }
}

// 选择模型目录弹框取消事件
const handleCancel = () => {
  isShowSelectCatalogModal.value = false
}

// 设置模型数据更新频率
const handleOkBySetUpdateTime = (value: string) => {
  updateTimeValue.value = value
}

const setUpdateTimeValue = (value: string) => {
  updateTimeValue.value = value
}

const handleSelectExistingModel = async (item: any) => {
  selectPublishMode.value = item
  if (existingModelField.value.hasOwnProperty(item.id)) {
    targetField.value = existingModelField.value[item.id]
  } else {
    isShowLoading.value = true
    let modelInfo = await $api.smartData.entity({ entityId: item.id })
    let fields = modelInfo[0].fields ?? []
    targetField.value = fields.map((item: any) => {
      return { ...item, value: item.fieldName, label: item.fieldName }
    })
    existingModelField.value[item.id] = targetField.value

    isShowLoading.value = false
  }
  isShowSelectCatalogModal.value = true
  isPublishCatalog.value = false
  dropVisible.value = false
}

//搜索现有模型
const handleSearchModel = () => {
  if (!searchModel.value.trim()) {
    handleClickCleanBtn()
  } else {
    isShowSearchModelRes.value = true
    searchModelRes.value = existingModelData.value.filter((item: any) => {
      return item.name_cn.indexOf(searchModel.value) > -1
    })
  }
}

const handleClickCleanBtn = () => {
  searchModel.value = ''
  isShowSearchModelRes.value = false
}
</script>

<template>
  <div class="table-list-content" v-show="isShow" ref="elementRef">
    <div class="table-list-header">
      <div class="table-list-header-left">
        <a-typography-text class="list-item-left-content-textAreaValue">
          <span v-if="!isEdited" class="edit-content"
            ><span class="edit-text"> {{ chataiData.sessionItem?.textAreaValue }}</span>
            <EditOutlined :title="isEdited ? '确认修改' : '编辑'" class="edit-outlined" @click="handleEdit(true)"
          /></span>
          <a-input v-else v-model:value="editText">
            <template #suffix>
              <EditOutlined :title="isEdited ? '确认修改' : '编辑'" @click="handleEdit(false)" />
            </template>
          </a-input>
        </a-typography-text>

        <a-typography-text>{{
          chataiData.sessionItem?.selectedModel
            ? JSON.parse(chataiData.sessionItem.selectedModel)
                .map((item: any) => item.name_cn)
                .join(';')
            : ''
        }}</a-typography-text>
        <a-typography-text>
          {{ chataiData.sessionItem?.sql }}
        </a-typography-text>
      </div>
      <!-- <a-button class="save-btn" type="primary" size="middle" @click="handleSaveBtn()"> 发布 </a-button> -->
      <a-dropdown :trigger="['click']" placement="bottom" overlay-class-name="publish-model" v-model:visible="dropVisible">
        <NcButton class="!bg-primary !border-none !mr-3 ml-3" size="small">
          <span class="text-sm font-weight-medium">发布至</span>
          <mdi-menu-down />
        </NcButton>
        <template #overlay>
          <div class="bg-white !border">
            <a-menu>
              <a-menu-item :key="1" @click="handleSaveBtn"> 模型目录 </a-menu-item>
              <a-sub-menu :key="2" title="现有模型">
                <!-- 搜索框 -->
                <div class="search-existing-model">
                  <a-input placeholder="搜索模型" v-model:value="searchModel" @keyup.enter="handleSearchModel()">
                    <template #suffix>
                      <CloseOutlined @click="handleClickCleanBtn()" v-show="searchModel.trim()" style="margin-right: 5px" />
                      <search-outlined @click="handleSearchModel()" />
                    </template>
                  </a-input>
                </div>
                <!-- 现有模型列表 -->
                <div class="existing-model">
                  <a-menu-item
                    v-for="item in isShowSearchModelRes ? searchModelRes : existingModelData"
                    :key="item.id"
                    @click="handleSelectExistingModel(item)"
                    >{{ item.name_cn }}</a-menu-item
                  >
                  <div class="no-data" v-if="isShowSearchModelRes && searchModelRes.length === 0">暂无数据</div>
                </div>
              </a-sub-menu>
            </a-menu>
          </div>
        </template>
      </a-dropdown>
    </div>
    <!-- 表格数据 -->
    <div class="table-data" ref="elementRef1">
      <a-table
        ref="myTable"
        :pagination="false"
        class="ant-table-striped"
        :columns="columns"
        :data-source="tableData"
        :scroll="{ y: tableHeight }"
      >
        <template #headerCell="{ title, column }">
          <a-tooltip :title="column.name_en" :overlayClassName="'reverse-selection-tip'">
            <span style="cursor: default">{{ title }}</span>
          </a-tooltip>
        </template>
      </a-table>
    </div>
  </div>
  <!-- 模型目录/字段映射弹框 -->
  <SmartdataChatPlaygroundViewRightIndexTableListSelectCatalogModal
    :visible="isShowSelectCatalogModal"
    :handleCancel="handleCancel"
    :handleOk="handleOk"
    :setUpdateTimeValue="setUpdateTimeValue"
    :isCatalog="isPublishCatalog"
    :targetField="targetField"
    :sourceField="columns"
  />
  <!-- 定时更新弹框 -->
  <SmartdataChatPlaygroundViewRightIndexTableListSetModelDataUpdateTimeModal :handleOk="handleOkBySetUpdateTime" />
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.ant-tree-switcher {
  top: -2px;
}
.existing-model {
  max-height: 300px;
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
  .ant-menu-sub {
    border-radius: 5px;
  }
  .no-data {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.25);
    font-size: 14px;
  }
  .ant-menu-item {
    margin-bottom: 0 !important;
  }
  .ant-menu-item:not(:last-child) {
    margin-top: 0 !important;
  }
}

.publish-model {
  width: 130px !important;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  .ant-menu-item,
  .ant-menu-submenu {
    height: 35px;
    display: flex;
    align-items: center;
  }
  .ant-menu-item {
    margin-top: 8px !important;
  }
  .ant-menu-submenu {
    margin-bottom: 8px !important;
  }
  .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
    background-color: transparent !important;
  }
  .ant-menu-item-selected {
    background-color: transparent !important;
  }
  .ant-menu-item-selected,
  .ant-menu-item-selected a,
  .ant-menu-item-selected a:hover {
    color: rgba(0, 0, 0, 0.85);
  }
  .ant-menu-submenu-title {
    height: 31px !important;
    line-height: 31px !important;
  }
}

.table-list-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 8px 8px 8px;
  overflow: hidden;
  box-sizing: border-box;
  .table-list-header {
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    box-sizing: border-box;
    .save-btn {
      background-color: #0b6bcb;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      margin-left: 20px;
      margin-top: 10px;
    }
  }
  .table-data {
    width: 100%;
    flex-grow: 1;
    margin-top: 20px;
    border: 1px solid rgb(205, 215, 225);
    border-right: none;
    box-sizing: border-box;
    overflow: hidden;
    .ant-table-body {
      &::-webkit-scrollbar {
        width: 6px;
        height: 5px;
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
    }
    .ant-table-cell {
      border-color: rgb(205, 215, 225);
      color: rgb(50, 56, 62) !important;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol';
    }
  }
  .table-list-header-left {
    display: flex;
    flex-direction: column;
    flex: 1;

    .ant-typography {
      display: flex;
      flex-wrap: wrap;
      line-height: 21px;
      color: rgb(85, 94, 104);
      font-size: 14px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol';
    }
    .list-item-left-content-textAreaValue {
      color: rgb(23, 26, 28);
      margin-bottom: 5px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      .edit-content {
        display: flex;
        width: 100%;
        align-items: center;
      }
      .ant-input-suffix {
        position: relative;
        top: -1px;
      }

      .ant-input-affix-wrapper {
        border-radius: 5px;
      }
      .ant-input-affix-wrapper {
        box-sizing: border-box;
        border: 1px solid rgb(217, 217, 217) !important;
      }
      .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
        box-shadow: none;
      }
      .ant-input-affix-wrapper-focused,
      .ant-input-affix-wrapper:focus {
        box-shadow: 0 0 0 2px #0b6bcb !important;
      }
      .edit-outlined {
        margin-left: 16px;
        position: relative;
      }
      input {
        flex: 1;
      }
    }
  }
  .nc-button.ant-btn.small {
    padding-left: 14px;
    padding-right: 10px;
    background-color: #0b6bcb !important;
  }
}

.search-existing-model {
  width: 100%;
  padding: 10px 16px 16px;
  overflow: hidden;
  box-sizing: border-box;
  .ant-input-affix-wrapper {
    border-radius: 5px;
    width: 240px;
  }
  .ant-input-affix-wrapper {
    box-sizing: border-box;
    border: 1px solid rgb(217, 217, 217) !important;
  }
  .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
    box-shadow: none;
  }
  .ant-input-affix-wrapper-focused,
  .ant-input-affix-wrapper:focus {
    box-shadow: none !important;
    border-color: rgb(51, 102, 255) !important;
  }
}
</style>
