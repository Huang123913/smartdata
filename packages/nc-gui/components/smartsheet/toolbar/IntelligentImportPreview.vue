<script lang="ts" setup>
import { ChatPlaygroundViewStoreEvents } from '#imports'
import { Empty } from 'ant-design-vue'

import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  visible: boolean
  propsColumns: any[]
  propsTableData: any[]
  closePreview: (value: boolean) => void
  activeTable: any
  isDetailImport?: boolean
}>()
const { eventBus: eventBusChatPlayGround } = useChatPlaygroundViewStore()
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
const tableContainerHeight = 568
let frame: number | null = null
const itemHeight = 32 // 每个数据项的高度
const buffer = 5 // 缓冲区行数
const startIndex = ref(0) // 当前滚动的起始索引
const offsetY = ref(0) // 滚动偏移量
const loading = ref(false)
const { $api } = useNuxtApp()
const belongSQLDataRefreshPlan = ref({})
const modelUpdateTypeValue = ref<string>('') //模型数据更新方式
const { xWhere } = useSmartsheetStoreOrThrow()
const meta = inject(MetaInj, ref())
const { activeView } = storeToRefs(useViewsStore())
const { loadData } = useViewData(meta, activeView, xWhere)
const { eventBus } = useSmartsheetStoreOrThrow()
const columns = computed(() => {
  if (!props.propsColumns.length) return []
  let fileds = props.propsColumns.filter((item) => item.name !== 'id')
  let newFileds = fileds.map((item) => {
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

const tableData = computed(() => {
  if (!props.propsTableData.length) return []
  let newDatas = props.propsTableData.map((item: any, index: number) => {
    let newItem = { ...item, indexItem: index + 1 }
    return newItem
  })
  return newDatas
})

//可见行数
const visibleCount = computed(() => {
  return Math.ceil(tableContainerHeight / itemHeight)
})

// 数据总高度
const totalHeight = computed(() => {
  return tableData.value.length * itemHeight
})

const visibleItems = computed(() => {
  const end = startIndex.value + visibleCount.value + buffer
  return tableData.value.slice(startIndex.value, end)
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

const handleModalOk = async () => {
  try {
    loading.value = true
    let result = null
    if (props.isDetailImport) {
      result = await $api.smartData.insertDataToTable({ insertDatas: props.propsTableData, tableId: props.activeTable.id })
    } else {
      result = await $api.smartData.importData({
        entityId: props.activeTable.id,
        tableData: JSON.stringify(props.propsTableData),
        belongSQLDataRefreshPlan: belongSQLDataRefreshPlan.value,
        belongSQLDataType: modelUpdateTypeValue.value,
      })
    }
    if (result && result?.success) {
      await loadData()
      eventBus.emit(SmartsheetStoreEvents.DATA_RELOAD)
      message.success('成功导入数据')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    props.closePreview(false)
  }
}

const handleCancel = () => {
  props.closePreview(false)
}

const handleOkBySetUpdateTime = (value) => {
  belongSQLDataRefreshPlan.value = value
}
const handleSelectOptionClick = (item: any) => {
  modelUpdateTypeValue.value = item.value
  if (item.value === 'ScheduledRefresh') {
    eventBusChatPlayGround.emit(ChatPlaygroundViewStoreEvents.OPEN_SET_MODEL_DATA_UPDATE_TIME_MODAL)
  }
}
</script>

<template>
  <a-modal
    class="intelligent-import-preview"
    zIndex="998"
    :closable="false"
    :width="'max-content'"
    :visible="visible"
    :maskClosable="false"
    :style="{ '--set-height': tableData && tableData.length ? '600px' : '300px' }"
  >
    <template #title>
      <div class="intelligent-import-preview-header">
        <span class="text-lg font-medium">{{ isDetailImport ? '查询结果' : '数据预览' }}</span>
        <close-outlined class="colse-btn" @click="handleCancel" />
      </div>
    </template>

    <div class="nc-grid-wrapper min-h-0 flex-1 relative nc-scrollbar-x-lg !overflow-auto" @scroll="onScroll">
      <table class="xc-row-table nc-grid backgroundColorDefault !h-auto bg-white sticky top-0 z-5 bg-white">
        <thead>
          <tr class="!h-auto bg-white sticky top-0 z-5 bg-white desktop">
            <th
              class="caption nc-grid-cell w-[64px] min-w-[64px] text-gray-500"
              data-testid="grid-id-column"
              :style="{
                'border-right-width': '1px',
              }"
            >
              <div class="nc-no-label text-gray-500">#</div>
            </th>
            <th
              v-for="col in columns"
              :key="col.title"
              v-xc-ver-resize
              :data-col="col.id"
              :data-title="col.title"
              class="nc-grid-column-header text-gray-500 header-title"
              :style="{
                'min-width': '180px',
                'max-width': '180px',
                'width': '180px',
              }"
            >
              <NcTooltip class="truncate text" show-on-truncate-only :style="{ 'text-align': 'left' }">
                <template #title>
                  {{ col.title }}
                </template>
                <span
                  class="text-ellipsis overflow-hidden text-gray-500"
                  :style="{
                    'wordBreak': 'keep-all',
                    'whiteSpace': 'nowrap',
                    'font-size': '13px',
                    s,
                  }"
                  >{{ col.title }}</span
                >
              </NcTooltip>
            </th>
          </tr>
        </thead>
      </table>
      <div
        class="table-overlay"
        :style="{
          height: `${totalHeight}px`,
        }"
      >
        <table
          ref="smartTable"
          :style="{
            transform: `translateY(${offsetY}px)`,
          }"
          class="xc-row-table nc-grid backgroundColorDefault !h-auto bg-white relative pr-1 pb-1"
        >
          <tbody>
            <tr v-for="(row, rowIndex) of visibleItems" class="!xs:h-14" :style="{ height: `32px` }">
              <td
                :key="rowIndex"
                class="caption nc-grid-cell w-[64px] min-w-[64px] text-gray-500"
                :style="{
                  'min-width': '64px',
                  'max-width': '64px',
                  'width': '64px',
                }"
              >
                {{ row.indexItem }}
              </td>
              <td
                v-for="(columnObj, colIndex) of columns"
                :key="columnObj.id"
                class="caption nc-grid-cell w-[64px] min-w-[64px]"
                :style="{
                  'min-width': '180px',
                  'max-width': '180px',
                  'width': '180px',
                }"
              >
                <NcTooltip class="truncate" show-on-truncate-only>
                  <template #title>
                    {{ row[columnObj.name] }}
                  </template>
                  <span
                    class="text-ellipsis overflow-hidden"
                    :style="{
                      'wordBreak': 'keep-all',
                      'whiteSpace': 'nowrap',
                      'display': 'inline',
                      'color': '#4A5268',
                      'font-size': '13px',
                    }"
                  >
                    {{ row[columnObj.name] }}
                  </span>
                </NcTooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="tableData.length === 0" class="no-data">
      <a-empty :description="'暂无数据'" :image="simpleImage" />
    </div>

    <template #footer>
      <template v-if="!isDetailImport">
        <SmartdataChatPlaygroundViewRightIndexTableListSelectTableUpdateType
          :handleSelectOptionClick="handleSelectOptionClick"
          selectLabel="表格数据"
          selectTip="选择表格更新方式"
        />
      </template>
      <div v-else></div>

      <div class="right-btn">
        <NcButton type="secondary" @click="handleCancel">{{ $t('general.cancel') }}</NcButton>
        <NcButton
          key="submit"
          type="primary"
          label="导入数据"
          loading-label="导入数据"
          :loading="loading"
          @click="() => handleModalOk()"
        >
          {{ '导入数据' }}
          <template #loading> {{ '导入数据' }}</template>
        </NcButton>
      </div>
    </template>
  </a-modal>
  <SmartdataChatPlaygroundViewRightIndexTableListSetModelDataUpdateTimeModal :handleOk="handleOkBySetUpdateTime" />
