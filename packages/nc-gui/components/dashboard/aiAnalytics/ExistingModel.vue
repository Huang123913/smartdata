<script lang="ts" setup>
import { ref } from '#imports'

import { CloseOutlined, SearchOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  handleSelectTable: () => void
  item: any
  isShowLoading: boolean
}>()
const emits = defineEmits(['update:isShowLoading'])
const isShowLoading = useVModel(props, 'isShowLoading', emits)
const { $api } = useNuxtApp()
const store = useaiAnalyticsStore()
const { tableNameList } = storeToRefs(store)
const store1 = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store1)
const isShowSelectCatalogModal = ref<boolean>(false) //是否显示选择目录弹框
const isPublishCatalog = ref<boolean>(true) //是否发布至模型目录
const searchModel = ref<string>('')
const searchModelRes = ref<any[]>([])
const isShowSearchModelRes = ref<boolean>(false)
const selectPublishMode = ref<object>({})
const existingModelField = ref<{
  [key: string]: any
}>({})
const targetField = ref<any[]>([]) //目标字段
const belongSQLDataRefreshPlan = ref({})
const belongSQLDataType = ref<string>('RealTimeView') //模型数据更新方式-默认实时视图

let frame: number | null = null
const tableContainerHeight = 230
const itemHeight = 32 // 每个数据项的高度
const buffer = 5 // 缓冲区行数
const startIndex = ref(0) // 当前滚动的起始索引
const offsetY = ref(0) // 滚动偏移量

const existingModelData = computed(() => {
  return chataiData.value.modelData.filter((item) => !item.isCatalog)
})

const columns = computed(() => {
  let result = props.item.tableRes.content.fields
  let fileds = result?.filter((item) => item.name !== 'id')
  let newFileds = fileds?.map((item) => {
    return {
      ...item,
      title: item.name_cn ?? item.name ?? item.code,
      dataIndex: item.name ?? item.code,
      name_en: item.name ?? item.code,
      width: '180px',
      value: item.name,
      label: item.name_cn ?? item.name ?? item.code,
    }
  })
  return newFileds
})

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

const handleSelectExistingModel = async (item: any) => {
  props.handleSelectTable()
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
}

// 选择模型目录弹框取消事件
const handleCancel = () => {
  isShowSelectCatalogModal.value = false
}

// 设置模型数据更新频率
const handleOkBySetUpdateTime = (value: object) => {
  belongSQLDataRefreshPlan.value = value
}

// 选择模型目录弹框确定事件
const handleOk = async (selectedCatalog: object) => {
  try {
    isShowSelectCatalogModal.value = false
    isShowLoading.value = true
    let exeRes = null
    let datas = props.item.tableRes.content.datas
    let fields = props.item.tableRes.content.fields
    let findSql = props.item.detail.find((item) => item.type === 'sql')
    if (isPublishCatalog.value) {
      let params = {
        tableData: JSON.stringify({ fields, datas }),
        sql: findSql.content,
        question: '',
        modelName: tableNameList.value[props.item.id],
        belongCatalog: selectedCatalog.id,
        belongSQLDataRefreshPlan: belongSQLDataRefreshPlan.value,
        belongSQLDataType: belongSQLDataType.value,
      }
      exeRes = await $api.smartData.publicModelToCatalog(params)
    } else {
      let params = {
        mapingData: selectedCatalog,
        tableData: JSON.stringify({ fields, datas }),
        existingModelId: selectPublishMode.value.id,
        belongSQLDataRefreshPlan: belongSQLDataRefreshPlan.value,
        belongSQLDataType: belongSQLDataType.value,
      }
      exeRes = await $api.smartData.publishModelToExistingModel(params)
    }
    exeRes && exeRes?.success && message.success('保存成功')
  } catch (e: any) {
    console.log(e)
  } finally {
    isPublishCatalog.value && (await loadProjectTables(route.value.params.baseId, true))
    isShowLoading.value = false
  }
}

const setUpdateTimeValue = (value: string) => {
  belongSQLDataType.value = value
}

//可见行数
const visibleCount = computed(() => {
  return Math.ceil(tableContainerHeight / itemHeight)
})

// 数据总高度
const totalHeight = computed(() => {
  let allRes = isShowSearchModelRes.value ? searchModelRes.value : existingModelData.value
  return allRes.length * itemHeight
})

const visibleItems = computed(() => {
  const end = startIndex.value + visibleCount.value + buffer
  let allRes = isShowSearchModelRes.value ? searchModelRes.value : existingModelData.value
  return allRes.slice(startIndex.value, end)
})

// 滚动事件处理程序
const onScroll = (event: any) => {
  if (frame) {
    cancelAnimationFrame(frame)
  }
  frame = requestAnimationFrame(() => {
    const scrollTop = event.target.scrollTop
    startIndex.value = Math.max(0, Math.floor(scrollTop / itemHeight))
    offsetY.value = scrollTop - (scrollTop % itemHeight)
  })
}
</script>

<template>
  <div>
    <!-- 搜索框 -->
    <div class="search-existing-model-to-ai">
      <a-input placeholder="搜索表格" v-model:value="searchModel" @keyup.enter="handleSearchModel()">
        <template #suffix>
          <CloseOutlined @click="handleClickCleanBtn()" v-show="searchModel?.trim()" style="margin-right: 5px" />
          <search-outlined @click="handleSearchModel()" />
        </template>
      </a-input>
    </div>
    <!-- 现有模型列表 -->

    <div class="existing-model-to-ai" @scroll="onScroll">
      <div
        :style="{
          height: `${totalHeight}px`,
        }"
      >
        <div
          :style="{
            transform: `translateY(${offsetY}px)`,
          }"
        >
          <a-menu-item v-for="item in visibleItems" :key="item.id" @click="handleSelectExistingModel(item)">
            <NcTooltip class="truncate" show-on-truncate-only>
              <template #title>
                {{ item.name_cn }}
              </template>
              <span
                class="text-ellipsis overflow-hidden"
                :style="{
                  wordBreak: 'keep-all',
                  whiteSpace: 'nowrap',
                }"
              >
                {{ item.name_cn }}
              </span>
            </NcTooltip>
          </a-menu-item>
        </div>
      </div>

      <div class="no-data" v-if="isShowSearchModelRes && searchModelRes.length === 0">暂无数据</div>
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
</template>

<style lang="scss">
.ant-menu-sub {
  border-radius: 5px;
  width: 270px;
  max-width: 270px;
}
.existing-model-to-ai {
  height: 230px;
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
  .ant-dropdown-menu-item {
    padding: 5px 12px 5px 19px !important;
  }
}

.search-existing-model-to-ai {
  width: 100%;
  padding: 10px 16px 16px;
  overflow: hidden;
  box-sizing: border-box;
  .ant-input-affix-wrapper {
    border-radius: 5px;
    width: 100%;
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
