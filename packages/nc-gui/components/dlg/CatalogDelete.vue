<script lang="ts" setup>
const props = defineProps<{
  visible: boolean
  catalog: object
  handleSetIsCatalogDeleteDialogVisible: (value: boolean) => void
}>()

const { $api } = useNuxtApp()
const isLoading = ref(false)
const store = useChatPlaygroundViewStore()
const { getCustomCatalogEntityTree } = store
const onDelete = async () => {
  isLoading.value = true
  try {
    if (props.catalog?.children && props.catalog.children.length) {
      message.warning('文件夹内存在实体！无法删除！')
      return
    }
    await $api.smartData.delEntityCatalogCustom({ id: props.catalog.id })
    await getCustomCatalogEntityTree()
  } catch (e: any) {
    message.error(await extractSdkResponseErrorMsg(e))
  } finally {
    isLoading.value = false
    props.handleSetIsCatalogDeleteDialogVisible(false)
  }
}
</script>

<template>
  <GeneralDeleteModal
    :visible="visible"
    :entity-name="'目录'"
    :on-delete="onDelete"
    :onCancel="handleSetIsCatalogDeleteDialogVisible"
  >
    <template #entity-preview>
      <div v-if="catalog" class="flex flex-row items-center py-2.25 px-2.5 bg-gray-50 rounded-lg text-gray-700 mb-4">
        <div
          class="capitalize text-ellipsis overflow-hidden select-none w-full pl-1.75"
          :style="{ wordBreak: 'keep-all', whiteSpace: 'nowrap', display: 'inline' }"
        >
          {{ catalog.name_cn }}
        </div>
      </div>
    </template>
  </GeneralDeleteModal>
</template>
