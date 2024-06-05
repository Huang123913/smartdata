<script lang="ts" setup>
import { ChatPlaygroundViewStoreEvents } from '#imports'
import { Empty } from 'ant-design-vue'

const props = defineProps<{
  visible?: boolean
  columns?: any[]
  tableData?: any[]
}>()
onMounted(() => {})

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
let frame: number | null = null
const itemHeight = 32 // 每个数据项的高度
const buffer = 5 // 缓冲区行数
const tableRef = ref(null)
const startIndex = ref(0) // 当前滚动的起始索引
const offsetY = ref(0) // 滚动偏移量
//可见行数
const visibleCount = computed(() => {
  return Math.ceil(568 / itemHeight)
})

// 数据总高度
const totalHeight = computed(() => {
  return props.tableData.length * itemHeight
})

const visibleItems = computed(() => {
  const end = startIndex.value + visibleCount.value + buffer
  return props.tableData.slice(startIndex.value, end)
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

const handleModalOk = () => {}

const handleCancel = () => {}
</script>

<template>
  <a-modal class="intelligent-import-preview" title="数据" :visible="true" :afterClose="hanldeAfterClose" @cancel="handleCancel">
    <div ref="tableRef" class="nc-grid-wrapper min-h-0 flex-1 relative nc-scrollbar-x-lg !overflow-auto" @scroll="onScroll">
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
                'cursor': 'pointer',
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
                    'display': 'inline-block',
                    'flex': 1,
                    'position': 'relative',
                    'top': '2px',
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
            <tr
              v-for="(row, rowIndex) of visibleItems"
              class="nc-grid-row !xs:h-14"
              :style="{ height: `32px` }"
              :data-testid="`grid-row-${rowIndex}`"
            >
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
    <!-- <div v-if="tableData.length === 0" class="no-data">
      <a-empty :description="'暂无数据'" :image="simpleImage" />
    </div> -->
    <template #footer>
      <div>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" @click="handleModalOk">导入数据</a-button>
      </div>
    </template>
  </a-modal>
</template>

<style lang="scss">
.intelligent-import-preview {
  .ant-modal-content {
    padding: 8px 16px 0 16px !important;
    width: 900px;
    .ant-modal-header {
      padding: 16px 0 !important;
    }
    .ant-modal-body {
      padding: 16px 0 16px 8px !important;
      height: 600px;
    }
    .ant-modal-footer {
      padding: 16px;
    }
  }
  .ant-modal-close {
    top: 4px !important;
    right: 10px;
  }
  .ant-modal-footer {
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
</style>

<style lang="scss" scoped>
.header-title {
  &:hover .th-edit-icon {
    opacity: 1;
  }
}
.th-edit-icon {
  margin-left: 2px;
  position: relative;
  top: -2px;
  opacity: 0;
}
.th-input {
  position: relative;
  top: 2px;
}
.nc-grid-wrapper {
  position: relative;
}
.no-data {
  position: absolute;
  top: 40%;
  left: 50%;
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
