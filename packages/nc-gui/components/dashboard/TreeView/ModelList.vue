<script lang="ts" setup>
import { TreeViewInj } from '#imports'
import type { BaseType } from 'nocodb-sdk'

import catalog from '../../../assets/img/catalog.svg'
import { useChatPlaygroundViewStore } from '../../../store/chatPlaygroundView'

const props = defineProps<{
  base: BaseType
  setIsLoadingModel: (value: boolean) => void
}>()

onMounted(async () => {
  props.setIsLoadingModel(true)
  if (!chataiData.value.modelTree.length) await getCustomCatalogEntityTree()
  await loadProjectTables(props.base.id as string)
  props.setIsLoadingModel(false)
})
const { loadProjectTables } = useTablesStore()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { getCustomCatalogEntityTree } = store
const { setMenuContext } = inject(TreeViewInj)!
const { openTable: _openTable } = useTableNew({ baseId: props.base.id! })
const route = useRoute()
const expandedKeys = ref([])
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
</script>

<template>
  <div class="model-list nc-sidebar-node pl-11 mb-0.25 rounded-md h-7.1 w-full">
    <a-tree :tree-data="showModelTree" blockNode :expandedKeys="expandedKeys" @expand="handleExpand">
      <template #title="item">
        <a-tooltip :title="item.title">
          <div v-if="item.isCatalog" class="model-text-content" @click="handleClickCatalog(item)">
            <img :src="catalog" width="16" height="16" class="catlog-img" />
            <span class="mode-text"> {{ item.title }}</span>
          </div>
          <div
            v-else
            class="model-text-content hover-set"
            :class="{ 'background-set': openedTableId === item.id }"
            @click="onClickToTableView(item)"
            @contextmenu="setMenuContext('table', item)"
          >
            <div class="table-name">
              <GeneralTableIcon :meta="item" class="text-gray-500" />
              <span class="mode-text"> {{ item.title }}</span>
            </div>
            <div class="more-action-btn">
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
</template>

<style scoped lang="scss">
.model-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  margin-top: 4px;
  overflow: hidden;
  ::v-deep .ant-tree {
    background-color: transparent;
  }
  ::v-deep .ant-tree-node-content-wrapper {
    padding: 0;
    font-size: 14px;
    color: rgb(0, 0, 0);
    overflow: hidden;
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
      position: absolute;
      right: 0;
    }
    .table-name {
      display: flex;
      align-items: center;
    }
    .catlog-img {
      position: relative;
      top: -1px;
      margin-right: 6px;
    }
    .mode-text {
      width: 82%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .hover-set {
    justify-content: space-between;
    &:hover {
      background-color: #f5f5f5;
    }
  }
  .background-set {
    background-color: #edf1ff !important;
    overflow: hidden;
  }
}
</style>