</template>

<style lang="scss">
.intelligent-import-preview {
  .ant-modal-content {
    padding: 8px 16px 0 16px !important;
    width: max-content;
    max-width: 900px;
    min-width: 500px;
    .ant-modal-header {
      padding: 16px 0 !important;
      .ant-modal-title {
        font-size: 1.125rem;
        font-weight: 550;
        .intelligent-import-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
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
    }
    .ant-modal-body {
      height: var(--set-height);
      padding: 16px 0 16px 8px !important;
    }
    .ant-modal-footer {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      .ant-btn {
        border-radius: 0.5rem;
        color: rgb(55, 65, 81);
        font-weight: 550;
        &:hover {
          background-color: rgba(244, 244, 245);
          border-color: rgba(231, 231, 233);
        }
      }
      .ant-btn-primary {
        color: white;
        border: none;
        &:hover {
          background-color: rgba(41, 82, 204);
        }
      }
    }
  }
  .no-data {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);s
}
}
</style>

<style lang="scss" scoped>
.nc-grid-wrapper {
  position: relative;
  @apply h-full w-full;

  td,
  th {
    @apply border-gray-100 border-solid border-r bg-gray-100 p-0;
    min-height: 32px !important;
    height: 32px !important;
    position: relative;
    font-size: 13px;
    @apply px-3;
    & > div {
      overflow: hidden;
      @apply flex h-auto;
    }
  }

  th {
    @apply border-b-1 border-gray-200;
    @apply border-t-1 border-gray-200;
  }

  td {
    @apply bg-white border-b;
    text-overflow: ellipsis;
  }

  table {
    background-color: var(--nc-grid-bg);
    border-collapse: separate;
    border-spacing: 0;
  }

  thead th:nth-child(1) {
    position: sticky !important;
    left: 0;
    z-index: 5;
    @apply border-l-1 border-gray-200;
  }

  tbody td:nth-child(1) {
    position: sticky !important;
    left: 0;
    z-index: 4;
    background: white;
    @apply border-l-1;
    border-color: rgb(244, 244, 245);
  }
}
</style>
