<script lang="ts" setup>
import { CloseOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  visible: boolean
  closeModal: (value: boolean) => void
  fromTabled: any
  fromFields: any
  base: any
}>()
onMounted(() => {})
const { $api, $poller } = useNuxtApp()
const { openTable: _openTable } = useTableNew({ baseId: props.base.id! })
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const viewsStore = useViewsStore()
const { showTableDatas } = storeToRefs(viewsStore)
const modelTitle = ref('复制至')
const isSelectTable = ref(true)
const searchTable = ref<string>('')
const isShowSearchTableRes = ref(false)
const searchTableRes = ref([])
const selectedTable = ref(null)
const selectedTableFields = ref([])
const isLoadingNextStep = ref(false)
const isFullCopy = ref(false)
const isChangeSelectedTable = ref(false)
const selectValue = ref<{
  [key: string]: any
}>({})
const tablesfields = ref<{
  [key: string]: any
}>({})
const visibleOfTip = ref(false)

const tip = ref('正在处理，请稍后查看')
const isLoading = ref(false)

const allTalbe = computed(() => {
  if (chataiData.value.modelData.length) {
    let data = chataiData.value.modelData.filter((item) => !item.isCatalog && item.id)
    return data
  }
  return []
})

const sourceFields = computed(() => {
  let data = props.fromFields.map((item) => ({
    ...item,
    value: item.id,
    label: item.title,
  }))
  return data
})

const disabledCheck = computed(() => {
  let res = showTableDatas.value.every((row) => !row.rowMeta?.selected)
  isFullCopy.value = res
  return res
})

const recordIds = computed(() => {
  let res = []
  showTableDatas.value.map((item) => {
    if (item.rowMeta?.selected) res.push(item.row.id)
  })
  return res
})

// 取消/返回
const handModelLeftBtn = () => {
  if (isSelectTable.value) {
    props.closeModal(false)
  } else {
    modelTitle.value = '复制至'
    isSelectTable.value = true
  }
}

