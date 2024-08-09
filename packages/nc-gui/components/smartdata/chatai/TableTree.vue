<script lang="ts" setup>
import { ref } from '#imports'
import { ChataiStoreEvents } from '~/lib/enums'

import { CloseOutlined, SearchOutlined } from '@ant-design/icons-vue'

import catalog from '../../../assets/img/catalog.svg'
import model from '../../../assets/img/model.svg'
import reverseSelectionGrey from '../../../assets/img/reverse-selection-grey.svg'
import reverseSelection from '../../../assets/img/reverse-selection.svg'

const chataiStore = useChataiStore()
const { isOpenTableTree, chataiData, sessionTable } = storeToRefs(chataiStore)
const { getCheckedTableData, createNewSession, eventBusToChatai } = chataiStore

const searchModelText = ref<string>('') //搜索模型文本
const isShowModelResult = ref<boolean>(false) //是否显示搜索模型的结果
const searchModelResult = ref<any[]>([]) //搜索模型的结果
const searchModelResultTree = ref<any[]>([]) //搜索模型的结果
const checkedKeys = ref<string[]>([]) //勾选的模型
const expandedKeys = ref<string[]>(['0-0', 'catalog'])
const elementATree = ref(null)
const scrollYHeight = ref(0)
const isLoading = ref(false)

onMounted(() => {
  // getCheckedTableData(checkedKeys.value)  有可能从路由获取用户传入的表格id
  if (elementATree.value) scrollYHeight.value = parseInt(elementATree.value?.clientHeight) - 2
})

watch(elementATree, () => {
  elementATree.value && resizeObserver.observe(elementATree.value)
})

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === elementATree.value) {
      scrollYHeight.value = parseInt(entry.contentRect.height)
    }
  }
})

// 是否可以反选
const isCanResverSession = computed(() => {
  if (isShowModelResult.value) {
    return (
      searchModelResult.value.some((item) => checkedKeys.value.includes(item.id)) &&
      !searchModelResult.value.every((item) => checkedKeys.value.includes(item.id))
    )
  } else {
    return checkedKeys.value.length && !checkedKeys.value.includes('0-0')
  }
})

//反选
const handleReverseSelection = () => {
  if (!isCanResverSession) return
  if (isShowModelResult.value) {
    let newCheckedKeys = searchModelResult.value.filter((item) => !checkedKeys.value.includes(item.id)).map((item) => item.id)
    let checkedKeysBySearch = searchModelResult.value.filter((item) => checkedKeys.value.includes(item.id)).map((item) => item.id)
    newCheckedKeys = newCheckedKeys.filter((key) => key !== 'catalog' && key)
    checkedKeys.value.push(...newCheckedKeys)
    checkedKeysBySearch.map((item) => cancelParentNode(item))
  } else {
    let originalSelected = [...checkedKeys.value]
    let newCheckedKeys = chataiData.value.allTableData
      .filter((item) => !checkedKeys.value.includes(item.id))
      .map((item) => item.id)
    newCheckedKeys = newCheckedKeys.filter((key) => key !== '0-0' && key)
    checkedKeys.value = newCheckedKeys
    originalSelected.map((item) => cancelParentNode(item))
  }
  getCheckedTableData(checkedKeys.value)
}

//搜索模型
const handleSearchModel = () => {
  if (!searchModelText.value.trim()) {
    handleClickCleanBtn()
  } else {
    let result: any[] = []
    checkedKeys.value = checkedKeys.value.filter((item) => item !== 'catalog')
    chataiData.value.treeData.forEach((node) => {
      searchNodes(node, result)
    })
    if (result.length > 0) {
      searchModelResultTree.value = [
        {
          id: 'catalog',
          name_cn: '表格目录',
          parentId: '',
          isCatalog: true,
          children: result,
          title: '表格目录',
          key: 'catalog',
        },
      ]
      searchModelResult.value = []
      searchModelResultTree.value.map((item) => {
        searchModelResult.value.push({ ...item })
        if (item.isCatalog) {
          getSearchModelResult(item.children)
        }
      })
    } else {
      searchModelResultTree.value = []
      searchModelResult.value = []
    }
    isShowModelResult.value = true
  }
  !expandedKeys.value.includes('0-0') && expandedKeys.value.push('0-0')
  !expandedKeys.value.includes('catalog') && expandedKeys.value.push('catalog')
}

// 递归搜索
function searchNodes(nodeModel: any, results: any[]) {
  if (nodeModel.isCatalog) {
    if (nodeModel.name_cn.indexOf(searchModelText.value) > -1 && nodeModel.id !== null) {
      results.push({ ...nodeModel })
    } else {
      if (nodeModel?.children.length) {
        nodeModel.children.forEach((child: any) => {
          searchNodes(child, results)
        })
      }
    }
  } else {
    nodeModel.name_cn.indexOf(searchModelText.value) > -1 && results.push({ ...nodeModel })
  }
}

//获取搜索模型的数据
const getSearchModelResult = (nodes: any) => {
  nodes.map((item) => {
    searchModelResult.value.push({ ...item })
    if (item.isCatalog) {
      getSearchModelResult(item.children)
    }
  })
}

