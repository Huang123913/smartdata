<script lang="ts" setup>
import { Empty } from 'ant-design-vue'

const props = defineProps<{
  item: any
  contentWidth?: number
}>()

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
let frame: number | null = null
const tableContainerHeight = 400
const itemHeight = 32 // 每个数据项的高度
const buffer = 5 // 缓冲区行数
const startIndex = ref(0) // 当前滚动的起始索引
const offsetY = ref(0) // 滚动偏移量
const tdWidth = ref('180px')
const columns = computed(() => {
  if (!props.item.data.columns.length) return []
  if (props.contentWidth) {
    let columnLength = props.item.data.columns.length
    let calculativeWidth = props.contentWidth - 64
    tdWidth.value =
      calculativeWidth > 180 * columnLength
        ? `${Math.floor(calculativeWidth / columnLength) - (columnLength > 1 ? 10 : 18)}px`
        : '180px'
  }
  let newFileds = props.item.data.columns.map((item) => {
    return {
      title: item,
      name_en: item,
      width: tdWidth.value,
      value: item,
      label: item,
      name: item,
    }
  })
  return newFileds
})

const tableData = computed(() => {
  if (!props.item.data.tabledata.length) return []
  let fields = props.item.data.columns
  let newDatas: any[] = []
  props.item.data.tabledata.map((item: any, index: number) => {
    let data = { index: index + 1 }
    fields.map((field: string, index: number) => {
      data[field] = item[index]
    })
    newDatas.push(data)
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
</script>

<template>
  <div
    :style="{ 'max-height': '400px', 'min-height': '76px' }"
    class="nc-grid-wrapper flex-1 relative nc-scrollbar-x-lg !overflow-auto"
    @scroll="onScroll"
  >
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
              'min-width': col.width,
              'max-width': col.width,
              'width': col.width,
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
              {{ row.index }}
            </td>
            <td
              v-for="columnObj of columns"
              :key="columnObj.id"
              class="caption nc-grid-cell w-[64px] min-w-[64px]"
              :style="{
                'min-width': tdWidth,
                'max-width': tdWidth,
                'width': tdWidth,
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
    <div v-if="tableData.length === 0" class="no-data">
      <a-empty :description="'暂无数据'" :image="simpleImage" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nc-grid-wrapper {
  position: relative;
  @apply h-full;
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
.no-data {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
}
</style>
