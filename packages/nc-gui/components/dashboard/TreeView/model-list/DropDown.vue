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
const { moveCatalog, moveModel } = store
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
  return props.isCatalogDropDown ? '移动目录' : '移动表格'
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
  let isReSelectCatalog: boolean = false
  try {
    if (selectedCatalogParam && updatedModel.value?.parentId === selectedCatalogParam.id) {
      message.warning('移动目标已经在该目录下')
      isReSelectCatalog = true
      return
    }
    isShowLoading.value = true
    if (updatedModel.value?.isCatalog) {
      await moveCatalogTo(selectedCatalogParam)
    } else {
      await moveModelTo(selectedCatalogParam)
    }
  } catch (error) {
    console.error(error)
  } finally {
    if (isReSelectCatalog) return
    isShowLoading.value = false
    handleShowSelectCatalog(false, null)
  }
}

const moveCatalogTo = async (selectedCatalogParam: any) => {
  let params = {
    sourceCatalogId: updatedModel.value?.id, //源目录id
    targetCatalogId: selectedCatalogParam ? selectedCatalogParam.id : null, //目标移动目录id
    ismoveCustomCatalogLast: true,
  }
  await $api.smartData.moveCatalog(params)
  moveCatalog(updatedModel.value?.id, updatedModel.value?.parentId, selectedCatalogParam ? selectedCatalogParam.id : null, null)
}

const moveModelTo = async (selectedCatalogParam: any) => {
  let params = {
    baseId: props.base.id,
    catalogId: selectedCatalogParam ? selectedCatalogParam.id : '__root__', //调整到哪个目录ID下，若传空则认为在原目录下调整位置
    tableId: updatedModel.value?.id, //要调整位置的表ID
    prependToTableId: '', //要插入到哪个表ID前，若传空则插入到目录的最后
  }
  moveModel(params.tableId, updatedModel.value?.parentId, selectedCatalogParam ? selectedCatalogParam.id : null, '')
  await $api.smartData.moveModel(params)
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
          v-if="isUIAllowed('tableRename', { source: base?.sources?.[0] })"
          :data-testid="`sidebar-table-rename-${item.title}`"
          @click="handleRename(item)"
        >
          <div v-e="['c:table:rename']" class="flex gap-2 items-center">
            <GeneralIcon icon="rename" class="text-gray-700" />
            {{ $t('general.rename') }}
          </div>
        </NcMenuItem>

        <NcMenuItem
          v-if="isUIAllowed('tableDuplicate', { source: base?.sources?.[0] }) && !isCatalogDropDown"
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

        <template v-if="isUIAllowed('tableDelete', { source: base?.sources?.[0] })">
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
    :moveTarget="updatedModel"
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
