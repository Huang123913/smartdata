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
    let result = await $api.smartData.importData({
      entityId: props.activeTable.id,
      tableData: JSON.stringify(props.propsTableData),
      belongSQLDataRefreshPlan: belongSQLDataRefreshPlan.value,
      belongSQLDataType: modelUpdateTypeValue.value,
    })
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
    :closable="false"
    :width="'max-content'"
    class="intelligent-import-preview"
    :visible="visible"
    :maskClosable="false"
    :style="{ '--set-height': tableData && tableData.length ? '600px' : '300px' }"
    zIndex="998"
  >
    <template #title>
      <div class="intelligent-import-preview-header">
        <span class="text-lg font-medium">{{ '数据预览' }}</span>
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
            <tr v-for="(row, rowIndex) of visibleItems" class="nc-grid-row !xs:h-14" :style="{ height: `32px` }">
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
    <!-- :disabled="!tableData.length" -->
    <template #footer>
      <SmartdataChatPlaygroundViewRightIndexTableListSelectTableUpdateType
        :handleSelectOptionClick="handleSelectOptionClick"
        selectLabel="表格数据"
        selectTip="选择表格更新方式"
      />
      <div>
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
  .text-lg {
    font-size: 18px;
  }
  .colse-btn {
    position: relative;
    top: 0px;
    color: rgb(99, 107, 116);
  }
  .intelligent-import-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
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
  .ant-modal-close {
    top: 4px !important;
  }
}
</style>