//下一步/复制
const handModelRightBtn = async () => {
  try {
    if (isSelectTable.value) {
      await handleNextStepBtn()
    } else {
      await handleCopyBtn()
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoadingNextStep.value = false
  }
}

//下一步
const handleNextStepBtn = async () => {
  selectedTableFields.value = []
  if (!tablesfields.value.hasOwnProperty(selectedTable.value.id)) {
    isLoadingNextStep.value = true
    let tableInfo = await $api.smartData.entity({ entityId: selectedTable.value.id })
    let fields = tableInfo[0].fields ?? []
    fields.map((item) => !item?.isSystem && selectedTableFields.value.push(item))
    tablesfields.value[selectedTable.value.id] = selectedTableFields.value
  } else {
    selectedTableFields.value = tablesfields.value[selectedTable.value.id]
  }
  modelTitle.value = '复制数据'
  isSelectTable.value = false
}

//复制
const handleCopyBtn = async () => {
  let columnMappings = []
  for (const key in selectValue.value) {
    let obj = { fromColumnId: selectValue.value[key], toColumnId: key }
    columnMappings.push(obj)
  }
  const params = {
    type: isFullCopy.value ? 'full' : 'selected',
    fromTableId: props.fromTabled.id,
    toTableId: selectedTable.value.id,
    columnMappings,
  }
  if (!isFullCopy.value) params.recordIds = recordIds.value
  let res = await $api.smartData.copyTableData(params)
  getProgress(res.id)
  props.closeModal(false)
  isLoading.value = true
  visibleOfTip.value = true
}

const getProgress = (id: string) => {
  $poller.subscribe(
    { id: id },
    async (data: {
      id: string
      status?: string
      data?: {
        error?: {
          message: string
        }
        message?: string
        result?: any
      }
    }) => {
      if (data.status !== 'close') {
        if (data.status === JobStatus.COMPLETED) {
          tip.value = '完成数据复制'
          isLoading.value = false
        } else if (data.status === JobStatus.FAILED) {
          console.log('data', data)
        }
      }
    },
  )
}

const handleSelectTable = (table: any) => {
  selectedTable.value = table
}

const handleSearchTable = () => {
  if (!searchTable.value.trim()) {
    handleClickCleanBtn()
  } else {
    isShowSearchTableRes.value = true
    searchTableRes.value = allTalbe.value.filter((item: any) => {
      return item.name_cn.indexOf(searchTable.value) > -1
    })
  }
}

const handleClickCleanBtn = () => {
  searchTable.value = ''
  isShowSearchTableRes.value = false
}

//选择字段
const handleSelectSourceField = (option: any, targetFieldItem: any) => {
  if (targetFieldItem.fieldSysDataType === 'number' && option.dt !== 'number') {
    message.warning('目标字段类型为number,来源目标字段类型与之不匹配')
    return
  }
  selectValue.value[targetFieldItem.id] = option ? option.id : ''
}

const openTable = () => {
  visibleOfTip.value = false
  _openTable({
    ...selectedTable,
    base_id: props.base.id,
    id: selectedTable.value.id,
    title: selectedTable.value.name_cn,
    table_name: selectedTable.value.name,
    type: 'table',
  })
}
</script>

<template>
  <a-modal class="data-dataMigration-modal" :closable="false" :visible="visible" :width="800">
    <template #title>
      <div class="data-dataMigration-modal-header">
        <div class="title text-lg font-medium">
          {{ modelTitle }}
        </div>
        <close-outlined class="colse-btn" @click="closeModal(false)" />
      </div>
    </template>

    <div class="data-dataMigration-modal-content">
      <div class="table-list" v-show="isSelectTable || isLoadingNextStep">
        <div class="search-table">
          <a-input placeholder="搜索表" v-model:value="searchTable" @keyup.enter="handleSearchTable()">
            <template #suffix>
              <CloseOutlined @click="handleClickCleanBtn()" v-show="searchTable.trim()" style="margin-right: 5px" />
              <search-outlined @click="handleSearchTable()" />
            </template>
          </a-input>
        </div>
        <a-menu
          v-if="(isShowSearchTableRes && searchTableRes.length) || (!isShowSearchTableRes && allTalbe.length)"
          class="table-menu"
        >
          <a-menu-item
            v-for="item in isShowSearchTableRes ? searchTableRes : allTalbe"
            :class="{ 'ant-menu-item-selected': selectedTable && item.id === selectedTable.id }"
            :key="item.id"
            @click="handleSelectTable(item)"
          >
            <GeneralTableIcon :meta="item" class="text-gray-500" />{{ item.name_cn }}</a-menu-item
          >
        </a-menu>
        <div v-else class="no-data table-menu">暂无数据</div>
      </div>
      <div v-show="!isSelectTable && !isLoadingNextStep" class="fields-mapping">
        <div class="fields-mapping-header">
          <span class="destination">目标字段</span>
          <span class="source">来源字段</span>
        </div>
        <div class="fields-mapping-body">
          <div v-for="item in selectedTableFields" :key="item.id" class="list-item">
            <div>{{ item?.fieldName_cn || item.fieldName }}</div>
            <a-select
              class="select"
              :value="selectValue.hasOwnProperty(item.id) ? selectValue[item.id] : ''"
              :options="sourceFields"
              @change="(value: string, option: any)=>{handleSelectSourceField(option,item)}"
            >
            </a-select>
          </div>
        </div>
        <div class="fields-mapping-footer">
          <a-checkbox v-model:checked="isFullCopy" :disabled="disabledCheck">{{ '复制全部数据' }} </a-checkbox>
        </div>
      </div>
    </div>

    <template #footer>
      <NcButton type="secondary" @click="handModelLeftBtn">{{ isSelectTable ? '取消' : '返回' }}</NcButton>
      <NcButton
        key="submit"
        type="primary"
        :disabled="!selectedTable"
        :loading="isLoadingNextStep"
        @click="() => handModelRightBtn()"
      >
        {{ isSelectTable ? '下一步' : '复制' }}
        <template #loading> {{ '下一步' }}</template>
      </NcButton>
    </template>
  </a-modal>
  <div class="tip-content" v-if="visibleOfTip">
    <div class="loading" v-if="isLoading"><a-spin /></div>
    <div>
      <div class="tip">{{ tip }}</div>
      <div class="look" @click="openTable()"><a-button type="link" size="middle" :disabled="isLoading">马上查看</a-button></div>
    </div>
  </div>
</template>

<style lang="scss">
.data-dataMigration-modal {
  .ant-modal-content {
    padding: 0 16px 0 16px !important;
    .ant-modal-header {
      padding: 16px 0 !important;
      .data-dataMigration-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .title {
          height: 100%;
          width: calc(100% - 32px);
        }
        .colse-btn {
          position: relative;
          top: 0px;
          color: rgb(99, 107, 116);
        }
        .text-lg {
          font-size: 18px;
        }
      }
    }
    .ant-modal-body {
      padding: 8px 0 !important;
      .data-dataMigration-modal-content {
        width: 100%;
        .search-table {
          width: 100%;
          margin-bottom: 16px;
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
        .table-list {
          .ant-menu-vertical {
            border: none;
          }
          .table-menu {
            height: 450px;
            overflow-x: hidden;
            overflow-y: auto;

            .ant-menu-item {
              padding: 0 8px !important;
              height: 32px !important;
              margin: 0px !important;
              line-height: 32px !important;
              &:hover {
                --tw-bg-opacity: 0.8;
                background-color: rgba(231, 231, 233, var(--tw-bg-opacity));
                color: rgba(0, 0, 0, 0.85) !important;
              }
              .nc-icon {
                position: relative;
                top: -1px;
                margin-right: 3px;
              }
            }
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
          }
          .no-data {
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(0, 0, 0, 0.25);
            font-size: 14px;
          }
        }
        .fields-mapping {
          margin-top: 16px;
          padding: 8px 28px;
          .fields-mapping-header {
            padding-bottom: 16px;
            padding-left: 14px;
            border-bottom: 1px solid rgb(231, 231, 233);
            .destination {
              margin-right: 450px;
            }
          }
          .fields-mapping-body {
            height: 373px;
            overflow-x: hidden;
            overflow-y: auto;
            .list-item {
              height: 41px;
              line-height: 41px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid rgb(231, 231, 233);
              padding-left: 5px;
              &:hover {
                background-color: #fafafa;
              }
              .ant-select {
                width: 208px;
                margin-right: 18px;
              }
            }
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
          }
          .fields-mapping-footer {
            margin: 32px 0 0 0;
          }
        }
      }
    }
    .ant-modal-footer {
      padding: 16px;
    }
  }
}
.tip-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  z-index: 999;
  padding: 8px 41px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  .loading {
    margin-right: 28px;
  }
  .tip {
    margin-top: 5px;
  }
  .look {
    cursor: pointer;
    color: var(--ant-primary-color);
    text-align: center;
    height: 31px;
    line-height: 31px;
  }
}
</style>
