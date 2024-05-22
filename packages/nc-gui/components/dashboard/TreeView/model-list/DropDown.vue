<script lang="ts" setup>
import { ref } from '#imports'
import type { BaseType } from 'nocodb-sdk'

const props = defineProps<{
  item: any
  base: BaseType
}>()
const { isUIAllowed } = useRoles()
const { openRenameTableDialog, duplicateTable } = inject(TreeViewInj)!
const baseRole = inject(ProjectRoleInj)
const clicked = ref<boolean>(false)
const isTableDeleteDialogVisible = ref(false)

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}

const handleTableDelete = () => {
  clicked.value = false
  isTableDeleteDialogVisible.value = true
}

const handleRename = (item: any) => {
  clicked.value = false
  openRenameTableDialog(item, true)
}

const handleCopy = (item: any) => {
  clicked.value = false
  duplicateTable(item)
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
          disabled
          v-if="isUIAllowed('tableDuplicate')"
          :data-testid="`sidebar-table-duplicate-${item.title}`"
          @click="handleCopy(item)"
        >
          <div v-e="['c:table:duplicate']" class="flex gap-2 items-center">
            <GeneralIcon icon="duplicate" class="text-gray-700" />
            {{ $t('general.duplicate') }}
          </div>
        </NcMenuItem>

        <NcMenuItem
          v-if="isUIAllowed('tableDelete', { roles: baseRole })"
          :data-testid="`sidebar-table-delete-${item.title}`"
          class="!text-red-500 !hover:bg-red-50"
          @click="handleTableDelete"
        >
          <div v-e="['c:table:delete']" class="flex gap-2 items-center">
            <GeneralIcon icon="delete" />
            {{ $t('general.delete') }}
          </div>
        </NcMenuItem>
      </NcMenu>
    </template>
  </NcDropdown>

  <DlgTableDelete
    v-if="item.id && base?.id"
    v-model:visible="isTableDeleteDialogVisible"
    :table-id="item.id"
    :base-id="base.id"
  />
</template>

<style lang="scss">
.nc-sidebar-node-btn {
  opacity: 0;
}
.table-action-content {
  .ant-dropdown-menu {
    min-width: 200px;
    padding: 16px 8px !important;
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
