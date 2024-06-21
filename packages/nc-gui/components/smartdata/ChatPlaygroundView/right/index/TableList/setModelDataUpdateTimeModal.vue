<script lang="ts" setup>
import 'dayjs/locale/zh-cn'

import { ChatPlaygroundViewStoreEvents, ref } from '#imports'
import dayjs, { Dayjs } from 'dayjs'

import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  handleOk: (value: object) => void
}>()
const locale = {
  lang: {
    locale: 'zh-cn',
    placeholder: 'Select date',
    rangePlaceholder: ['Start date', 'End date'],
    today: 'Today',
    now: '此刻',
    backToToday: 'Back to today',
    ok: '确定',
    clear: 'Clear',
    month: 'Month',
    year: 'Year',
    timeSelect: 'Select time',
    dateSelect: 'Select date',
    monthSelect: 'Choose a month',
    yearSelect: 'Choose a year',
    decadeSelect: 'Choose a decade',
    yearFormat: 'YYYY',
    dateFormat: 'M/D/YYYY',
    dayFormat: 'D',
    dateTimeFormat: 'M/D/YYYY HH:mm:ss',
    monthFormat: 'MMMM',
    monthBeforeYear: true,
    previousMonth: 'Previous month (PageUp)',
    nextMonth: 'Next month (PageDown)',
    previousYear: 'Last year (Control + left)',
    nextYear: 'Next year (Control + right)',
    previousDecade: 'Last decade',
    nextDecade: 'Next decade',
    previousCentury: 'Last century',
    nextCentury: 'Next century',
  },
  timePickerLocale: {
    placeholder: 'Select time',
  },
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  weekFormat: 'YYYY-wo',
  monthFormat: 'YYYY-MM',
}
const store = useChatPlaygroundViewStore()
const { eventBus } = store
const visible = ref<boolean>(false)
const fromDate = ref<Dayjs>() //开始执行时间
const endDate = ref<Dayjs>() //结束执行时间
const monthPlan = ref({
  type: 'everyMonth',
  fixedMonth: [],
})
const dayPlan = ref({
  type: 'everyDay', // everyDay - 每天都触发， rangeDaysOfMonth - 每月内天的范围, fixedDaysOfMonth - 每月内特定的天,                   incrementDaysOfMonth - 按特定的增量天数触发，// lastDayOfMonth - 每月的最后一天，weeksOfMonth - 每月的星期几
  rangeStartDayOfMonth: '', //每月的开始天。 说明：当dayPlan.type的值为rangeDaysOfMonth时，此属性才有效
  rangeEndDayOfMonth: '', //每月的结束天。 说明：当dayPlan.type的值为rangeDaysOfMonth时，此属性才有效
  fixedDaysOfMonth: [], //每月特定的天。 说明：当dayPlan.type的值为fixedDaysOfMonth时，此属性才有效
  incrementStartDayOfMonth: '', //从每月的特定天开始。 说明：当dayPlan.type的值为incrementDaysOfMonth时，此属性才有效
  incrementIntervalDayOfMonth: '', // 间隔特定的天后触发。  说明：当dayPlan.type的值为incrementDaysOfMonth时，此属性才有效
  weeksOfMonth: [], //从每个月的特定星期触发。 说明：当dayPlan.type的值为weeksOfMonth时，此属性才有效
})
const hourPlan = ref({
  type: 'everyHour', // everyHour - 每小时触发，rangeHours - 按范围触发,fixedHours - 特定的小时, incrementHours - 按特定的增量小时数触发
  rangeStartHour: '', // 开始小时。 说明：当hourPlan.type的值为rangeHours时，此属性才有效
  rangeEndHour: '', //结束小时。 说明：当hourPlan.type的值为rangeHours时，此属性才有效
  fixedHours: [], //特定的小时。 说明：当hourPlan.type的值为fixedHours时，此属性才有效
  incrementStartHour: '', //从特定的小时开始。 说明：当hourPlan.type的值为incrementHours时，此属性才有效
  incrementIntervalHour: '', //"incrementIntervalHour": "2" // 间隔特定的小时后触发。 说明：当hourPlan.type的值为incrementHours时，此属性才有效
})
const monthPlanTypeOption = [
  { value: 'everyMonth', label: '每月都触发' },
  { value: 'fixedMonth', label: '按固定值触发' },
]
const dayPlanTypeOption = [
  { value: 'everyDay', label: '每天都触发' },
  { value: 'rangeDaysOfMonth', label: '按范围触发' },
  { value: 'fixedDaysOfMonth', label: '按固定值触发' },
  { value: 'incrementDaysOfMonth', label: '按一定增量触发' },
  { value: 'lastDayOfMonth', label: '每月的最后一天' },
  { value: 'weeksOfMonth', label: '每月的星期几' },
]
const hourPlanTypeOption = [
  { value: 'everyHour', label: '每小时触发' },
  { value: 'rangeHours', label: '按范围触发' },
  { value: 'fixedHours', label: '按固定值触发' },
  { value: 'incrementHours', label: '按一定增量触发' },
]
const weekOption = [
  { value: '2', label: '星期一' },
  { value: '3', label: '星期二' },
  { value: '4', label: '星期三' },
  { value: '5', label: '星期四' },
  { value: '6', label: '星期五' },
  { value: '7', label: '星期六' },
  { value: '1', label: '星期日' },
]
const monthOption = computed(() => {
  return [...Array(12)].map((item, index) => ({ value: `${index + 1}`, label: index + 1 }))
})
const dayOption = computed(() => {
  return [...Array(31)].map((item, index) => ({ value: `${index + 1}`, label: index + 1 }))
})

