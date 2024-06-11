<script lang="ts" setup>
import { ChatPlaygroundViewStoreEvents } from '#imports'

import { useChatPlaygroundViewStore } from '../../../../../../store/chatPlaygroundView'

const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { eventBus } = store
const props = defineProps<{
  visible: boolean
  handleCancel: () => void
  handleOk: (value: object) => void
  setUpdateTimeValue: (value: string) => void
  isCatalog: boolean
  targetField: any[]
  sourceField: any[]
}>()
const selectedKeys = ref<string[]>([]) //勾选的模型
const expandedKeys = ref<string[]>([]) //展开的父节点
const modelUpdateTypeValue = ref<string>('two') //模型数据更新方式
const fieldMappingResult = ref<{
  [key: string]: any
}>({})
const selectValue = ref<{
  [key: string]: any
}>({})
const selectOption = [
  { value: 'regularUpdate', label: '定时更新' },
  { value: 'realTimeView', label: '实时视图' },
]
onMounted(() => {
  expandedKeys.value = []
  modelUpdateTypeValue.value = 'realTimeView'
})

watch(
  () => props.visible,
  (newVisible) => {
    props.visible && !expandedKeys.value.length && getExpandKeys()
  },
)

watch(
  () => chataiData.value.modelCatalogTree,
  (newVisible) => {
    getExpandKeys()
  },
)

const getExpandKeys = () => {
  const findParanent = (data: any[]) => {
    data.map((item) => {
      if (item?.children && item.children.length) {
        expandedKeys.value.push(item.id)
        findParanent(item.children)
      }
    })
  }
  findParanent(chataiData.value.modelCatalogTree)
}

const handleModalOk = () => {
  if (props.isCatalog) {
    if (!selectedKeys.value.length) {
      message.warning('请选择模型目录')
      return
    }
    let selectedCatalog = chataiData.value.modelCatalog.find((item) => item.id === selectedKeys.value[0])
    props.handleOk(selectedCatalog)
  } else {
    props.targetField.map((item: any) => {
      if (!fieldMappingResult.value.hasOwnProperty(item.fieldName)) fieldMappingResult.value[item.fieldName] = null
    })
    props.handleOk(fieldMappingResult.value)
  }
}

const handleChange = (value: string) => {
  value === 'regularUpdate' && eventBus.emit(ChatPlaygroundViewStoreEvents.OPEN_SET_MODEL_DATA_UPDATE_TIME_MODAL)
  value === 'realTimeView' && props.setUpdateTimeValue(value)
}

const hanldeAfterClose = () => {
  modelUpdateTypeValue.value = 'realTimeView'
}

//选择字段
const handleSelectSourceField = (option: any, targetFieldItem: any) => {
  if (targetFieldItem.fieldSysDataType === 'number' && option.sysDataType !== 'number') {
    message.warning('目标字段类型为number,来源目标字段类型与之不匹配')
    return
  }
  console.log('option', option)
  fieldMappingResult.value[targetFieldItem.fieldName] = option ? option.name : ''
  selectValue.value[targetFieldItem.id] = option ? option.name : ''
}
</script>

<template>
  <a-modal
    class="catalog-modal"
    :title="isCatalog ? '选择模型目录' : '字段映射'"
    :visible="visible"
    :afterClose="hanldeAfterClose"
    @cancel="handleCancel"
  >
    <a-tree
      class="catalog catalog-tree"
      blockNode
      :tree-data="chataiData.modelCatalogTree"
      v-model:selectedKeys="selectedKeys"
      v-model:expandedKeys="expandedKeys"
      v-if="isCatalog"
    >
      <template #title="item">
        <span> {{ item.name_cn }}</span>
      </template>
    </a-tree>

    <div class="catalog" v-else>
      <div class="title">
        <span>目标字段</span>
        <span class="source">来源</span>
      </div>
      <div v-for="item in targetField" :key="item.id" class="list-item">
        <div class="input">{{ item?.fieldName_cn || item.fieldName }}</div>
        <a-select
          class="select"
          :allowClear="!!(selectValue.hasOwnProperty(item.id) && selectValue[item.id])"
          :value="selectValue.hasOwnProperty(item.id) ? selectValue[item.id] : ''"
          :options="sourceField"
          @change="(value: string, option: any)=>{handleSelectSourceField(option,item)}"
        >
        </a-select>
      </div>
    </div>

    <template #footer>
      <div class="footer-left">
        <span>模型数据</span>
        <a-select
          v-model:value="modelUpdateTypeValue"
          :style="{ width: '150px', marginLeft: '8px' }"
          :allowClear="true"
          :options="selectOption"
          @change="handleChange"
        ></a-select>
      </div>
      <div>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" @click="handleModalOk">确认</a-button>
      </div>
    </template>
  </a-modal>
</template>

<style lang="scss">
.catalog-modal {
  .ant-modal-content {
    padding: 16px 16px 0 16px !important;
    .ant-modal-header {
      padding: 16px 0 !important;
    }
    .ant-modal-body {
      padding: 16px 0 0px 8px !important;
    }
    .ant-modal-footer {
      padding: 16px;
    }
  }
  .ant-modal-close {
    top: 32px !important;
    right: 15px;
  }
  .ant-modal-footer {
    display: flex;
    justify-content: space-between;
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
