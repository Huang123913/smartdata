<script setup lang="ts">
const { isMobileMode } = useGlobal()

const { activeView } = storeToRefs(useViewsStore())

const { base, isSharedBase } = storeToRefs(useBase())
const { baseUrl } = useBase()

const { activeTable } = storeToRefs(useTablesStore())
const { tableUrl } = useTablesStore()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())
const intelligentImportPreviewVisible = ref(false)
const columns = ref([])
const tableData = ref([])
const { $api } = useNuxtApp()
const reloadDataHook = inject(ReloadViewDataHookInj)
const fields = inject(FieldsInj, ref([]))
const { filters, loadFilters } = useViewFilters(activeView, null)
const { sorts } = useViewSorts(activeView.value, () => reloadDataHook?.trigger())

const openedBaseUrl = computed(() => {
  if (!base.value) return ''

  return `${window.location.origin}/#${baseUrl({
    id: base.value.id!,
    type: 'database',
    isSharedBase: isSharedBase.value,
  })}`
})

const activeTableParentCatalog = computed(() => {
  if (activeTable.value) {
    let findParentCatalog = chataiData.value.modelData.find((item) => item.id === activeTable.value.parentId)
    return findParentCatalog.name_cn
  } else {
    return ''
  }
})
const allTableMode = computed(() => {
  let data = chataiData.value.modelData.filter((item) => !item.isCatalog && item.id).map((item) => ({ ...item, fields: [] }))
  return data
})
const intelligentImport = async () => {
  try {
    await loadFilters('')
    let tableHeaderColumns: any[] = fields.value.map((item) => ({
      header: item.column_name,
      meaning: item.description,
      chinese: item.title,
    }))
    let filtersData: any[] = []
    filters.value.map((item) => {
      let findColumn = fields.value.find((column) => column.fk_column_id === item.fk_column_id)
      findColumn && filtersData.push({ field: findColumn.column_name, operator: item.comparison_op, value: item.value })
    })
    let sort_order: any[] = []
    sorts.value.map((item) => {
      let findColumn = fields.value.find((column) => column.fk_column_id === item.fk_column_id)
      findColumn && sort_order.push({ field: findColumn.column_name, direction: item.direction.toUpperCase() })
    })
    let table_meta = [
      { table_name: activeTable.value.name, meaning: activeTable.value.description_cn, chinese: activeTable.value.name_cn },
    ]
    let tableHeader = JSON.stringify({
      table_headers: tableHeaderColumns,
      filters: filtersData,
      sort_order,
      pagination: {},
      table_meta,
    })
    let result = await $api.smartData.intelligentImport({ tableHeader, allTableMode: JSON.stringify(allTableMode.value) })
    if (result?.success && result?.data.success) {
      console.log('result', result)
      let fields = result?.data?.fields ?? []
      let datas = result?.data?.datas ?? []
      if (fields.length) {
        setIntelligentImportPreview(true)
        columns.value = fields
        tableData.value = datas
      }
    } else {
      console.error(result)
    }
  } catch (error) {
    console.error(error)
  }
}

const setIntelligentImportPreview = (value: boolean) => {
  intelligentImportPreviewVisible.value = value
}
</script>

