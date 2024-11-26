<script lang="ts" setup>
import { ref } from '#imports'

const props = defineProps<{
  handleselectedTableForChart: (item: any) => void
}>()
const clicked = ref<boolean>(false)

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}

const store = useaiAnalyticsStore()
const { isIntelligentQuestionOpen } = storeToRefs(store)
const store1 = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store1)
const searchModel = ref<string>('')
const searchModelRes = ref<any[]>([])
const isShowSearchModelRes = ref<boolean>(false)
const input = ref<HTMLInputElement>()

let frame: number | null = null
const tableContainerHeight = 230
const itemHeight = 40 // 每个数据项的高度
const buffer = 5 // 缓冲区行数
const startIndex = ref(0) // 当前滚动的起始索引
const offsetY = ref(0) // 滚动偏移量

const existingModelData = computed(() => {
  if (isIntelligentQuestionOpen.value) {
    let projectMap = chataiData.value.projectMap
    let data: any[] = []
    for (const key in projectMap) {
      if (projectMap[key]) {
        data = projectMap[key]
        console.log('data', projectMap[key])
      }
    }
    return data
  }
  return []
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

const handleSelect = (item: any) => {
  searchModel.value = ''
  isShowSearchModelRes.value = false
  props.handleselectedTableForChart(item)
  clicked.value = false
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
  if (clicked.value) {
    const end = startIndex.value + visibleCount.value + buffer
    let allRes = isShowSearchModelRes.value ? searchModelRes.value : existingModelData.value
    return allRes.slice(startIndex.value, end)
  } else {
    return []
  }
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

watch(clicked, () => {
  if (clicked.value) {
    setTimeout(() => {
      nextTick(() => {
        console.log('clicked', clicked.value)
        input.value?.focus()
      })
    }, 2)
  }
})
</script>
<template>
  <NcDropdown
    :trigger="['click']"
    class="add-table-data-btn"
    :visible="clicked"
    @visibleChange="handleClickChange"
    :overlayClassName="'add-table-data-content'"
    placement="topLeft"
  >
    <div
      class="add-data"
      @click="
          (e:any) => {
            e.stopPropagation()
            clicked = true
          }
        "
    >
      <svg
        t="1729150242722"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="16639"
        width="16"
        height="16"
      >
        <path
          d="M414.72 1023.83c-141.91-6.102-258.56-45.185-325.376-108.929-16.64-15.914-36.608-41.728-44.203-57.088l-5.034-10.325 0.085-121.899c0.128-120.874 0.128-121.77 2.219-112.512 5.888 25.942 22.485 53.462 45.482 75.179 15.403 14.592 48.982 36.693 76.928 50.603 47.232 23.637 105.131 40.832 167.979 50.048 36.907 5.376 51.968 6.357 103.296 6.4 26.965 0.042 52.864-0.299 57.43-0.768l8.405-0.896v3.626c0 5.462 3.328 25.515 6.357 38.571 14.208 60.672 97.408 168.875 97.408 168.875-33.067 8.106-77.27 14.933-113.536 17.493-18.475 1.195-63.616 2.219-77.44 1.621z m0-302.55c-113.835-3.925-218.112-32.597-288.043-79.232-37.845-25.301-63.146-53.504-81.28-90.795l-5.29-10.88 0.085-119.552c0.128-118.656 0.128-119.509 2.219-110.25 4.266 18.986 14.762 39.637 29.226 57.642 8.448 10.496 22.059 23.723 29.696 28.886 2.816 1.877 9.558 6.613 14.976 10.453 54.486 38.741 129.792 66.261 216.491 78.933 37.888 5.547 51.712 6.4 105.643 6.4 40.704 0 55.296-0.426 70.4-2.005 105.173-11.05 187.008-38.187 252.245-83.584 16.256-11.307 19.883-14.165 29.099-22.784 21.376-19.968 38.442-48.47 44.202-73.899 2.134-9.344 2.134-9.088 2.219 88.32l0.128 97.622-13.013-2.304c-18.432-3.286-66.048-3.456-84.566-0.384-54.058 8.96-98.901 29.269-139.093 62.89a281.984 281.984 0 0 0-92.288 150.486l-2.56 11.136-5.376 0.725a1002.667 1002.667 0 0 1-66.005 2.73l-19.115-0.554z m-21.93-302.421a1046.613 1046.613 0 0 1-59.99-6.315c-62.89-9.216-120.747-26.41-167.979-50.048-65.749-32.81-105.685-73.216-121.258-122.667-3.584-11.349-4.523-38.656-1.75-52.309C59.051 101.376 174.464 29.525 332.8 6.357 370.688 0.811 384.512 0 438.4 0s67.755 0.81 105.643 6.4c62.805 9.173 120.704 26.41 167.978 50.005C781.525 91.136 824.96 137.387 835.03 187.52c2.731 13.653 1.792 40.96-1.792 52.352-7.85 24.875-19.84 44.63-39.765 65.28-56.363 58.453-158.293 98.56-283.477 111.659-16.982 1.706-101.675 3.2-117.206 2.048zM716.5 832.213l-29.098-2.816-5.504-5.504-13.867 44.288 8.32 9.728 47.104-12.501-6.912-5.547v-27.648z m52.651-277.034A214.955 214.955 0 0 0 554.411 769.92c0 117.76 96.981 214.741 214.741 214.741A214.955 214.955 0 0 0 983.893 769.92a214.912 214.912 0 0 0-214.741-214.741z m22.187 272.896l-2.816 2.816-47.104 47.104-83.115 24.917s-6.912 1.365-11.093-2.816c-4.139-4.139-2.774-11.05-2.774-11.05l24.918-81.707 47.104-47.104 2.816-2.816 76.16-77.568 72.021 72.064-76.117 76.16z m84.48-85.931l-72.022-72.021 9.686-9.686 72.064 72.022-9.728 9.685z m30.464-27.69l-11.051 11.05-72.021-72.021 11.05-11.051c9.686-9.728 19.414-1.365 19.414-1.365l52.608 52.608c0 1.365 9.685 9.685 0 20.778z"
          p-id="16640"
        ></path>
      </svg>
      <span>注入数据</span>
    </div>

    <template #overlay>
      <div>
        <!-- 搜索框 -->
        <div class="search-quick-table-list">
          <a-input ref="input" placeholder="搜索表格" v-model:value="searchModel" @keyup.enter="handleSearchModel()">
            <template #suffix>
              <CloseOutlined @click="handleClickCleanBtn()" v-show="searchModel?.trim()" style="margin-right: 5px" />
              <search-outlined @click="handleSearchModel()" />
            </template>
          </a-input>
        </div>
        <!-- 现有模型列表 -->
        <div class="existing-to-quick-table-list" @scroll="onScroll">
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
              <div class="list-item-style" v-for="item in visibleItems" :key="item?.id" @click="handleSelect(item)">
                <NcTooltip>
                  <template #title>
                    {{ item.name || item.name_cn }}
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
              </div>
            </div>
          </div>

          <div class="no-data" v-if="isShowSearchModelRes && searchModelRes.length === 0">暂无数据</div>
        </div>
      </div>
    </template>
  </NcDropdown>
</template>

<style lang="scss">
.add-table-data-content {
  .ant-dropdown-content {
    width: 223px;
  }
}
.add-data {
  box-shadow: inset 0 0 0 1px #e2e2e3;
  border-radius: 11px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  // margin-bottom: 8px;
  // margin-left: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<style lang="scss" scoped>
.search-quick-table-list {
  width: 100%;
  padding: 10px 12px 0;
  overflow: hidden;
  box-sizing: border-box;

  .ant-input-affix-wrapper {
    border-radius: 10px;
    width: 100%;
    height: 34px;
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
.existing-to-quick-table-list {
  height: 230px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 5px;
  .list-item-style {
    padding: 10px 0 10px 20px;
    height: 40px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
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
  .no-data {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.25);
    font-size: 14px;
  }
}
</style>
