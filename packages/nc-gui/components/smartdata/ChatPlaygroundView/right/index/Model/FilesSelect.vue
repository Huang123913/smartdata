<script lang="ts" setup>
import { ref } from '#imports'

import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons-vue'

import { useChatPlaygroundViewStore } from '../../../../../../store/chatPlaygroundView'

const props = defineProps<{
  modelItem: { [key: string]: any }
}>()
const { $api } = useNuxtApp()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { setModelFields, chataiApi } = store
const selectOptionData = ref<any>([]) //下拉数据
const clicked = ref<boolean>(false) //是否显示选择字段弹框
const isShowLoading = ref<boolean>(false)
const checkedValues = computed(() => {
  //已选字段值
  let fields = []
  if (chataiData.value.modelFields.hasOwnProperty(props.modelItem.id)) {
    fields = chataiData.value.modelFields[props.modelItem.id]
  }
  return fields.map((item: any) => item.fieldName)
})

//加载字段
const handleLoadFiles = async () => {
  try {
    if (selectOptionData.value.length) {
      clicked.value = true
      return
    }
    isShowLoading.value = true
    clicked.value = false
    let modelInfo = await $api.smartData.entity({ entityId: props.modelItem.id })
    let fields = modelInfo[0].fields ?? []
    selectOptionData.value = fields.map((item: any) => {
      return { ...item, value: item.fieldName, label: item.fieldName }
    })
  } catch (e: any) {
    console.log(e)
  } finally {
    isShowLoading.value = false
    clicked.value = true
  }
}

//点击其他地方隐藏选择字段弹框
const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}

//选择字段
const handleChange = (value: string[], option: any) => {
  setModelFields(props.modelItem.id, option)
}
</script>

<template>
  <a-popover
    trigger="click"
    placement="bottomRight"
    color="white"
    :visible="clicked"
    :overlayClassName="'chatai1-tooltip'"
    @visibleChange="handleClickChange"
  >
    <template #title>
      <span>{{ modelItem.name_cn }}</span>
      <close-outlined @click="clicked = false" />
    </template>
    <template #content>
      <a-select
        v-model:value="checkedValues"
        mode="multiple"
        style="width: 300px"
        placeholder="请选择"
        :allowClear="true"
        :options="selectOptionData"
        @change="handleChange"
      ></a-select>
    </template>
    <ellipsis-outlined class="more-btn" @click="handleLoadFiles()" />
  </a-popover>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.ant-select-selection-item {
  display: flex;
  align-items: center;
}
.ant-tree-title {
  &:hover .more-btn {
    opacity: 1;
  }
  .more-btn {
    margin-left: 30px;
    position: relative !important;
    top: -2px;
    opacity: 0;
  }
}

.chatai1-tooltip {
  .ant-popover-inner {
    min-width: 180px;
  }
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-title {
    border: none;
    padding: 14px 16px 0px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ant-popover-inner-content {
    padding: 8px 16px 16px 16px !important;
  }
}
</style>