<template>
  <div
    class="ml-0.25 flex flex-row font-medium items-center border-gray-50 transition-all duration-100"
    :class="{
      'min-w-36/100 max-w-36/100': !isMobileMode && isLeftSidebarOpen,
      'min-w-39/100 max-w-39/100': !isMobileMode && !isLeftSidebarOpen,
      'w-2/3 text-base ml-1.5': isMobileMode,
      '!max-w-3/4': isSharedBase && !isMobileMode,
    }"
  >
    <template v-if="!isMobileMode">
      <NuxtLink
        class="!hover:(text-black underline-gray-600) !underline-transparent ml-0.75 max-w-1/4"
        :class="{
          '!max-w-none': isSharedBase && !isMobileMode,
          '!text-gray-500': activeTable,
          '!text-gray-700': !activeTable,
        }"
        :to="openedBaseUrl"
      >
        <NcTooltip class="!text-inherit">
          <template #title>
            <span class="capitalize">
              {{ base?.title }}
            </span>
          </template>
          <div class="flex flex-row items-center gap-x-1.5">
            <GeneralProjectIcon
              :type="base?.type"
              class="!grayscale min-w-4"
              :style="{
                filter: 'grayscale(100%) brightness(115%)',
              }"
            />
            <div
              class="!2xl:(flex truncate ml-1)"
              :class="{
                '!flex': isSharedBase && !isMobileMode,
              }"
            >
              <span class="truncate !text-inherit capitalize">
                {{ base?.title }}
              </span>
            </div>
          </div>
        </NcTooltip>
      </NuxtLink>
      <div class="px-1.75 text-gray-500">></div>
    </template>

    <!-- 父级目录 -->
    <template v-if="activeTableParentCatalog">
      <NcTooltip class="truncate nc-active-table-title max-w-full" show-on-truncate-only>
        <template #title>
          {{ activeTableParentCatalog }}
        </template>
        <span
          class="text-ellipsis overflow-hidden text-gray-500 xs:ml-2"
          :class="{
            'text-gray-500': !isMobileMode,
            'text-gray-800 font-medium': isMobileMode || activeView?.is_default,
          }"
          :style="{
            wordBreak: 'keep-all',
            whiteSpace: 'nowrap',
            display: 'inline',
          }"
        >
          <template v-if="activeView?.is_default">
            {{ activeTableParentCatalog }}
          </template>
        </span>
      </NcTooltip>
      <div class="px-1.75 text-gray-500">/</div>
    </template>

    <template v-if="!(isMobileMode && !activeView?.is_default)">
      <LazyGeneralEmojiPicker v-if="isMobileMode" :emoji="activeTable?.meta?.icon" readonly size="xsmall">
        <template #default>
          <MdiTable
            class="min-w-5"
            :class="{
              '!text-gray-500': !isMobileMode,
              '!text-gray-700': isMobileMode,
            }"
          />
        </template>
      </LazyGeneralEmojiPicker>
      <div
        v-if="activeTable"
        :class="{
          'max-w-1/2': isMobileMode || activeView?.is_default,
          'max-w-20/100': !isSharedBase && !isMobileMode && !activeView?.is_default,
          'max-w-none': isSharedBase && !isMobileMode,
        }"
      >
        <NcTooltip class="truncate nc-active-table-title max-w-full" show-on-truncate-only>
          <template #title>
            {{ activeTable?.title }}
          </template>
          <span
            class="text-ellipsis overflow-hidden text-gray-500 xs:ml-2"
            :class="{
              'text-gray-500': !isMobileMode,
              'text-gray-800 font-medium': isMobileMode || activeView?.is_default,
            }"
            :style="{
              wordBreak: 'keep-all',
              whiteSpace: 'nowrap',
              display: 'inline',
            }"
          >
            <template v-if="activeView?.is_default">
              {{ activeTable?.title }}
            </template>
            <NuxtLink
              v-else
              class="!text-inherit !underline-transparent !hover:(text-black underline-gray-600)"
              :to="tableUrl({ table: activeTable, completeUrl: true, isSharedBase })"
            >
              {{ activeTable?.title }}
            </NuxtLink>
          </span>
        </NcTooltip>
      </div>
    </template>

    <div v-if="!isMobileMode" class="pl-1.25 text-gray-500">></div>

    <template v-if="!(isMobileMode && activeView?.is_default)">
      <LazyGeneralEmojiPicker v-if="isMobileMode" :emoji="activeView?.meta?.icon" readonly size="xsmall">
        <template #default>
          <GeneralViewIcon :meta="{ type: activeView?.type }" class="min-w-4.5 text-lg flex" />
        </template>
      </LazyGeneralEmojiPicker>

      <SmartsheetToolbarOpenedViewAction :intelligentImport="intelligentImport" />
    </template>
  </div>
  <SmartsheetToolbarIntelligentImportPreview
    :closePreview="setIntelligentImportPreview"
    :visible="intelligentImportPreviewVisible"
    :propsColumns="columns"
    :propsTableData="tableData"
    :activeTable="activeTable"
  />
</template>
