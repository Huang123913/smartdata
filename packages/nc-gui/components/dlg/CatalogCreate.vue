<script setup lang="ts">
import { generateUniqueTitle as generateTitle, getNowDateDetail } from '#imports'
import { v4 as uuidv4 } from 'uuid'

import Icon from '@ant-design/icons-vue'

const props = defineProps<{
  dialogShow: boolean
  closeDialog: (value: boolean) => void
  catalog?: any
}>()

const { $api } = useNuxtApp()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { addCatalog, findNodeById } = store
const inputEl = ref<HTMLInputElement>()
const useForm = Form.useForm
const selectedCatalog = ref(null)
const creating = ref(false)
const isShowSelectCatalogModel = ref<boolean>(false)
const formState = reactive({
  title: '',
})
const validators = computed(() => {
  return {
    title: [validateCatalogName],
  }
})

const { validateInfos } = useForm(formState, validators)

const generateUniqueCatalogName = () => {
  if (chataiData.value.modelCatalog.length) {
    let title = generateTitle('Catalog', chataiData.value.modelCatalog, 'name_cn')
    formState.title = title
  } else {
    formState.title = 'Catalog-1'
  }
}

onMounted(() => {
  generateUniqueCatalogName()
  if (props.catalog) selectedCatalog.value = props.catalog
  nextTick(() => {
    inputEl.value?.focus()
    inputEl.value?.select()
  })
})

const _createCatalog = async () => {
  if (creating.value) return
  try {
    creating.value = true
    let lastChild = null
    let catalogId = selectedCatalog.value ? selectedCatalog.value.id : null
    let findCatalog = findNodeById(chataiData.value.modelTree, catalogId)
    if (findCatalog && findCatalog?.children && findCatalog?.children.length) {
      lastChild = findCatalog.children[findCatalog.children.length - 1]
    }
    if (!catalogId && chataiData.value.modelTree.length) {
      let childrenCatalog = chataiData.value.modelTree[0].children
      lastChild = childrenCatalog[childrenCatalog.length - 1]
    }
    let savedCatalog = {
      id: uuidv4(),
      name: formState.title,
      name_cn: formState.title,
      parentId: catalogId,
      code: uuidv4(),
      orderNo: lastChild ? lastChild.orderNo + 1 : 1,
      catalogType: 'default',
      disabled: false,
      customDateTime: getNowDateDetail(),
    }
    addCatalog(savedCatalog)
    await $api.smartData.saveCustomCatalog(savedCatalog)
  } catch (e: any) {
    console.error(e)
  } finally {
    props.closeDialog(false)
    creating.value = false
  }
}

const handleCancel = () => {
  props.closeDialog(false)
  generateUniqueCatalogName()
}

const handleShowSelectCatalog = (value: boolean) => {
  isShowSelectCatalogModel.value = value
}

const handleSelectCatalogModalOk = (selectedCatalogParam: any) => {
  selectedCatalog.value = selectedCatalogParam
  handleShowSelectCatalog(false)
}
</script>

<template>
  <NcModal :visible="dialogShow" :header="$t('activity.createCatalog')" size="small" @keydown.esc="dialogShow = false">
    <template #header>
      <div class="flex flex-row items-center gap-x-2">
        <icon class="!text-gray-600/75 dialog-header-icon">
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
        <span>
          {{ $t('activity.createCatalog') }}
        </span>
      </div>
    </template>
    <div class="flex flex-col mt-2">
      <a-form :model="formState" name="create-new-catalog-form" @keydown.enter="_createCatalog" @keydown.esc="closeDialog(false)">
        <a-form-item class="flex" v-bind="validateInfos.title">
          <a-input
            ref="inputEl"
            v-model:value="formState.title"
            class="nc-input-md"
            hide-details
            :placeholder="$t('msg.info.enterCatalogName')"
          >
            <template #suffix v-if="!catalog">
              <a-button @click="handleShowSelectCatalog(true)" type="text">选择目录</a-button>
            </template>
          </a-input>
          <div v-if="selectedCatalog && !catalog" class="selected-catalog-tip text-gray-400">
            已选目录:{{ selectedCatalog.name_cn }}
          </div>
        </a-form-item>
        <div class="flex flex-row justify-end gap-x-2 mt-2">
          <NcButton type="secondary" @click="handleCancel">{{ $t('general.cancel') }}</NcButton>
          <NcButton
            :disabled="validateInfos.title.validateStatus === 'error' || !formState.title?.trim()"
            type="primary"
            :loading="creating"
            @click="_createCatalog"
          >
            {{ $t('activity.createCatalog') }}
            <template #loading> {{ $t('activity.createCatalog') }} </template>
          </NcButton>
        </div>
      </a-form>
    </div>
  </NcModal>
  <DlgSelectCatalog
    :visible="isShowSelectCatalogModel"
    :handleShowSelectCatalog="handleShowSelectCatalog"
    :handleModalOk="handleSelectCatalogModalOk"
    :modelTitle="'选择目录'"
  ></DlgSelectCatalog>
</template>

<style scoped lang="scss">
.dialog-header-icon {
  position: relative;
  top: 1px;
  margin-right: -1px;
}

.selected-catalog-tip {
  margin-top: 2px;
  font-size: 12px;
  font-family: Manrope, 'Inter', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}
</style>
