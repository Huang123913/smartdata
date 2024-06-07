<script lang="ts" setup>
import { ref } from '#imports'
import type { BaseType } from 'nocodb-sdk'

import Icon from '@ant-design/icons-vue'

const props = defineProps<{
  item: any
  base: BaseType
}>()
const { $api } = useNuxtApp()
const clicked = ref<boolean>(false)
const isShowLoading = ref(false)
const createCatalogDialogShow = ref(false)

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}

//创建表
const openTableCreateDialog = (catalog: any) => {
  handleClickChange(false)
  const isOpen = ref(true)
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

//创建目录
const openCatalogCreateDialog = () => {
  handleClickChange(false)
  setCreateCatalogDialogShow(true)
}

const setCreateCatalogDialogShow = (value: boolean) => {
  createCatalogDialogShow.value = value
}
</script>
<template>
  <NcDropdown
    class="nc-sidebar-node-btn"
    :class="{ show: clicked }"
    :trigger="['click']"
    :visible="clicked"
    @visibleChange="handleClickChange"
    :overlayClassName="'add-catalog-dropdown'"
  >
    <GeneralIcon
      @click="
          (e:any) => {
            e.stopPropagation()
            clicked = true
          }
        "
      icon="plus"
      class="add-catalog-icon flex justify-center items-center !text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 nc-tbl-context-menu outline-0 rounded-md hover:(bg-gray-500 bg-opacity-15 !text-black) text-xl"
    />
    <template #overlay>
      <NcMenu>
        <NcMenuItem @click="openCatalogCreateDialog">
          <div class="flex gap-2 items-center text-gray-700">
            <icon :style="{ marginRight: '3px' }" class="text-gray-700">
              <template #component>
                <svg
                  t="1717723738400"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4372"
                  width="16"
                  height="16"
                >
                  <path
                    d="M579.2 864c-16.8-16.8-31.2-36.8-41.6-58.4H174.4c-55.2-0.8-99.2-46.4-98.4-101.6V197.6c-0.8-55.2 43.2-100.8 98.4-101.6h141.6c38.4 0 72.8 22.4 88.8 57.6l20 44H768c55.2 0.8 99.2 46.4 99.2 101.6v240.8c6.4 4.8 12 10.4 18.4 16 84 85.6 84 223.2 0 308.8-83.2 84-219.2 85.6-303.2 2.4l-3.2-3.2z m-6.4-154.4c0.8 88 72.8 158.4 160.8 157.6 88-0.8 158.4-72.8 157.6-160.8-0.8-87.2-72-157.6-159.2-157.6-88.8 0.8-160 72.8-159.2 160.8zM141.6 704c0 18.4 14.4 33.6 32.8 33.6h343.2c-8.8-67.2 14.4-134.4 61.6-182.4 57.6-58.4 144-79.2 221.6-52.8V392.8H141.6V704z m0-506.4v128h659.2v-26.4c0-18.4-14.4-33.6-32.8-33.6H405.6c-12.8 0-24-8-29.6-19.2l-29.6-63.2c-5.6-12-16.8-19.2-29.6-19.2H174.4c-18.4 0-32.8 15.2-32.8 33.6z m558.4 593.6v-48.8h-48c-17.6 0-32-14.4-32-32s14.4-32 32-32h48v-48.8c0-17.6 14.4-32 32-32s32 14.4 32 32v48.8h48c17.6 0 32 14.4 32 32s-14.4 32-32 32h-48v48.8c0 17.6-14.4 32-32 32s-32-14.4-32-32z m-464-129.6c-17.6 0-32-14.4-32-32s14.4-32 32-32h127.2c17.6 0 32 14.4 32 32s-14.4 32-32 32H236z m0-129.6c-17.6 0-32.8-14.4-32.8-32s14.4-32.8 32-32.8h224c17.6 0 32.8 14.4 32.8 32s-14.4 32.8-32 32.8h-224z"
                    fill="#333333"
                    p-id="4373"
                  ></path>
                </svg>
              </template>
            </icon>
            {{ '创建目录' }}
          </div>
        </NcMenuItem>

        <NcMenuItem @click="openTableCreateDialog(item)">
          <div class="flex gap-2 items-center">
            <GeneralTableIcon :meta="item" class="text-gray-500" />
            {{ '创建表' }}
          </div>
        </NcMenuItem>
      </NcMenu>
    </template>
  </NcDropdown>
  <template v-if="createCatalogDialogShow">
    <DlgCatalogCreate :dialogShow="createCatalogDialogShow" :closeDialog="setCreateCatalogDialogShow" :catalog="item" />
  </template>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.add-catalog-icon {
  width: 23px;
  height: 23px;
}
.add-catalog-dropdown {
  .ant-dropdown-menu {
    min-width: 200px;
  }
}
</style>
