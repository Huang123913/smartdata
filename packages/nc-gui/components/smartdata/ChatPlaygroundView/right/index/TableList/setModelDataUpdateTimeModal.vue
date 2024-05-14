<script lang="ts" setup>
import { ChatPlaygroundViewStoreEvents, ref } from '#imports'

const props = defineProps<{
  handleOk: (value: string) => void
}>()
const store = useChatPlaygroundViewStore()
const { eventBus } = store
const updateTimeType = ref<number>(1) //定时类型
const intervalTypeValue = ref<string>('hour') //每时/每分
const visible = ref<boolean>(false)
const minuteValue = ref<number>(1)
const frequency = ref<number>(1)

const handleOkBySetUpdateTime = () => {
  visible.value = false
  let value: string = ''
  if (updateTimeType.value === 1) {
    //每时/每分
    value = intervalTypeValue.value === 'minute' ? `0 0/${minuteValue.value} * * * ?` : `0 0 0/${minuteValue.value} * * ?`
  } else if (updateTimeType.value === 2) {
    //每天
    value = `0 0 0 0/${frequency.value} * ?`
  } else if (updateTimeType.value === 3) {
    //每周
    value = `0 0 0 0 0 0/${frequency.value}`
  } else {
    //每月
    value = `0 0 0 0 0/${frequency.value} ?`
  }
  props.handleOk(value)
}

eventBus.on((event) => {
  if (event === ChatPlaygroundViewStoreEvents.OPEN_SET_MODEL_DATA_UPDATE_TIME_MODAL) {
    visible.value = true
  }
})

const hanldeAfterClose = () => {
  updateTimeType.value = 1
  intervalTypeValue.value = 'hour'
  minuteValue.value = 1
  frequency.value = 1
}
</script>

<template>
  <a-modal
    class="set-update-time-modal"
    title="设置更新时间"
    cancelText="取消"
    okText="确认"
    v-model:visible="visible"
    @ok="handleOkBySetUpdateTime"
    :afterClose="hanldeAfterClose"
  >
    <a-form :labelCol="{ span: 6 }">
      <a-form-item label="定时时间类型">
        <a-radio-group v-model:value="updateTimeType">
          <a-radio :value="1">每时/每分</a-radio>
          <a-radio :value="2">每天</a-radio>
          <a-radio :value="3">每周</a-radio>
          <a-radio :value="4">每月</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="updateTimeType == 1" label="频率">
        <a-input-number v-model:value="minuteValue" id="inputNumber" :min="1" :precision="0" :size="'small'" />
        <a-select v-model:value="intervalTypeValue" :style="{ width: '150px' }">
          <a-select-option value="hour">时</a-select-option>
          <a-select-option value="minute">分钟</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-else label="频率">
        <a-input-number class="frequency" v-model:value="frequency" :min="1" :precision="0" :size="'small'" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style lang="scss">
.set-update-time-modal {
  .ant-modal-body {
    min-height: 200px;
    padding: 16px 8px !important;
  }
  .ant-modal-content {
    padding: 16px 16px 0 16px !important;
    .ant-modal-header {
      padding: 16px 0 !important;
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
  .ant-select .ant-select-selector {
    border-radius: none;
    top: -1px;
  }
  .ant-input-number-sm input {
    height: 29px;
  }

  .ant-input-number {
    width: 115px !important;
  }
  .frequency {
    width: 290px !important;
  }
  .ant-form-item {
    margin: 0 0 18px !important;
  }
  .type-in-moth {
    .ant-form-item-control-input-content {
      padding-left: 118px;
    }
  }
}
</style>
