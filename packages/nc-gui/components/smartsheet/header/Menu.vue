<script lang="ts" setup>
import { SmartsheetStoreEvents } from '#imports'
import type { ColumnReqType } from 'nocodb-sdk'
import { PlanLimitTypes, RelationTypes, UITypes, isLinksOrLTAR } from 'nocodb-sdk'
import { v4 as uuidv4 } from 'uuid'

import Icon from '@ant-design/icons-vue'

const props = defineProps<{ virtual?: boolean; isOpen: boolean; isHiddenCol?: boolean; semanticsSearchedFields: string[] }>()

const emit = defineEmits(['edit', 'addColumn', 'update:isOpen'])

const virtual = toRef(props, 'virtual')

const isOpen = useVModel(props, 'isOpen', emit)

const { eventBus, allFilters } = useSmartsheetStoreOrThrow()

const column = inject(ColumnInj)

const reloadDataHook = inject(ReloadViewDataHookInj)

const meta = inject(MetaInj, ref())

const view = inject(ActiveViewInj, ref())

const isLocked = inject(IsLockedInj)

const isPublic = inject(IsPublicInj, ref(false))

const isExpandedForm = inject(IsExpandedFormOpenInj, ref(false))

const { insertSort } = useViewSorts(view, () => reloadDataHook?.trigger())

const { $api, $e } = useNuxtApp()

const { t } = useI18n()

const { getMeta } = useMetas()

const { addUndo, defineModelScope, defineViewScope } = useUndoRedo()

const showDeleteColumnModal = ref(false)

const { gridViewCols } = useViewColumnsOrThrow()

const { fieldsToGroupBy, groupByLimit } = useViewGroupByOrThrow(view)

const setAsDisplayValue = async () => {
  try {
    const currentDisplayValue = meta?.value?.columns?.find((f) => f.pv)

    isOpen.value = false

    await $api.dbTableColumn.primaryColumnSet(column?.value?.id as string)

    await getMeta(meta?.value?.id as string, true)

    eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)

    // Successfully updated as primary column
    // message.success(t('msg.success.primaryColumnUpdated'))

    $e('a:column:set-primary')

    addUndo({
      redo: {
        fn: async (id: string) => {
          await $api.dbTableColumn.primaryColumnSet(id)

          await getMeta(meta?.value?.id as string, true)

          eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)

          // Successfully updated as primary column
          // message.success(t('msg.success.primaryColumnUpdated'))
        },
        args: [column?.value?.id as string],
      },
      undo: {
        fn: async (id: string) => {
          await $api.dbTableColumn.primaryColumnSet(id)

          await getMeta(meta?.value?.id as string, true)

          eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)

          // Successfully updated as primary column
          // message.success(t('msg.success.primaryColumnUpdated'))
        },
        args: [currentDisplayValue?.id],
      },
      scope: defineModelScope({ model: meta.value }),
    })
  } catch (e) {
    message.error(t('msg.error.primaryColumnUpdateFailed'))
  }
}

const sortByColumn = async (direction: 'asc' | 'desc') => {
  await insertSort({
    column: column!.value,
    direction,
    reloadDataHook,
  })
}

const isDuplicateDlgOpen = ref(false)
const selectedColumnExtra = ref<any>()
const duplicateDialogRef = ref<any>()
const addsemanticsSearchedFields = ref([])

