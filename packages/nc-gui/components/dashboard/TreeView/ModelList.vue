<script lang="ts" setup>
import type { BaseType } from 'nocodb-sdk'

import catalog from '../../../assets/img/catalog.svg'
import { useChatPlaygroundViewStore } from '../../../store/chatPlaygroundView'

const props = defineProps<{
  base: BaseType
  setIsLoadingModel: (value: boolean) => void
}>()

onMounted(async () => {
  layoutLfetHeaderElem.value = document.querySelector('.layout-left-header')
  layoutLfetFooterElem.value = document.querySelector('.layout-left-footer')
  props.setIsLoadingModel(true)
  props.base && (await loadProjectTables(props.base.id as string))
  props.setIsLoadingModel(false)
})

const { loadProjectTables } = useTablesStore()
const { openTable: _openTable } = useTableNew({ baseId: props.base.id! })
const { $api } = useNuxtApp()
const route = useRoute()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { moveModel, moveCatalog } = store
const expandedKeys = ref([])
const isShowLoading = ref(false)
const modelTreeRef = ref<any>(null)
const layoutLfetHeaderElem = ref<any>(null)
const layoutLfetFooterElem = ref<any>(null)
const scrollYHeight = ref(0)
const modelTreeData = computed(() => {
  if (modelTreeRef.value) resizeObserver.observe(modelTreeRef.value)
  if (!layoutLfetHeaderElem.value) layoutLfetHeaderElem.value = document.querySelector('.layout-left-header')
  if (!layoutLfetFooterElem.value) layoutLfetFooterElem.value = document.querySelector('.layout-left-footer')
  return chataiData.value.modelTree.length ? chataiData.value.modelTree[0].children : []
})

const openedTableId = computed(() => {
  return route && route?.params && route.params?.viewId ? route.params?.viewId : ''
})

const otherContentHeight = computed(() => {
  if (layoutLfetHeaderElem.value && layoutLfetFooterElem.value)
    return Math.ceil(layoutLfetHeaderElem.value.offsetHeight + layoutLfetFooterElem.value.offsetHeight) + 73
  return 0
})

//监听模型树内容高度变化
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === modelTreeRef.value) {
      scrollYHeight.value = parseInt(`${entry.contentRect.height}`)
    }
  }
})

const onClickToTableView = (item: any) => {
  _openTable({
    ...item,
    base_id: props.base.id,
    id: item.id,
    title: item.name_cn,
    table_name: item.name,
    type: 'table',
  })
}

const handleExpand = (expandedKeys1: any, e: any) => {
  if (e.expanded) {
    expandedKeys.value.push(e.node.id)
  } else {
    expandedKeys.value = expandedKeys.value.filter((item) => item !== e.node.id)
  }
}

const handleClickCatalog = (catalog: any) => {
  if (expandedKeys.value.includes(catalog.id)) {
    expandedKeys.value = expandedKeys.value.filter((item) => item !== catalog.id)
  } else {
    expandedKeys.value.push(catalog.id)
  }
}

const onDragEnter = (info: any) => {
  if (info.node.isCatalog && !expandedKeys.value.includes(info?.node?.id)) {
    expandedKeys.value.push(info.node.id)
  }
}