const hourOption = computed(() => {
  return [...Array(24)].map((item, index) => {
    if (index < 10) {
      return { value: `${index}`, label: `0${index}`, showLabel: `${index}时` }
    } else {
      return { value: `${index}`, label: index, showLabel: `${index}时` }
    }
  })
})

const timestampToTime = (timestamp: string) => {
  var date = new Date(timestamp) // 转换为Date对象
  var year = date.getFullYear() // 获取年份
  var month = ('0' + (date.getMonth() + 1)).slice(-2) // 获取月份，转为两位数
  var day = ('0' + date.getDate()).slice(-2) // 获取日，转为两位数
  var hours = ('0' + date.getHours()).slice(-2) // 获取小时，转为两位数
  var minutes = ('0' + date.getMinutes()).slice(-2) // 获取分钟，转为两位数
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const handleOkBySetUpdateTime = () => {
  visible.value = false
  //天
  if (dayPlan.value.rangeStartDayOfMonth) dayPlan.value.rangeStartDayOfMonth = `${dayPlan.value.rangeStartDayOfMonth}`
  if (dayPlan.value.rangeEndDayOfMonth) dayPlan.value.rangeEndDayOfMonth = `${dayPlan.value.rangeEndDayOfMonth}`
  if (dayPlan.value.incrementStartDayOfMonth) dayPlan.value.incrementStartDayOfMonth = `${dayPlan.value.incrementStartDayOfMonth}`
  if (dayPlan.value.incrementIntervalDayOfMonth)
    dayPlan.value.incrementIntervalDayOfMonth = `${dayPlan.value.incrementIntervalDayOfMonth}`
  //小时
  if (dayPlan.value.rangeStartHour) dayPlan.value.rangeStartHour = `${dayPlan.value.rangeStartHour}`
  if (dayPlan.value.rangeEndHour) dayPlan.value.rangeEndHour = `${dayPlan.value.rangeEndHour}`
  if (dayPlan.value.incrementStartHour) dayPlan.value.incrementStartHour = `${dayPlan.value.incrementStartHour}`
  if (dayPlan.value.incrementIntervalHour) dayPlan.value.incrementIntervalHour = `${dayPlan.value.incrementIntervalHour}`
  props.handleOk({
    fromDate: fromDate.value ? timestampToTime(fromDate.value.$d.getTime()) : '',
    endDate: endDate.value ? timestampToTime(endDate.value.$d.getTime()) : '',
    monthPlan: monthPlan.value,
    dayPlan: dayPlan.value,
    hourPlan: hourPlan.value,
  })
}

eventBus.on((event) => {
  if (event === ChatPlaygroundViewStoreEvents.OPEN_SET_MODEL_DATA_UPDATE_TIME_MODAL) {
    visible.value = true
  }
})
const handleCancel = () => {
  visible.value = false
}
</script>

<template>
  <a-modal
    :closable="false"
    class="set-update-time-modal"
    cancelText="取消"
    okText="确认"
    v-model:visible="visible"
    @ok="handleOkBySetUpdateTime"
    zIndex="999"
  >
    <template #title>
      <div class="set-update-time-modal-header">
        <span class="text-lg font-medium">{{ '设置更新时间' }}</span>
        <close-outlined class="colse-btn" @click="handleCancel" />
      </div>
    </template>
    <a-form layout="vertical">
      <a-form-item label="开始执行时间">
        <a-date-picker
          v-model:value="fromDate"
          format="YYYY-MM-DD HH:mm"
          :show-time="{ defaultValue: dayjs('00:00', 'HH:mm') }"
          placeholder="请选择"
          :locale="locale"
        />
      </a-form-item>

      <a-form-item label="结束执行时间">
        <a-date-picker
          v-model:value="endDate"
          format="YYYY-MM-DD HH:mm"
          :show-time="{ defaultValue: dayjs('00:00', 'HH:mm') }"
          placeholder="请选择"
          :locale="locale"
        />
      </a-form-item>

      <a-form-item label="月">
        <a-select
          v-model:value="monthPlan.type"
          :style="{ width: '100%' }"
          :allowClear="true"
          :options="monthPlanTypeOption"
        ></a-select>
        <a-select
          v-if="monthPlan.type === 'fixedMonth'"
          mode="multiple"
          v-model:value="monthPlan.fixedMonth"
          :style="{ width: '100%', marginTop: '10px' }"
          :options="monthOption"
          placeholder="请选择"
        >
        </a-select>
      </a-form-item>

      <a-form-item label="天">
        <a-select
          v-model:value="dayPlan.type"
          :style="{ width: '100%' }"
          :allowClear="true"
          :options="dayPlanTypeOption"
        ></a-select>
        <div v-if="dayPlan.type === 'rangeDaysOfMonth'" class="range-days-of-month">
          <a-input-number placeholder="输入范围" v-model:value="dayPlan.rangeStartDayOfMonth" :min="1" :max="31" />
          <span style="margin: 6px">~</span>
          <a-input-number placeholder="输入范围" v-model:value="dayPlan.rangeEndDayOfMonth" :min="2" :max="31" />
        </div>
        <a-select
          v-if="dayPlan.type === 'fixedDaysOfMonth'"
          mode="multiple"
          v-model:value="dayPlan.fixedDaysOfMonth"
          :style="{ width: '100%', marginTop: '10px' }"
          :options="dayOption"
          placeholder="请选择"
        >
        </a-select>
        <div v-if="dayPlan.type === 'incrementDaysOfMonth'" class="range-days-of-month">
          <span style="margin-right: 8px">从</span>
          <a-input-number v-model:value="dayPlan.incrementStartDayOfMonth" :min="1" :max="30" />
          <span style="margin: 6px">日开始，间隔</span>
          <a-input-number v-model:value="dayPlan.incrementIntervalDayOfMonth" :min="1" />
          <span style="margin-left: 8px">日</span>
        </div>
        <a-select
          v-if="dayPlan.type === 'weeksOfMonth'"
          mode="multiple"
          v-model:value="dayPlan.weeksOfMonth"
          :style="{ width: '100%', marginTop: '10px' }"
          :options="weekOption"
          placeholder="请选择"
        >
        </a-select>
      </a-form-item>

      <a-form-item label="小时">
        <a-select
          v-model:value="hourPlan.type"
          :style="{ width: '100%' }"
          :allowClear="true"
          :options="hourPlanTypeOption"
        ></a-select>
        <div v-if="hourPlan.type === 'rangeHours'" class="range-days-of-month">
          <a-input-number placeholder="输入范围" v-model:value="hourPlan.rangeStartHour" :min="0" :max="23" />
          <span style="margin: 6px">~</span>
          <a-input-number placeholder="输入范围" v-model:value="hourPlan.rangeEndHour" :min="0" :max="23" />
        </div>
        <a-select
          v-if="hourPlan.type === 'fixedHours'"
          mode="multiple"
          v-model:value="hourPlan.fixedHours"
          :style="{ width: '100%', marginTop: '10px' }"
          :options="hourOption"
          placeholder="请选择"
          optionLabelProp="showLabel"
        >
        </a-select>
        <div v-if="hourPlan.type === 'incrementHours'" class="range-days-of-month">
          <span style="margin-right: 8px">从</span>
          <a-input-number v-model:value="hourPlan.incrementStartHour" :min="1" :max="23" />
          <span style="margin: 6px">时开始，间隔</span>
          <a-input-number v-model:value="hourPlan.incrementIntervalHour" :min="1" />
          <span style="margin-left: 8px">小时</span>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style lang="scss">
.set-update-time-modal {
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
}
</style>