//清空搜索内容
const handleClickCleanBtn = () => {
  searchModelText.value = ''
  isShowModelResult.value = false
  checkedKeys.value = checkedKeys.value.filter((item) => item !== 'catalog')
}

//勾选模型
const handleCheckModel = (checkedKeysNew: any, e: any) => {
  if (e.checked) {
    checkedKeysNew.map((item: string) => {
      if (!checkedKeys.value.includes(item)) checkedKeys.value.push(item)
    })
  } else {
    checkedKeys.value = checkedKeys.value.filter((key) => key !== e.node.id)
    if (e.node.isCatalog) {
      uncheckChildren(e.node.children)
    }
    cancelParentNode(e.node.parentId)
    checkedKeys.value = checkedKeys.value.filter((key) => key !== '0-0' && key !== 'catalog')
  }

  getCheckedTableData(checkedKeys.value)
}

//取消勾选子节点
const uncheckChildren = (children: any) => {
  for (const child of children) {
    checkedKeys.value = checkedKeys.value.filter((key) => key !== child.id)
    if (child.isCatalog) {
      uncheckChildren(child.children)
    }
  }
}

//取消勾选父节点
const cancelParentNode = (nodeId: string) => {
  const findNode = chataiData.value.allTableData.find((item) => item.id === nodeId)
  if (!findNode) return
  checkedKeys.value = checkedKeys.value.filter((item) => item !== nodeId)
  cancelParentNode(findNode.parentId)
}

const handleExpand = (expandedKeys1: any, e: any) => {
  if (e.expanded) {
    expandedKeys.value.push(e.node.id)
  } else {
    expandedKeys.value = expandedKeys.value.filter((item) => item !== e.node.id && item !== e.node.key)
  }
}

const handleClickCatalog = (catalog: any) => {
  if (expandedKeys.value.includes(catalog.id ?? catalog.key)) {
    expandedKeys.value = expandedKeys.value.filter((item) => item !== catalog.id && item !== catalog.key)
  } else {
    expandedKeys.value.push(catalog.id ?? catalog.key)
  }
}

const handleConfirm = async () => {
  if (arraysContainSameIds()) {
    isOpenTableTree.value = false
    return
  }
  isOpenTableTree.value = false
  sessionTable.value = chataiData.value.checkedTable.map((item) => ({ ...item }))
  let tableIds = chataiData.value.checkedTable.map((item) => item.id)
  isLoading.value = true
  await createNewSession(tableIds, false)
  isLoading.value = false
}

const handleCancel = () => {
  if (arraysContainSameIds()) {
    isOpenTableTree.value = false
    return
  }
  isOpenTableTree.value = false
  let tableids = sessionTable.value.map((item) => item.id)
  console.log('tableids', tableids)
  checkedKeys.value = tableids
  getCheckedTableData(tableids)
}

const arraysContainSameIds = () => {
  let arr1 = sessionTable.value.map((item) => item.id)
  let arr2 = chataiData.value.checkedTable.map((item) => item.id)
  if (arr1.length !== arr2.length) {
    return false
  }
  const ids1 = arr1.map((obj) => obj.id)
  const ids2 = arr2.map((obj) => obj.id)
  const set1 = new Set(ids1)
  const set2 = new Set(ids2)
  for (let id of set1) {
    if (!set2.has(id)) {
      return false
    }
  }

  return true
}

//删除已选模型发射的事件
eventBusToChatai.on((event, ids) => {
  if (event === ChataiStoreEvents.DELETE_CHECKED_TABLE) {
    checkedKeys.value = checkedKeys.value.filter((item) => !ids.includes(item) && item !== '0-0')
    ids.map((id) => {
      const node = chataiData.value.allTableData.find((item) => item.id === id)
      cancelParentNode(node.parentId)
    })
  }
})
</script>

