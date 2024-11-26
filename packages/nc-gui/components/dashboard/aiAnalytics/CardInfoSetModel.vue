<script lang="ts" setup>
import 'dayjs/locale/zh-cn'

import { v4 as uuidv4 } from 'uuid'

import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  saveContent: string
  visible: boolean
  handleClose: () => void
}>()
const { $api } = useNuxtApp()

const emits = defineEmits(['update:visible'])
const visible = useVModel(props, 'visible', emits)
const isShowLoading = ref(false)

const xValue = ref(0)
const yValue = ref(0)

const wValue = ref(1)
const hValue = ref(1)
const ipValue = ref('http://192.168.0.106:8081')
const ownerId = ref('2c9c008191444ec501918da79f122bd5')

const handleOk = async () => {
  if (!ipValue.value.trim()) {
    message.warn(`$保存的系统地址不能为空`)
    return
  } else if (!ownerId.value.trim()) {
    message.warn(`拥有者id不能为空`)
    return
  }
  visible.value = false
  isShowLoading.value = true
  console.log('props.saveContent', props.saveContent)
  await $api.smartData.saveCard({
    ipValue: ipValue.value,
    ownerId: ownerId.value,
    saveValue: {
      x: xValue.value,
      y: yValue.value,
      w: wValue.value,
      h: hValue.value,
      saveContent: props.saveContent,
      id: uuidv4(),
    },
  })
  message.success('保存成功')
  isShowLoading.value = false
}

const handleClose = () => {
  props.handleClose()
}
</script>
<template>
  <a-modal
    :closable="false"
    class="set-card-info"
    cancelText="取消"
    okText="确定"
    v-model:visible="visible"
    @ok="handleOk"
    :zIndex="999"
  >
    <template #title>
      <div class="set-update-time-modal-header">
        <span class="text-lg font-medium">{{ '设置卡片信息' }}</span>
        <close-outlined class="colse-btn" @click="handleClose" />
      </div>
    </template>
    <a-form layout="vertical">
      <a-form-item label="保存的系统地址:">
        <a-input v-model:value="ipValue" />
      </a-form-item>

      <a-form-item label="拥有者id:">
        <a-input v-model:value="ownerId" />
      </a-form-item>
      <a-form-item label="卡片在列中的位置(x):">
        <a-input-number v-model:value="xValue" :precision="0" :min="0" :max="12" />
      </a-form-item>

      <a-form-item label="卡片在行中的位置(y):">
        <a-input-number v-model:value="yValue" :precision="0" :min="0" />
      </a-form-item>

      <a-form-item label="宽度(w):">
        <a-input-number v-model:value="wValue" :precision="0" :min="1" :max="12" />
      </a-form-item>

      <a-form-item label="高度(h):">
        <a-input-number v-model:value="hValue" :precision="0" :min="1" />
      </a-form-item>
    </a-form>
  </a-modal>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.set-card-info {
  .ant-modal-content {
    padding: 16px 16px 0 16px !important;
    .ant-modal-header {
      padding: 8px 0 16px 0 !important;
      .ant-modal-title {
        font-size: 1.125rem;
        font-weight: 550;
      }
      .set-update-time-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .colse-btn {
          position: relative;
          top: 0px;
          color: rgb(99, 107, 116);
        }
      }
    }
    .ant-modal-body {
      min-height: 200px;
      padding: 16px 0px 16px 8px !important;
      .ant-form-vertical {
        height: 290px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 8px;
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
      }
      .ant-picker {
        width: 100%;
      }
      .range-days-of-month {
        display: flex;
        align-items: center;
        margin-top: 10px;
        .ant-input-number {
          flex: 1;
          .ant-input-number-handler-wrap {
            display: none;
          }
          .ant-input-number-input {
            text-align: right;
          }
        }
      }
      .ant-form-item {
        margin: 0 0 13px;
      }
    }
    .ant-modal-footer {
      padding: 16px;
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
  }
  .ant-modal-close {
    top: 32px !important;
    right: 15px;
  }
  .ant-input-number {
    width: 100% !important;
  }
}
</style>
