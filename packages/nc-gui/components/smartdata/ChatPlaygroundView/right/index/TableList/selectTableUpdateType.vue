<script lang="ts" setup>
const props = defineProps<{
  handleSelectOptionClick: (value: any) => void
  selectLabel: string
  selectTip: string
}>()
onMounted(() => {
  if (props.defaultValue) modelUpdateTypeValue.value = props.defaultValue
})
const modelUpdateTypeValue = ref<string>('RealTimeView') //模型数据更新方式
const selectOption = [
  { value: 'ScheduledRefresh', label: '定时更新' },
  { value: 'RealTimeView', label: '实时视图' },
]
</script>

<template>
  <div class="select-table-update-type">
    <span>{{ selectLabel }}</span>
    <a-select
      v-model:value="modelUpdateTypeValue"
      :style="{ width: '155px', marginLeft: '8px' }"
      :allowClear="true"
      :placeholder="selectTip"
      @click="handleClick"
    >
      <a-select-option @click="handleSelectOptionClick(item)" v-for="item in selectOption" :key="item.value" :value="item.value">
        {{ item.label }}
      </a-select-option>
    </a-select>
  </div>
</template>

<style lang="scss" scoped>
.select-table-update-type {
  .ant-select {
    text-align: left;
  }
}
</style>