<template>
  <div class="model-content border-l" :style="{ width: isOpenTableTree ? '100%' : 0 }">
    <div class="model-main">
      <!-- 顶部 -->
      <div class="top-title">
        <div class="top-title-left">
          <a-avatar shape="square" size="small" :src="model"> </a-avatar>
          <a-typography-title :level="4" class="select-text">选择范围</a-typography-title>
        </div>
      </div>
      <!-- 搜索框-->
      <div class="search-model">
        <a-tooltip title="反选" placement="bottom" :overlayClassName="'reverse-selection-tip'">
          <a-avatar
            v-if="isCanResverSession"
            class="reverse-selection-icon"
            size="small"
            :src="reverseSelection"
            @click="handleReverseSelection()"
          >
          </a-avatar>

          <a-avatar class="reverse-selection-icon reverse-selection-icon-grey" v-else size="small" :src="reverseSelectionGrey">
          </a-avatar>
        </a-tooltip>

        <a-input placeholder="搜索表格" @keyup.enter="handleSearchModel()" v-model:value="searchModelText">
          <template #suffix>
            <CloseOutlined @click="handleClickCleanBtn()" v-show="searchModelText.trim()" style="margin-right: 5px" />
            <search-outlined @click="handleSearchModel()" />
          </template>
        </a-input>
      </div>
      <!-- 模型 -->
      <div
        ref="elementATree"
        v-if="(isShowModelResult && searchModelResultTree.length) || (!isShowModelResult && chataiData.treeData.length)"
      >
        <a-tree
          :height="scrollYHeight"
          :checkedKeys="checkedKeys"
          v-model:expandedKeys="expandedKeys"
          @expand="handleExpand"
          checkable
          :tree-data="isShowModelResult ? searchModelResultTree : chataiData.treeData"
          @check="handleCheckModel"
        >
          <template #switcherIcon="item">
            <GeneralIcon
              icon="chevronRight"
              class="flex justify-center items-center cursor-pointer transform transition-transform duration-200 text-[20px]"
              :class="{ '!rotate-90': expandedKeys.includes(item.id ?? item.key) }"
            />
          </template>

          <template #title="item">
            <div class="model-catalog" v-if="item.isCatalog" @click="handleClickCatalog(item)">
              <img :src="catalog" width="16" height="16" class="catlog-img" />
              {{ item.title }}
            </div>
            <div class="table-item" v-else>
              <GeneralTableIcon :meta="item" class="text-gray-500" />
              <span>{{ item.title }}</span>
            </div>
          </template>
        </a-tree>
      </div>
      <div v-else class="no-data">暂无数据</div>
      <!-- 统计 -->
      <div class="total">
        <span
          >已选择<strong>{{ chataiData.checkedTable.length }}</strong
          >项表格</span
        >
        <div>
          <a-button style="margin-right: 10px" type="primary" size="middle" class="confirm-btn" @click="handleCancel"
            >取消</a-button
          >
          <a-button type="primary" size="middle" class="confirm-btn" @click="handleConfirm">确定</a-button>
        </div>
      </div>
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isLoading" />
</template>

<style lang="scss">
.reverse-selection-tip {
  .ant-tooltip-inner {
    min-width: 33px;
    display: flex;
    justify-content: center;
    border-radius: 8px;
  }
}
</style>
<style scoped lang="scss">
.table-item {
  display: flex;
  align-items: center;
  .nc-icon {
    margin-left: 0px !important;
  }
}
.catlog-img {
  display: inline-block;
  vertical-align: -3px;
}
.reverse-selection-icon {
  margin-right: 8px;
  cursor: pointer;
}
.reverse-selection-icon-grey {
  cursor: not-allowed;
}
.no-data {
  height: calc(100vh - var(--topbar-height) - 194px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.25);
  font-size: 14px;
}
::v-deep .ant-tree {
  .ant-tree-treenode {
    width: calc(100% - 13px) !important;
  }
  .ant-tree-node-selected {
    background-color: transparent;
  }
}

::v-deep .ant-tree-node-content-wrapper {
  width: 100% !important;
  padding: 2px 6px 2px 3px;
  position: relative;
  top: -3px;
  &:hover {
    --tw-bg-opacity: 0.8;
    background-color: rgba(231, 231, 233, var(--tw-bg-opacity));
  }
}

::v-deep .ant-tree-node-content-wrapper:has(.has-rotate-90) {
  --tw-bg-opacity: 0.8;
  background-color: rgba(231, 231, 233, var(--tw-bg-opacity));
}

.model-content {
  width: 0;
  height: 100%;
  transition: 0.5s;
  background-color: white;
  overflow: hidden;
  box-sizing: border-box;
  .model-main {
    width: 100%;
    height: 100%;
    padding: 16px;
    border-right: 1px solid;
    border-color: rgba(99, 107, 116, 0.2);
    flex-direction: column;
    overflow: hidden;
    ::v-deep .ant-tree-switcher {
      top: 1px;
    }
  }
  .top-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    .select-text {
      position: relative;
      left: 8px;
    }
    .colse-btn {
      position: relative;
      top: 0px;
      color: rgb(99, 107, 116);
    }

    .ant-typography {
      font-size: 18px;
      margin: 0;
    }
    .top-title-left {
      display: flex;
      align-items: center;
      ::v-deep .ant-avatar-image {
        width: 20px !important;
        height: 20px !important;
      }
    }
  }
  .search-model {
    display: flex;
    align-items: center;
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
  ::v-deep .ant-tree-checkbox-checked .ant-tree-checkbox-inner {
    background-color: rgb(11, 107, 203);
    border-color: rgb(11, 107, 203);
  }
  ::v-deep .ant-tree-checkbox-indeterminate .ant-tree-checkbox-inner:after {
    background-color: rgb(11, 107, 203);
  }
  ::v-deep .ant-tree {
    height: calc(100vh - var(--topbar-height) - 194px);
    overflow: hidden;
    width: 100%;
  }
  ::v-deep .ant-tree-checkbox {
    margin: 4px 6px 0 0;
  }
  .total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 56px;
    .confirm-btn {
      background-color: #0b6bcb;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
::v-deep .ant-tree-list-scrollbar-thumb {
  background-color: #c1c1c1 !important;
}
</style>
