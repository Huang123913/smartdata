<script lang="ts" setup>
import { ChatPlaygroundViewStoreEvents, ref } from '#imports'

import { CloseOutlined, DownOutlined } from '@ant-design/icons-vue'

import { useChatPlaygroundViewStore } from '../../../../../store/chatPlaygroundView'

const props = defineProps<{
  isChatai?: boolean
  isSending?: boolean
}>()

const chataiStore = useChataiStore()
const { sessionTable } = storeToRefs(chataiStore)
const { deleteCheckedTable, eventBusToChatai } = chataiStore
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { deleteFile, deleteModel, eventBus } = store
const clicked = ref<boolean>(false) //是否显示选择字段弹框
const deleteSelectedTable = ref<string[]>([])
// 删除模型
const handleDeleteModelItem = (item: any) => {
  if (props?.isChatai) {
    deleteSelectedTable.value.push(item.id)
  } else {
    deleteModel(item.id)
    eventBus.emit(ChatPlaygroundViewStoreEvents.DELETE_MODE, item.id)
  }
}

//删除字段
const handleDeleteFile = (deleteFile1: any, id: string) => {
  deleteFile(deleteFile1, id)
}

const handleClickChange = (visible: boolean) => {
  if (props.isSending) return
  clicked.value = visible
  deleteSelectedTable.value = []
}

const handleConfirm = () => {
  deleteCheckedTable(deleteSelectedTable.value)
  eventBusToChatai.emit(ChataiStoreEvents.DELETE_CHECKED_TABLE, deleteSelectedTable.value)
  clicked.value = false
  deleteSelectedTable.value = []
}
</script>

<template>
  <a-popover
    v-if="props.isChatai ? sessionTable.length : chataiData.checkedModelData.length"
    placement="top"
    color="white"
    trigger="click"
    :visible="clicked"
    :overlayClassName="'chatai2-tooltip'"
    @visibleChange="handleClickChange"
  >
    <template #content>
      <a-list size="small" class="model-selected-list" :data-source="props.isChatai ? sessionTable : chataiData.checkedModelData">
        <template #renderItem="{ item, index }">
          <a-list-item
            :style="{ textDecoration: props.isChatai && deleteSelectedTable.includes(item.id) ? 'line-through' : 'none' }"
            v-if="props.isChatai || !item?.fields || item.fields.length === 0"
          >
            <div class="model-item">
              <span> {{ item.name_cn }}</span> <close-outlined class="colse-btn1" @click="handleDeleteModelItem(item)" />
            </div>
          </a-list-item>
          <a-popover v-else placement="right" :overlayClassName="'chatai2-tooltip'" color="white">
            <template #content>
              <a-list size="small" :data-source="item.fields" class="model-selected-list">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <span> {{ item?.fieldName_cn ?? item.fieldName }}</span>
                    <close-outlined class="colse-btn1" @click="handleDeleteFile(item, chataiData.checkedModelData[index].id)" />
                  </a-list-item>
                </template>
              </a-list>
            </template>
            <span> {{ item.name_cn }}</span>
            <close-outlined class="colse-btn1" @click="handleDeleteModelItem(chataiData.checkedModelData[index])" />
          </a-popover>
        </template>
      </a-list>
      <div v-if="props.isChatai" class="footer">
        <a-button :disabled="!deleteSelectedTable.length" type="primary" size="small" class="confirm-btn" @click="handleConfirm"
          >确定</a-button
        >
      </div>
    </template>
    <a class="ant-dropdown-link1" @click.prevent>
      {{ `已选范围(${props.isChatai ? sessionTable.length : chataiData.checkedModelData.length})` }}
      <DownOutlined />
    </a>
  </a-popover>

  <a-dropdown v-else>
    <a class="ant-dropdown-link1" @click.prevent>
      {{ `已选范围(${props.isChatai ? sessionTable.length : chataiData.checkedModelData.length})` }}
      <DownOutlined />
    </a>
  </a-dropdown>
</template>

<style lang="scss" scoped>
.ant-dropdown-menu-submenu {
  padding: 0 !important;
  border: none !important;
  .ant-dropdown-menu-submenu-title {
    padding: 6px 8px !important;
    width: 100%;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    position: relative;
  }
}
.ant-dropdown-menu {
  min-width: 200px;
  padding: 16px 8px !important;
}

.ant-dropdown-menu-item {
  padding: 6px 8px !important;
}

.ant-dropdown-link1 {
  display: flex;
  align-items: center;
  text-decoration: none !important;
  color: #0b6bcb !important;
  &:hover {
    color: #0b6bcb !important;
  }
  span {
    vertical-align: 2px !important;
  }
}
.footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding: 0 8px;
}
</style>
<style lang="scss">
.model-selected-list {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
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
}
.model-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.colse-btn1 {
  opacity: 0;
}
.anticon-close {
  display: flex;
  align-items: center;
  margin-left: 32px;
}
.chatai2-tooltip {
  .ant-list-split .ant-list-item {
    border: none !important;
    padding: 6px 16px !important;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &:hover .colse-btn1 {
      opacity: 1;
    }
  }
}

.ant-list-items {
  > span {
    display: flex;
    padding: 6px 16px;
    justify-content: space-between;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &:hover .colse-btn1 {
      opacity: 1;
    }
  }
}

.chatai2-tooltip {
  .ant-popover-inner {
    min-width: 232px;
  }
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-title {
    border: none;
    padding: 14px 16px 0px 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
  .ant-popover-inner-content {
    padding: 8px 0 !important;
  }
}
.colse-btn {
  position: relative;
  color: rgb(85, 94, 104);
  background-color: transparent;
  top: -2px;
  border: none;
  box-shadow: none;
  transition: none;
  width: 16px !important;
  height: 16px !important;
  svg {
    font-size: 15px;
  }
  &:active {
    background-color: transparent;
    box-shadow: none;
  }
}
.close-btn1 {
  position: absolute;
  right: 0;
  top: 7px;
}
</style>
