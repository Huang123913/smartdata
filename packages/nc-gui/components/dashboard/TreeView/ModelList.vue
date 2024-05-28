<script lang="ts" setup>
import type { BaseType, TableType } from 'nocodb-sdk'

import catalog from '../../../assets/img/catalog.svg'
import { useChatPlaygroundViewStore } from '../../../store/chatPlaygroundView'

const props = defineProps<{
  base: BaseType
  setIsLoadingModel: (value: boolean) => void
}>()

onMounted(async () => {
  props.setIsLoadingModel(true)
  await loadProjectTables(props.base.id as string)
  props.setIsLoadingModel(false)
})
const { loadProjectTables } = useTablesStore()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { updateModelCatalog } = store
const { openTable: _openTable } = useTableNew({ baseId: props.base.id! })
const route = useRoute()
const expandedKeys = ref([])
const { $api } = useNuxtApp()
const isShowLoading = ref(false)
const isAddNewProjectChildEntityLoading = ref(false)
const openedTableId = computed(() => route.params.viewId)
const showModelTree = computed(() => {
  return chataiData.value.modelTree.length ? chataiData.value.modelTree[0].children : []
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
    const dragKey = info.dragNode.key //拖拽的模型id
    let dropNode = info.node //拖拽的目的地
    let dropKey = dropNode.isCatalog ? info.node.key : dropNode.parentId
    let belongCatalog = info.node.id
    const dropPosition = info.dropPosition
    if (Number(dropPosition) < 0) {
      belongCatalog = props.base.id
      dropKey = null
    } else if (!dropNode.isCatalog) {
      belongCatalog = props.base.id
      if (dropNode.parentId) {
        let findCatalog = chataiData.value.modelData.find((item: any) => item.id === dropNode.parentId)
        belongCatalog = findCatalog.id
      }
    }
    updateModelCatalog(dragKey, dropKey)
    isShowLoading.value = true
    await $api.smartData.updateModelCatalog({ entities: [{ id: dragKey, belongCatalog }] })
  } catch (error) {
    console.log('error', error)
  } finally {
    isShowLoading.value = false
  }
}

const addNewProjectChildEntity = (catalog: any) => {
  if (isAddNewProjectChildEntityLoading.value) return
  isAddNewProjectChildEntityLoading.value = true
  try {
    openTableCreateDialog(catalog)
  } finally {
    isAddNewProjectChildEntityLoading.value = false
  }
}

const openTableCreateDialog = (catalog: any) => {
  const isOpen = ref(true)
  console.log('props.base', props.base)
  let sourceId = props.base?.sources?.[0].id
  const { close } = useDialog(resolveComponent('DlgTableCreate'), {
    'modelValue': isOpen,
    sourceId,
    'baseId': props.base.id,
    'onCreate': closeDialog,
    'onUpdate:modelValue': () => closeDialog(),
    'catalog': catalog,
  })

  function closeDialog(table?: TableType) {
    isOpen.value = false
    if (!table) return
    setTimeout(() => {
      const newTableDom = document.querySelector(`[data-table-id="${table.id}"]`)
      if (!newTableDom) return
      newTableDom?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 1000)
    close(1000)
  }
}
</script>

<template>
  <div class="model-list rounded-md h-full w-full">
    <a-tree
      :tree-data="showModelTree"
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
            <div class="flex more-action-btn">
              <NcButton
                class="nc-sidebar-node-btn"
                size="xxsmall"
                type="text"
                data-testid="nc-sidebar-add-base-entity"
                :class="{
                  '!text-black !inline-block !opacity-100': isAddNewProjectChildEntityLoading,
                }"
                :loading="isAddNewProjectChildEntityLoading"
                @click.stop="addNewProjectChildEntity(item)"
              >
                <GeneralIcon icon="plus" class="text-xl leading-5" style="-webkit-text-stroke: 0.15px" />
              </NcButton>
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
  margin-top: 4px;
  ::v-deep .ant-tree {
    background-color: transparent;
  }
  ::v-deep .ant-tree-treenode {
    width: 100% !important;
    padding-left: 27px;
    padding-bottom: 0;
    border-radius: 6px;
    margin: 2px 0;
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
    height: 1.77rem;
    border-radius: 4px;
    position: relative;
    .more-action-btn {
      width: 24px;
      margin-left: 16px;
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
