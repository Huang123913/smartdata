<script lang="ts" setup>
import _ from 'lodash'

import { CloseOutlined } from '@ant-design/icons-vue'

const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { findNodeById } = store
const props = defineProps<{
  visible: boolean
  handleShowSelectCatalog: (value: boolean) => void
  handleModalOk: (selectedCatalog: any) => void
  modelTitle: string
  modelPath?: string
  moveTarget?: object
}>()
const selectedKeys = ref<string[]>([]) //勾选的模型
const expandedKeys = ref<string[]>([]) //展开的父节点
onMounted(() => {
  expandedKeys.value = []
  const findParanent = (data: any[]) => {
    data.map((item) => {
      if (item?.children && item.children.length) {
        expandedKeys.value.push(item.id)
        findParanent(item.children)
      }
    })
  }
  findParanent(chataiData.value.modelCatalogTree)
})

const handleSearchModelOk = () => {
  if (!selectedKeys.value.length) {
    props.handleModalOk(null)
    return
  }
  let selectedCatalog = chataiData.value.modelCatalog.find((item) => item.id === selectedKeys.value[0])
  props.handleModalOk(selectedCatalog)
}

const handleSelectModelCancel = () => {
  props.handleShowSelectCatalog(false)
}

const showModelCatalog = computed(() => {
  let newModelCatalogTree = _.cloneDeep(chataiData.value.modelCatalogTree)
  if (props?.moveTarget) {
    let findItem = findNodeById(newModelCatalogTree, props?.moveTarget.id)
    if (findItem) findItem.disabled = true
    if (props?.moveTarget.parentId) {
      let findItem1 = findNodeById(newModelCatalogTree, props?.moveTarget.parentId)
      findItem1.disabled = true
    }
    const findChild = (data: any[]) => {
      data.map((item) => {
        item.disabled = true
        if (item?.children && item.children.length) {
          findChild(item.children)
        }
      })
    }
    findItem && findItem.isCatalog && findItem.children.length && findChild(findItem.children)
  }
  return newModelCatalogTree
})
</script>

<template>
  <a-modal
    class="select-catalog-modal"
    :closable="false"
    :visible="visible"
    :style="{ '--set-padding': modelPath ? '0 0 8px 0' : '8px 0 16px 0' }"
  >
    <a-tree
      class="catalog catalog-tree"
      blockNode
      :tree-data="showModelCatalog"
      v-model:selectedKeys="selectedKeys"
      v-model:expandedKeys="expandedKeys"
    >
      <template #title="item">
        <span> {{ item.name_cn }}</span>
      </template>
    </a-tree>
    <template #title>
      <div class="select-catalog-modal-header">
        <div class="title" :class="{ 'title-style': !modelPath }">
          <span class="text-lg font-medium">{{ modelTitle }}</span>
          <NcTooltip
            :style="{
              marginTop: '-4px',
            }"
            class="truncate max-w-full"
            show-on-truncate-only
          >
            <template #title> {{ modelPath }}</template>
            <span
              class="text-ellipsis overflow-hidden text-gray-500 xs:ml-2"
              :style="{
                wordBreak: 'keep-all',
                whiteSpace: 'nowrap',
                display: 'inline',
                fontSize: '12px',
                marginTop: '-4px',
              }"
            >
              <template v-if="modelPath">当前归属：{{ modelPath }}</template>
            </span>
          </NcTooltip>
        </div>
        <close-outlined class="colse-btn" @click="handleSelectModelCancel" />
      </div>
    </template>
    <template #footer>
      <a-button key="back" @click="handleSelectModelCancel">取消</a-button>
      <a-button key="submit" type="primary" @click="handleSearchModelOk">确认</a-button>
    </template>
  </a-modal>
</template>

<style lang="scss">
.select-catalog-modal {
  .title-style {
    display: flex;
    align-items: center;
  }
  .colse-btn {
    position: relative;
    top: 0px;
    color: rgb(99, 107, 116);
  }
  .text-lg {
    font-size: 18px;
  }
  .select-catalog-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .title {
      height: 100%;
      width: calc(100% - 32px);
    }
  }
  .ant-modal-content {
    padding: 16px 16px 0 16px !important;
    .ant-modal-header {
      padding: var(--set-padding) !important;
    }
    .ant-modal-body {
      padding: 16px 0 0px 8px !important;
    }
    .ant-modal-footer {
      padding: 16px;
    }
  }
  .select-catalog-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    .anticon-close {
      margin-left: 0 !important;
    }
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
  .catalog {
    max-height: 280px !important;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
    box-sizing: border-box;

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
    .title {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      span {
        width: 50%;
      }
      .source {
        margin-left: 18px;
      }
    }
    .list-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      .input {
        width: 50%;
        height: 32px;
        display: flex;
        align-items: center;
        padding-left: 11px;
        border: 1px solid #d9d9d9;
        border-radius: 0.375rem !important;
        box-sizing: border-box;
        cursor: not-allowed;
      }
      .select {
        width: 50%;
        margin-left: 16px;
      }
    }
  }
  .catalog-tree {
    margin-bottom: 14px;
    height: 180px !important;
  }
}
</style>
