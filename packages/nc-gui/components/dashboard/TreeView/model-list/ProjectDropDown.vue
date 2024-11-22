<script lang="ts" setup>
import { ref } from '#imports'

const props = defineProps<{
  reName: (a: string, b: string) => void
  item: any
}>()

const { $e } = useNuxtApp()
const clicked = ref(false)
const isProjectDeleteDialogVisible = ref(false)

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}

const handleRename = () => {
  clicked.value = false
  props.reName(props.item.id, props.item.title)
}

const projectDelete = () => {
  clicked.value = false
  isProjectDeleteDialogVisible.value = true
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
        <NcMenuItem @click="handleRename">
          <div class="flex gap-2 items-center">
            <GeneralIcon icon="rename" class="text-gray-700" />
            {{ $t('general.rename') }}
          </div>
        </NcMenuItem>

        <NcDivider />
        <NcMenuItem class="!text-red-500 !hover:bg-red-50" @click="projectDelete">
          <div class="flex gap-2 items-center">
            <GeneralIcon icon="delete" />
            {{ $t('general.delete') }}
          </div>
        </NcMenuItem>
      </NcMenu>
    </template>
  </NcDropdown>
  <DlgProjectDelete v-model:visible="isProjectDeleteDialogVisible" :baseId="item.id" />
</template>

<style lang="scss" scoped>
.table-action-content {
  .ant-dropdown-menu {
    min-width: 200px;
  }
}
.hover-project-set {
  &:hover .nc-sidebar-node-btn {
    opacity: 1;
  }
}
.show {
  opacity: 1 !important;
}
</style>
