<script lang="ts" setup>
import { ref } from '#imports'

import { CloseOutlined, SearchOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  handleSelectExistingModel: (item: any) => void
  show: boolean
}>()
const store = useaiAnalyticsStore()
const { isIntelligentQuestionOpen } = storeToRefs(store)
const store1 = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store1)
const searchModel = ref<string>('')
const searchModelRes = ref<any[]>([])
const isShowSearchModelRes = ref<boolean>(false)

let frame: number | null = null
const tableContainerHeight = 230
const itemHeight = 40 // 每个数据项的高度
const buffer = 5 // 缓冲区行数
const startIndex = ref(0) // 当前滚动的起始索引
const offsetY = ref(0) // 滚动偏移量

const existingModelData = computed(() => {
  if (isIntelligentQuestionOpen.value) {
    let data = chataiData.value.modelData.filter((item) => !item?.isCatalog)
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
  props.handleSelectExistingModel(item)
  searchModel.value = ''
  isShowSearchModelRes.value = false
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
  if (props.show) {
    const end = startIndex.value + visibleCount.value + buffer
    let allRes = isShowSearchModelRes.value ? searchModelRes.value : existingModelData.value
    return allRes.slice(startIndex.value, end)
  }
  return []
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
watch(
  () => props.show,
  (newVal, oldVal) => {
    newVal && handleClickCleanBtn()
  },
)
</script>

<template>
  <div class="quick-table-list" v-if="isIntelligentQuestionOpen && show">
    <!-- 搜索框 -->
    <div class="search-quick-table-list">
      <a-input placeholder="搜索表格" v-model:value="searchModel" @keyup.enter="handleSearchModel()">
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

<style lang="scss" scoped>
.quick-table-list {
  position: absolute;
  bottom: 92%;
  width: 93%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 1px -1px, rgba(0, 0, 0, 0.14) 0px 0px 1px 0px, rgba(0, 0, 0, 0.12) 0px 0px 3px 0px !important;
}
.search-quick-table-list {
  width: 100%;
  padding: 10px 12px 0;
  overflow: hidden;
  box-sizing: border-box;

  .ant-input-affix-wrapper {
    border-radius: 10px;
    width: 100%;
    height: 45px;
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
