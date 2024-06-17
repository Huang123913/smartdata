<script lang="ts" setup>
import { ref } from '#imports'
import type { BaseType } from 'nocodb-sdk'

const props = defineProps<{
  item: any
  base: BaseType
  isCatalogDropDown: boolean
}>()
const { $api } = useNuxtApp()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { updateModelCatalog, findNodeById } = store
const { isUIAllowed } = useRoles()
const { openRenameTableDialog, duplicateTable } = inject(TreeViewInj)!
const baseRole = inject(ProjectRoleInj)
const clicked = ref<boolean>(false)
const isTableDeleteDialogVisible = ref(false)
const isCatalogDeleteDialogVisible = ref(false)
const isShowSelectCatalogModel = ref(false)
const updatedModel = ref(null)
const isShowLoading = ref(false)
const modelPath = ref('')
const isShowCatalogRenameDialog = ref(false)
const selectCatalogModelTitle = computed(() => {
  return props.isCatalogDropDown ? '移动目录' : '移动表格目录'
})

const setIsShowCatalogRenameDialog = (value: boolean) => {
  isShowCatalogRenameDialog.value = value
}

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}

const handleTableDelete = () => {
  clicked.value = false
  if (props.isCatalogDropDown) {
    isCatalogDeleteDialogVisible.value = true
    console.log('isCatalogDeleteDialogVisible', isCatalogDeleteDialogVisible.value)
  } else {
    isTableDeleteDialogVisible.value = true
  }
}

const handleRename = (item: any) => {
  clicked.value = false
  if (props.isCatalogDropDown) {
    setIsShowCatalogRenameDialog(true)
  } else {
    openRenameTableDialog(item, true)
  }
}

const handleCopy = (item: any) => {
  clicked.value = false
  duplicateTable(item)
}

const handleShowSelectCatalog = (value: boolean, item?: any) => {
  isShowSelectCatalogModel.value = value
  clicked.value = false
  if (item) {
    updatedModel.value = item
    if (item.parentId) {
      let findCatalog = chataiData.value.modelData.find((model) => model.id == item.parentId)
      modelPath.value = `${findCatalog.name_cn} / ${item.name_cn}`
    } else {
      modelPath.value = `${props.base.title} / ${item.name_cn}`
    }
  }
}

const handleSelectCatalogModalOk = async (selectedCatalogParam: any) => {
  try {
    if (selectedCatalogParam && updatedModel.value?.parentId === selectedCatalogParam.id) {
      message.warning('此表已经在该目录下')
      return
    }
    // let orderNo = selectedCatalogParam ? 0 : chataiData.value.modelTree[0].children.length + 1
    isShowLoading.value = true
    updateModelCatalog(updatedModel.value?.id, selectedCatalogParam ? selectedCatalogParam.id : null)
    if (updatedModel.value?.isCatalog) {
      await $api.smartData.saveCustomCatalog({
        id: updatedModel.value?.id,
        name: null,
        name_cn: null,
        catalogType: null,
        parentId: selectedCatalogParam ? selectedCatalogParam.id : props.base.id,
        code: null,
        label: null,
        description: null,
        description_cn: null,
        disabled: null,
        orderNo: null,
        customDateTime: null,
        customGroupId: null,
        customGroupName: null,
        customOwnerId: null,
        customOwnerName: null,
      })
    } else {
      await $api.smartData.updateModelCatalog({
        entities: [{ id: updatedModel.value?.id, belongCatalog: selectedCatalogParam.id }],
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    isShowLoading.value = false
    handleShowSelectCatalog(false, null)
  }
}

const handleSetIsCatalogDeleteDialogVisible = (value: boolean) => {
  isCatalogDeleteDialogVisible.value = value
}
</script>
<template>
  <NcDropdown
    :trigger="['click']"
    class="nc-sidebar-node-btn"
    :class="{ show: clicked }"
    :visible="clicked"
    @visibleChange="handleClickChange"
    :overlayClassName="'table-action-content'"
  >
    <MdiDotsHorizontal
      @click="
          (e:any) => {
            e.stopPropagation()
            clicked = true
          }
        "
      data-testid="nc-sidebar-table-context-menu"
      class="min-w-5.75 min-h-5.75 mt-0.2 mr-0.25 px-0.5 !text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 nc-tbl-context-menu outline-0 rounded-md hover:(bg-gray-500 bg-opacity-15 !text-black)"
    />
    <template #overlay>
      <NcMenu>
        <NcMenuItem
          v-if="isUIAllowed('tableRename', { roles: baseRole })"
          :data-testid="`sidebar-table-rename-${item.title}`"
          @click="handleRename(item)"
        >
          <div v-e="['c:table:rename']" class="flex gap-2 items-center">
            <GeneralIcon icon="rename" class="text-gray-700" />
            {{ $t('general.rename') }}
          </div>
        </NcMenuItem>

        <NcMenuItem
          v-if="isUIAllowed('tableDuplicate') && !isCatalogDropDown"
          :data-testid="`sidebar-table-duplicate-${item.title}`"
          @click="handleCopy(item)"
        >
          <div v-e="['c:table:duplicate']" class="flex gap-2 items-center">
            <GeneralIcon icon="duplicate" class="text-gray-700" />
            {{ $t('general.duplicate') }}
          </div>
        </NcMenuItem>

        <NcMenuItem :data-testid="`sidebar-table-rename-${item.title}`" @click="handleShowSelectCatalog(true, item)">
          <div class="flex gap-2 items-center">
            <GeneralIcon icon="move" class="text-gray-700" />
            {{ $t('general.moveTo') }}
          </div>
        </NcMenuItem>

        <template v-if="isUIAllowed('tableDelete', { roles: baseRole })">
          <NcDivider />
          <NcMenuItem
            :data-testid="`sidebar-table-delete-${item.title}`"
            class="!text-red-500 !hover:bg-red-50"
            @click="handleTableDelete"
          >
            <div v-e="['c:table:delete']" class="flex gap-2 items-center">
              <GeneralIcon icon="delete" />
              {{ $t('general.delete') }}
            </div>
          </NcMenuItem>
        </template>
      </NcMenu>
    </template>
  </NcDropdown>

  <DlgTableDelete
    v-if="item.id && base?.id"
    v-model:visible="isTableDeleteDialogVisible"
    :table-id="item.id"
    :base-id="base.id"
  />

  <DlgCatalogDelete
    :visible="isCatalogDeleteDialogVisible"
    :catalog="item"
    :handleSetIsCatalogDeleteDialogVisible="handleSetIsCatalogDeleteDialogVisible"
  />

  <DlgSelectCatalog
    :visible="isShowSelectCatalogModel"
    :handleShowSelectCatalog="handleShowSelectCatalog"
    :handleModalOk="handleSelectCatalogModalOk"
    :modelTitle="selectCatalogModelTitle"
    :modelPath="modelPath"
  />
  <DlgCatalogRename :catalogMeta="item" :dialogShow="isShowCatalogRenameDialog" :setDialogShow="setIsShowCatalogRenameDialog" />

  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.nc-sidebar-node-btn {
  opacity: 0;
}
.table-action-content {
  .ant-dropdown-menu {
    min-width: 200px;
  }
}
.hover-set {
  &:hover .nc-sidebar-node-btn {
    opacity: 1;
  }
}
.show {
  opacity: 1 !important;
}
</style>