const duplicateVirtualColumn = async () => {
  let columnCreatePayload = {}

  // generate duplicate column title
  const duplicateColumnTitle = getUniqueColumnName(`${column!.value.title} copy`, meta!.value!.columns!)

  columnCreatePayload = {
    ...column!.value!,
    ...(column!.value.colOptions ?? {}),
    title: duplicateColumnTitle,
    column_name: duplicateColumnTitle.replace(/\s/g, '_'),
    id: undefined,
    colOptions: undefined,
    order: undefined,
    system: false,
  }

  try {
    const gridViewColumnList = (await $api.dbViewColumn.list(view.value?.id as string)).list

    const currentColumnIndex = gridViewColumnList.findIndex((f) => f.fk_column_id === column!.value.id)
    let newColumnOrder
    if (currentColumnIndex === gridViewColumnList.length - 1) {
      newColumnOrder = gridViewColumnList[currentColumnIndex].order! + 1
    } else {
      newColumnOrder = (gridViewColumnList[currentColumnIndex].order! + gridViewColumnList[currentColumnIndex + 1].order!) / 2
    }

    await $api.dbTableColumn.create(meta!.value!.id!, {
      ...columnCreatePayload,
      pv: false,
      view_id: view.value!.id as string,
      column_order: {
        order: newColumnOrder,
        view_id: view.value!.id as string,
      },
    } as ColumnReqType)
    await getMeta(meta!.value!.id!, true)

    eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)
    reloadDataHook?.trigger()

    // message.success(t('msg.success.columnDuplicated'))
  } catch (e) {
    message.error(await extractSdkResponseErrorMsg(e))
  }
  // closing dropdown
  isOpen.value = false
}

const openDuplicateDlg = async () => {
  if (!column?.value) return
  if (
    column.value.uidt &&
    [
      UITypes.Lookup,
      UITypes.Rollup,
      UITypes.CreatedTime,
      UITypes.LastModifiedTime,
      UITypes.CreatedBy,
      UITypes.LastModifiedBy,
    ].includes(column.value.uidt as UITypes)
  ) {
    duplicateVirtualColumn()
  } else {
    const gridViewColumnList = (await $api.dbViewColumn.list(view.value?.id as string)).list

    const currentColumnIndex = gridViewColumnList.findIndex((f) => f.fk_column_id === column!.value.id)
    let newColumnOrder
    if (currentColumnIndex === gridViewColumnList.length - 1) {
      newColumnOrder = gridViewColumnList[currentColumnIndex].order! + 1
    } else {
      newColumnOrder = (gridViewColumnList[currentColumnIndex].order! + gridViewColumnList[currentColumnIndex + 1].order!) / 2
    }

    selectedColumnExtra.value = {
      pv: false,
      view_id: view.value!.id as string,
      column_order: {
        order: newColumnOrder,
        view_id: view.value!.id as string,
      },
    }

    if (column.value.uidt === UITypes.Formula) {
      nextTick(() => {
        duplicateDialogRef?.value?.duplicate()
      })
    } else {
      isDuplicateDlgOpen.value = true
    }

    isOpen.value = false
  }
}

// add column before or after current column
const addColumn = async (before = false) => {
  const gridViewColumnList = (await $api.dbViewColumn.list(view.value?.id as string)).list

  const currentColumnIndex = gridViewColumnList.findIndex((f) => f.fk_column_id === column!.value.id)

  let newColumnOrder
  let prependToColumnId
  if (before) {
    if (currentColumnIndex === 0) {
      newColumnOrder = gridViewColumnList[currentColumnIndex].order / 2
    } else {
      newColumnOrder = (gridViewColumnList[currentColumnIndex].order! + gridViewColumnList[currentColumnIndex - 1]?.order) / 2
    }
    prependToColumnId = gridViewColumnList[currentColumnIndex].id
  } else {
    if (currentColumnIndex === gridViewColumnList.length - 1) {
      newColumnOrder = gridViewColumnList[currentColumnIndex].order + 1
    } else {
      newColumnOrder = (gridViewColumnList[currentColumnIndex].order! + gridViewColumnList[currentColumnIndex + 1]?.order) / 2
      prependToColumnId = gridViewColumnList[currentColumnIndex + 1].id
    }
  }

  emit('addColumn', {
    column_order: {
      order: newColumnOrder,
      view_id: view.value?.id as string,
      prependToColumnId,
    },
  })
}