<style lang="scss" scoped>
.nc-grid-wrapper {
  position: relative;
}
.no-data {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);s
}
.nc-grid-pagination-wrapper .ant-dropdown-button {
  > .ant-btn {
    @apply !p-0 !rounded-l-lg hover:border-gray-300;
  }

  > .ant-dropdown-trigger {
    @apply !rounded-r-lg;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @apply !rounded-lg;
}
.nc-grid-wrapper {
  @apply h-full w-full;

  .nc-grid-add-new-cell:hover tr {
    @apply text-black !bg-gray-50;
  }

  td,
  th {
    @apply border-gray-100 border-solid border-r bg-gray-100 p-0;
    min-height: 32px !important;
    height: 32px !important;
    position: relative;
  }

  th {
    @apply border-b-1 border-gray-200;
    @apply border-t-1 border-gray-200;

    :deep(.name) {
      @apply text-small;
    }

    :deep(.nc-cell-icon),
    :deep(.nc-virtual-cell-icon) {
      @apply !w-3.5 !h-3.5 !text-small;
    }
  }

  .nc-grid-header th:last-child {
    @apply !border-b-1;
  }

  td {
    @apply bg-white border-b;
  }

  td,
  th {
    font-size: 13px;
    @apply px-3;

    &.align-top {
      @apply py-2;
    }

    &.align-middle {
      @apply py-0;
    }

    & > div {
      overflow: hidden;
      @apply flex h-auto;
    }

    :deep(.nc-cell),
    :deep(.nc-virtual-cell) {
      @apply !text-small;

      .nc-cell-field,
      input,
      textarea {
        @apply !text-small !p-0 m-0;
      }

      &:not(.nc-display-value-cell) {
        @apply text-gray-600;
        font-weight: 500;

        .nc-cell-field,
        input,
        textarea {
          @apply text-gray-600;
          font-weight: 500;
        }
      }

      .nc-cell-field,
      a.nc-cell-field-link,
      input,
      textarea {
        @apply !p-0 m-0;
      }

      &.nc-cell-longtext {
        @apply leading-[18px];

        textarea {
          @apply pr-2;
        }
      }

      .ant-picker-input {
        @apply text-small leading-4;
        font-weight: 500;

        input {
          @apply text-small leading-4;
          font-weight: 500;
        }
      }

      &.nc-cell-attachment {
        .nc-attachment-cell {
          .nc-attachment-wrapper {
            @apply !py-0.5;

            .nc-attachment {
              @apply !min-h-4;
            }
          }
        }
      }

      &.nc-cell-longtext .long-text-wrapper .nc-rich-text-grid {
        @apply pl-0 -ml-1;
      }

      .ant-select:not(.ant-select-customize-input) {
        .ant-select-selector {
          @apply !border-none flex-nowrap pr-4.5;
        }
        .ant-select-arrow {
          @apply right-[3px];
        }
      }
      .ant-select-selection-search-input {
        @apply !h-[23px];
      }
    }
  }

  table {
    background-color: var(--nc-grid-bg);

    border-collapse: separate;
    border-spacing: 0;
  }

  td {
    text-overflow: ellipsis;
  }

  td.active::after {
    content: '';
    position: absolute;
    z-index: 3;
    height: calc(100% + 2px);
    width: calc(100% + 2px);
    left: -1px;
    top: -1px;
    pointer-events: none;
  }

  td.active::after {
    @apply text-primary border-current bg-primary bg-opacity-5;
  }

  td.active.readonly::after {
    @apply text-primary bg-grey-50 bg-opacity-5 !border-gray-200;
  }

  td.active-cell::after {
    @apply border-1 border-solid text-primary border-current bg-primary bg-opacity-3;
  }

  td.filling::after {
    content: '';
    position: absolute;
    z-index: 3;
    height: calc(100% + 2px);
    width: calc(100% + 2px);
    left: -1px;
    top: -1px;
    pointer-events: none;
  }

  td.filling::after {
    @apply border-1 border-dashed text-primary border-current bg-gray-100 bg-opacity-50;
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

  .desktop {
    thead th:nth-child(2) {
      position: sticky !important;
      z-index: 5;
      left: 64px;
      @apply border-r-1;
      border-color: rgb(244, 244, 245);
    }

    tbody tr:not(.nc-grid-add-new-cell) td:nth-child(2) {
      position: sticky !important;
      z-index: 4;
      left: 64px;
      background: white;
      @apply border-r-1;
      border-color: rgb(244, 244, 245);
    }
  }

  .nc-grid-skeleton-loader {
    thead th:nth-child(2) {
      @apply border-r-1 !border-r-gray-50;
    }

    tbody td:nth-child(2) {
      @apply border-r-1 !border-r-gray-50;
    }
  }
}

:deep(.resizer:hover),
:deep(.resizer:active),
:deep(.resizer:focus) {
  @apply bg-blue-500/50;
  cursor: col-resize;
}

.nc-grid-row {
  .nc-row-expand-and-checkbox {
    @apply !xs:hidden w-full items-center justify-between;
  }

  .nc-expand {
    &:not(.nc-comment) {
      @apply hidden;
    }

    &.nc-comment {
      display: flex;
    }
  }

  &.active-row,
  &:not(.mouse-down):hover {
    .nc-row-no.toggle {
      @apply hidden;
    }

    .nc-expand {
      @apply flex;
    }

    .nc-row-expand-and-checkbox {
      @apply !xs:hidden flex;
    }

    &:not(.selected-row) {
      td.nc-grid-cell:not(.active),
      td:nth-child(2):not(.active) {
        @apply !bg-gray-50 border-b-gray-200 border-r-gray-200;
      }
    }
  }

  &.selected-row {
    td.nc-grid-cell:not(.active),
    td:nth-child(2):not(.active) {
      @apply !bg-[#F0F3FF] border-b-gray-200 border-r-gray-200;
    }
  }

  &:not(.selected-row):has(+ .selected-row) {
    td.nc-grid-cell:not(.active),
    td:nth-child(2):not(.active) {
      @apply border-b-gray-200;
    }
  }

  &:not(.active-row):has(+ .active-row),
  &:not(.mouse-down):has(+ :hover) {
    &:not(.selected-row) {
      td.nc-grid-cell:not(.active),
      td:nth-child(2):not(.active) {
        @apply border-b-gray-200;
      }
    }
  }
}

.nc-grid-header {
  &:hover {
    .nc-no-label {
      @apply hidden;
    }

    .nc-check-all {
      @apply flex;
    }
  }
}

.nc-required-cell {
  box-shadow: inset 0 0 2px #f00;
}

.nc-fill-handle {
  @apply w-[6px] h-[6px] absolute rounded-full bg-red-500 !pointer-events-auto mt-[-4px] ml-[-4px];
}

.nc-fill-handle:hover,
.nc-fill-handle:active,
.nc-fill-handle:focus {
  @apply w-[8px] h-[8px] mt-[-5px] ml-[-5px];
}

:deep(.ant-skeleton-input) {
  @apply rounded text-gray-100 !bg-gray-100 !bg-opacity-65;
  animation: slow-show-1 5s ease 5s forwards;
}
</style>