const onDrop = async (info: any) => {
  try {
    isShowLoading.value = true
    if (info.dragNode.isCatalog) {
      await dropCatalog(info)
    } else {
      await dropModel(info)
    }
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
}

const dropModel = async (info: any) => {
  console.log('info', info)
  const dropPosition = info.dropPosition
  //拖拽节点
  const dragNode = info.dragNode
  //拖拽节点id
  const dragNodeKey = dragNode.key
  //拖拽节点的父级id
  const dragNodeParentId = dragNode.parentId
  //目标节点
  let dropNode = info.node
  //模型新的父级id
  let newParentId = dropNode.parentId === dragNodeParentId ? dragNodeParentId : dropNode.parentId
  if (Number(dropPosition) < 0 || !newParentId) {
    newParentId = '__root__'
  }
  let prependToTableId = dropNode.isCatalog ? '' : dropNode.key
  if (Number(dropPosition) < 0) prependToTableId = ''
  let params = {
    baseId: props.base.id,
    catalogId: newParentId, //调整到哪个目录ID下，若传空则认为在原目录下调整位置
    tableId: dragNodeKey, //要调整位置的表ID
    prependToTableId, //要插入到哪个表ID前，若传空则插入到目录的最后
  }
  console.log('params', params)
  await $api.smartData.moveModel(params)
  moveModel(dragNodeKey, dragNodeParentId, newParentId === '__root__' ? null : newParentId, prependToTableId)
}

const dropCatalog = async (info: any) => {
  const dropPosition = info.dropPosition
  //拖拽对象
  const dragNode = info.dragNode
  //拖拽对象id
  const dragNodeKey = dragNode.key
  //拖拽对象的父级id
  const dragNodeParentId = dragNode.parentId
  //目标节点
  let dropNode = info.node
  //目录新的父级id
  let newParentId = dropNode.isCatalog && dropNode.parentId === dragNodeParentId ? dragNodeParentId : dropNode.parentId
  newParentId = info.dropPosition < 0 ? null : newParentId
  let prependToTableId = dropNode.isCatalog ? dropNode.key : null
  if (dropPosition < 0) prependToTableId = null
  let params = {
    sourceCatalogId: dragNodeKey, //源目录id
    targetCatalogId: prependToTableId ?? newParentId, //目标移动目录id
    ismoveCustomCatalogLast: !prependToTableId,
  }
  moveCatalog(dragNodeKey, dragNodeParentId, newParentId, prependToTableId)
  await $api.smartData.moveCatalog(params)
}
</script>

<template>
  <div ref="modelTreeRef" class="model-list rounded-md w-full" :style="{ height: `calc(100vh  - ${otherContentHeight}px)` }">
    <a-tree
      :height="scrollYHeight"
      :tree-data="modelTreeData"
      v-model:expandedKeys="expandedKeys"
      @expand="handleExpand"
      draggable
      @drop="onDrop"
      @dragenter="onDragEnter"
    >
      <template #title="item">
        <a-tooltip :title="item.title">
          <div v-if="item.isCatalog" class="model-text-content pr-1 hover-set" @click="handleClickCatalog(item)">
            <div class="table-name">
              <img :src="catalog" width="16" height="16" class="catlog-img" />
              <span class="mode-text"> {{ item.title }}</span>
            </div>
            <div class="flex more-action-btn more-acttion-btn-to-catalog">
              <DashboardTreeViewModelListDropDown :item="item" :base="base" :isCatalogDropDown="true" />
              <DashboardTreeViewModelListAddDropDown :item="item" :base="base" />
            </div>
          </div>
          <div
            v-else
            class="model-text-content hover-set pr-1"
            :class="{ 'background-set': openedTableId === item.id }"
            @click="onClickToTableView(item)"
          >
            <div class="table-name">
              <GeneralTableIcon :meta="item" class="text-gray-500" />
              <span class="mode-text"> {{ item.title }}</span>
            </div>
            <div class="flex more-action-btn">
              <DashboardTreeViewModelListDropDown
                :item="{
                  ...item,
                  base_id: props.base.id,
                  id: item.id,
                  title: item.name_cn,
                  table_name: item.name,
                  type: 'table',
                  source_id: item.parentId,
                }"
                :base="base"
                :isCatalogDropDown="false"
              />
            </div>
          </div>
        </a-tooltip>
      </template>
    </a-tree>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style scoped lang="scss">
.model-list {
  overflow: hidden;
  margin-top: 4px;
  ::v-deep .ant-tree {
    background-color: transparent;
  }
  ::v-deep .ant-tree-list-holder {
    overflow-x: hidden;
    width: 100%;
  }
  ::v-deep .ant-tree-treenode {
    width: 100% !important;
    padding-left: 27px;
    padding-bottom: 0px;
    border-radius: 6px;
    padding-right: 2px;
    border-bottom: 2px solid #f9f9fa;
    border-top: 2px solid #f9f9fa;
  }

  ::v-deep .ant-tree-treenode:has(.hover-set) {
    &:hover {
      --tw-bg-opacity: 1;
      background-color: rgba(231, 231, 233, var(--tw-bg-opacity));
    }
  }
  .nc-sidebar-node-btn {
    @apply !opacity-100 !inline-block;
    opacity: 0;
  }
  .hover-set {
    &:hover .nc-sidebar-node-btn {
      opacity: 1 !important;
    }
  }

  ::v-deep .ant-tree-treenode:has(.background-set) {
    background-color: #edf1ff !important;
  }

  ::v-deep .ant-tree-node-content-wrapper {
    padding: 0;
    font-size: 14px;
    color: rgb(0, 0, 0);
    flex: 1;
    overflow: hidden;
  }
  ::v-deep .ant-tree-drop-indicator {
    top: 3px !important;
  }
  ::v-deep .ant-tree-switcher {
    top: -1px !important;
  }
  ::v-deep .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: transparent;
  }
  ::v-deep .ant-tree .ant-tree-node-content-wrapper:hover {
    background-color: transparent;
  }
  .model-text-content {
    display: flex;
    align-items: center;
    border-radius: 4px;
    position: relative;
    padding: 2px 0;
    .more-action-btn {
      width: 24px;
      margin-left: 16px;
      align-items: center;
    }
    .more-acttion-btn-to-catalog {
      width: 48px;
    }
    .table-name {
      display: flex;
      align-items: center;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .catlog-img {
      position: relative;
      top: -1px;
      margin-right: 6px;
    }
    .mode-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