// hide the field in view
const hideOrShowField = async () => {
  const gridViewColumnList = (await $api.dbViewColumn.list(view.value?.id as string)).list

  const currentColumn = gridViewColumnList.find((f) => f.fk_column_id === column!.value.id)

  const promises = [$api.dbViewColumn.update(view.value!.id!, currentColumn!.id!, { show: !currentColumn.show })]

  if (isExpandedForm.value) {
    promises.push(getMeta(meta?.value?.id as string, true))
  }

  await Promise.all(promises)

  eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)
  if (!currentColumn.show) {
    reloadDataHook?.trigger()
  }

  addUndo({
    redo: {
      fn: async function redo(id: string, show: boolean) {
        const promises = [$api.dbViewColumn.update(view.value!.id!, id, { show: !show })]

        if (isExpandedForm.value) {
          promises.push(getMeta(meta?.value?.id as string, true))
        }

        await Promise.all(promises)

        eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)
        if (!show) {
          reloadDataHook?.trigger()
        }
      },
      args: [currentColumn!.id, currentColumn.show],
    },
    undo: {
      fn: async function undo(id: string, show: boolean) {
        const promises = [$api.dbViewColumn.update(view.value!.id!, id, { show })]

        if (isExpandedForm.value) {
          promises.push(getMeta(meta?.value?.id as string, true))
        }

        await Promise.all(promises)

        eventBus.emit(SmartsheetStoreEvents.FIELD_RELOAD)
        reloadDataHook?.trigger()
        if (show) {
          reloadDataHook?.trigger()
        }
      },
      args: [currentColumn!.id, currentColumn.show],
    },
    scope: defineViewScope({ view: view.value }),
  })
}

const handleDelete = () => {
  // closing the dropdown
  // when modal opens
  isOpen.value = false
  showDeleteColumnModal.value = true
}

const onEditPress = () => {
  isOpen.value = false
  emit('edit')
}

const onInsertBefore = () => {
  isOpen.value = false
  addColumn(true)
}
const onInsertAfter = () => {
  isOpen.value = false
  addColumn()
}

const isDeleteAllowed = computed(() => {
  return column?.value && !column.value.system
})
const isDuplicateAllowed = computed(() => {
  return column?.value && !column.value.system
})
const isFilterSupported = computed(
  () =>
    !!(meta.value?.columns || []).find((f) => f.id === column?.value?.id && ![UITypes.QrCode, UITypes.Barcode].includes(f.uidt)),
)

const { getPlanLimit } = useWorkspace()

const isFilterLimitExceeded = computed(
  () =>
    allFilters.value.filter((f) => !(f.is_group || f.status === 'delete')).length >= getPlanLimit(PlanLimitTypes.FILTER_LIMIT),
)

const isGroupedByThisField = computed(() => !!gridViewCols.value[column?.value?.id]?.group_by)

const isGroupBySupported = computed(() => !!(fieldsToGroupBy.value || []).find((f) => f.id === column?.value?.id))

const isGroupByLimitExceeded = computed(() => {
  const groupBy = Object.values(gridViewCols.value).filter((c) => c.group_by)
  return !(fieldsToGroupBy.value.length && fieldsToGroupBy.value.length > groupBy.length && groupBy.length < groupByLimit)
})

const filterOrGroupByThisField = (event: SmartsheetStoreEvents) => {
  if (column?.value) {
    eventBus.emit(event, column.value)
  }
  isOpen.value = false
}
const isMarking = ref(false)
const markSemanticsSearch = async () => {
  if ([...props.semanticsSearchedFields, ...addsemanticsSearchedFields.value].includes(column?.value?.column_name)) return
  try {
    isMarking.value = true
    await $api.smartData.saveModelProps({
      entityId: view.value.id,
      belongCode: 'belongSemanticFetrieval',
      data: [
        {
          id: uuidv4(),
          columnName: column?.value?.column_name,
          title: column?.value?.title,
        },
      ],
      option: 'add',
      optionId: '',
    })
    addsemanticsSearchedFields.value.push(column?.value?.column_name)
  } catch (error) {
  } finally {
    isMarking.value = false
  }
}
</script>

<template>
  <a-dropdown
    v-if="!isLocked"
    v-model:visible="isOpen"
    :trigger="['click']"
    :placement="isExpandedForm ? 'bottomLeft' : 'bottomRight'"
    overlay-class-name="nc-dropdown-column-operations !border-1 rounded-lg !shadow-xl "
    @click.stop="isOpen = !isOpen"
  >
    <div @dblclick.stop>
      <div v-if="isExpandedForm" class="h-[1px]">&nbsp;</div>
      <GeneralIcon v-else icon="arrowDown" class="text-grey h-full text-grey nc-ui-dt-dropdown cursor-pointer outline-0 mr-2" />
    </div>
    <template #overlay>
      <NcMenu
        class="flex flex-col gap-1 border-gray-200 nc-column-options"
        :class="{
          'min-w-[256px]': isExpandedForm,
        }"
      >
        <NcMenuItem @click="onEditPress">
          <div class="nc-column-edit nc-header-menu-item">
            <component :is="iconMap.ncEdit" class="text-gray-700" />
            <!-- Edit -->
            {{ $t('general.edit') }}
          </div>
        </NcMenuItem>
        <NcMenuItem v-if="isExpandedForm && !column?.pk" :disabled="!isDuplicateAllowed" @click="openDuplicateDlg">
          <div v-e="['a:field:duplicate']" class="nc-column-duplicate nc-header-menu-item">
            <component :is="iconMap.duplicate" class="text-gray-700" />
            <!-- Duplicate -->
            {{ t('general.duplicate') }}
          </div>
        </NcMenuItem>
        <a-divider hidden v-if="!column?.pv" class="!my-0" />
        <NcMenuItem hidden v-if="!column?.pv" @click="hideOrShowField">
          <div v-e="['a:field:hide']" class="nc-column-insert-before nc-header-menu-item">
            <component :is="isHiddenCol ? iconMap.eye : iconMap.eyeSlash" class="text-gray-700 !w-3.75 !h-3.75" />
            <!-- Hide Field -->
            {{ isHiddenCol ? $t('general.showField') : $t('general.hideField') }}
          </div>
        </NcMenuItem>
        <NcMenuItem
          v-if="(!virtual || column?.uidt === UITypes.Formula) && !column?.pv && !isHiddenCol"
          @click="setAsDisplayValue"
        >
          <div class="nc-column-set-primary nc-header-menu-item item">
            <GeneralIcon icon="star" class="text-gray-700 !w-4.25 !h-4.25" />

            <!--       todo : tooltip -->
            <!-- Set as Display value -->
            {{ $t('activity.setDisplay') }}
          </div>
        </NcMenuItem>
        <NcMenuItem @click="markSemanticsSearch">
          <div class="nc-column-set-primary nc-header-menu-item item items-center flex">
            <GeneralLoader v-if="isMarking" class="menu-icon mt-0.5 !text-red-500" />
            <icon
              v-else-if="!isMarking && [...semanticsSearchedFields, ...addsemanticsSearchedFields].includes(column?.column_name)"
              :style="{ marginTop: '-4px' }"
            >
              <template #component>
                <svg
                  t="1719371399128"
                  class="icon"
                  viewBox="0 0 1025 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="8226"
                  width="16"
                  height="16"
                >
                  <path
                    d="M512.824885 39.121c-12.944 0-23.188 3.834-30.594 11.67-7.543 7.669-13.38 17.057-17.354 27.728L347.367885 349.82 31.960885 378.135c-7.406 1.419-14.228 4.699-20.344 10.085-6.123 5.42-9.975 12.809-11.253 22.342-1.418 9.388 0.866 18.648 6.558 27.755 5.839 9.088 12.799 17.34 20.898 24.899l11.253 9.533 26.039 22.339c10.67 9.085 22.476 19.199 35.845 30.289l40.259 33.868c32.012 27.009 67.995 57.739 108.262 92.164l-34.706 141.708c-4.833 18.199-9.393 35.982-13.798 53.631-4.403 17.503-8.406 33.56-11.811 48.094-3.416 14.506-6.403 26.87-9.098 37.4l-5.124 19.781c-1.434 5.979-0.709 11.949 1.987 17.643 2.707 5.698 6.971 10.673 12.809 14.646 5.694 4.139 12.224 6.558 19.337 7.695 1.584 0.224 3.154 0.307 4.72 0.307 5.476 0 10.886-1.334 16.204-3.861 3.416-1.444 10.103-4.832 19.922-10.113 9.951-5.39 21.617-12.228 35.276-20.337 13.518-8.116 28.75-16.784 45.396-26.316 16.637-9.389 33.561-18.922 50.485-28.315 39.566-22.197 83.377-47.514 131.754-75.824l266.461 153.792 14.813 5.53c6.394 2.416 11.364 3.555 14.782 3.555 10.254 0 19.351-2.278 27.606-6.529 8.098-4.415 11.245-13.361 9.1-26.896-0.71-2.699-1.985-9.248-3.976-19.781l-7.695-37.814c-3.129-14.954-6.39-31.458-9.668-49.659-3.416-18.223-7.25-36.425-11.241-54.624-8.961-43.263-19.061-91.502-30.716-144.679l211.407-188.228c8.818-10.253 16.074-18.787 21.908-25.897 5.833-7.112 8.682-15.367 8.682-24.759 0-10.085-2.705-17.504-8.116-22.338-5.555-4.7-15.083-8.668-28.592-12.09l-315.546-29.312-114.261-271.3c-1.418-2.697-3.265-5.973-5.684-10.085-2.415-3.974-5.262-8.116-8.684-12.089-3.415-4.137-7.668-7.692-12.652-10.667C525.624885 40.678 519.649885 39.121 512.824885 39.121"
                    fill="#4A5268"
                    p-id="8227"
                  ></path>
                </svg>
              </template>
            </icon>
            <GeneralIcon v-else icon="star" class="text-gray-700 !w-4.25 !h-4.25" />
            {{
              [...semanticsSearchedFields, ...addsemanticsSearchedFields].includes(column?.column_name)
                ? '已标记为检索语义'
                : '标记为检索语义'
            }}
          </div>
        </NcMenuItem>

        <template v-if="!isExpandedForm">
          <a-divider v-if="!isLinksOrLTAR(column) || column.colOptions.type !== RelationTypes.BELONGS_TO" class="!my-0" />

          <template v-if="!isLinksOrLTAR(column) || column.colOptions.type !== RelationTypes.BELONGS_TO">
            <NcMenuItem @click="sortByColumn('asc')">
              <div v-e="['a:field:sort', { dir: 'asc' }]" class="nc-column-insert-after nc-header-menu-item">
                <component
                  :is="iconMap.sortDesc"
                  class="text-gray-700 !rotate-180 !w-4.25 !h-4.25"
                  :style="{
                    transform: 'rotate(180deg)',
                  }"
                />

                <!-- Sort Ascending -->
                {{ $t('general.sortAsc') }}
              </div>
            </NcMenuItem>
            <NcMenuItem @click="sortByColumn('desc')">
              <div v-e="['a:field:sort', { dir: 'desc' }]" class="nc-column-insert-before nc-header-menu-item">
                <!-- Sort Descending -->
                <component :is="iconMap.sortDesc" class="text-gray-700 !w-4.25 !h-4.25" />
                {{ $t('general.sortDesc').trim() }}
              </div>
            </NcMenuItem>
          </template>

          <a-divider hidden class="!my-0" />

          <NcTooltip :disabled="isFilterSupported && !isFilterLimitExceeded">
            <template #title>
              {{
                !isFilterSupported
                  ? "This field type doesn't support filtering"
                  : isFilterLimitExceeded
                  ? 'Filter by limit exceeded'
                  : ''
              }}
            </template>
            <NcMenuItem
              :disabled="!isFilterSupported || isFilterLimitExceeded"
              @click="filterOrGroupByThisField(SmartsheetStoreEvents.FILTER_ADD)"
            >
              <div v-e="['a:field:add:filter']" class="nc-column-filter nc-header-menu-item">
                <component :is="iconMap.filter" class="text-gray-700" />
                <!-- Filter by this field -->
                按此字段筛选
              </div>
            </NcMenuItem>
          </NcTooltip>

          <NcTooltip
            :disabled="(isGroupBySupported && !isGroupByLimitExceeded) || isGroupedByThisField || !(isEeUI && !isPublic)"
          >
            <template #title>{{
              !isGroupBySupported
                ? "This field type doesn't support grouping"
                : isGroupByLimitExceeded
                ? 'Group by limit exceeded'
                : ''
            }}</template>
            <NcMenuItem
              hidden
              :disabled="isEeUI && !isPublic && (!isGroupBySupported || isGroupByLimitExceeded) && !isGroupedByThisField"
              @click="
                filterOrGroupByThisField(
                  isGroupedByThisField ? SmartsheetStoreEvents.GROUP_BY_REMOVE : SmartsheetStoreEvents.GROUP_BY_ADD,
                )
              "
            >
              <div v-e="['a:field:add:groupby']" class="nc-column-groupby nc-header-menu-item">
                <component :is="iconMap.group" class="text-gray-700" />
                <!-- Group by this field -->
                {{ isGroupedByThisField ? "Don't group by this field" : 'Group by this field' }}
              </div>
            </NcMenuItem>
          </NcTooltip>

          <a-divider class="!my-0" />

          <NcMenuItem v-if="!column?.pk" :disabled="!isDuplicateAllowed" @click="openDuplicateDlg">
            <div v-e="['a:field:duplicate']" class="nc-column-duplicate nc-header-menu-item">
              <component :is="iconMap.duplicate" class="text-gray-700" />
              <!-- Duplicate -->
              {{ t('general.duplicate') }}
            </div>
          </NcMenuItem>
          <NcMenuItem @click="onInsertAfter">
            <div v-e="['a:field:insert:after']" class="nc-column-insert-after nc-header-menu-item">
              <component :is="iconMap.colInsertAfter" class="text-gray-700 !w-4.5 !h-4.5" />
              <!-- Insert After -->
              {{ t('general.insertAfter') }}
            </div>
          </NcMenuItem>
          <NcMenuItem v-if="!column?.pv" @click="onInsertBefore">
            <div v-e="['a:field:insert:before']" class="nc-column-insert-before nc-header-menu-item">
              <component :is="iconMap.colInsertBefore" class="text-gray-600 !w-4.5 !h-4.5" />
              <!-- Insert Before -->
              {{ t('general.insertBefore') }}
            </div>
          </NcMenuItem>
        </template>
        <a-divider v-if="!column?.pv" class="!my-0" />

        <NcMenuItem v-if="!column?.pv" :disabled="!isDeleteAllowed" class="!hover:bg-red-50" @click="handleDelete">
          <div class="nc-column-delete nc-header-menu-item text-red-600">
            <component :is="iconMap.delete" />
            <!-- Delete -->
            {{ $t('general.delete') }}
          </div>
        </NcMenuItem>
      </NcMenu>
    </template>
  </a-dropdown>
  <SmartsheetHeaderDeleteColumnModal v-model:visible="showDeleteColumnModal" />
  <DlgColumnDuplicate
    v-if="column"
    ref="duplicateDialogRef"
    v-model="isDuplicateDlgOpen"
    :column="column"
    :extra="selectedColumnExtra"
  />
</template>

<style scoped>
.nc-header-menu-item {
  @apply text-dropdown flex items-center gap-2;
}

.nc-column-options {
  .nc-icons {
    @apply !w-5 !h-5;
  }
}

:deep(.ant-dropdown-menu-item:not(.ant-dropdown-menu-item-disabled)) {
  @apply !hover:text-black text-gray-700;
}
:deep(.ant-dropdown-menu-item.ant-dropdown-menu-item-disabled .nc-icon) {
  @apply text-current;
}
.ant-spin-spinning {
  width: 16px;
}
</style>
