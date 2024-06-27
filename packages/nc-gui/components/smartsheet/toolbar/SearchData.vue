<script lang="ts" setup>
import type { ColumnType, TableType } from 'nocodb-sdk'
import { UITypes, isSystemColumn } from 'nocodb-sdk'

const reloadData = inject(ReloadViewDataHookInj)!

const { meta } = useSmartsheetStoreOrThrow()

const activeView = inject(ActiveViewInj, ref())

const { search, loadFieldQuery } = useFieldQuery()

const isDropdownOpen = ref(false)

const showSearchBox = ref(false)

const globalSearchRef = ref<HTMLInputElement>()

const globalSearchWrapperRef = ref<HTMLInputElement>()

const { isMobileMode } = useGlobal()

const allSemanticRetrieval = ref<any[]>([])

const selectedOption = ref({})

const columns = computed(() => {
  let data =
    (meta.value as TableType)?.columns?.filter((column) => !isSystemColumn(column) && column?.uidt !== UITypes.Links) ?? []
  return [...allSemanticRetrieval.value, ...data]
})

const { $api } = useNuxtApp()

const getAllSemanticsSearchedFields = async () => {
  try {
    let tableInfo = await $api.smartData.entity({
      entityId: activeView.value?.id,
    })
    let props = tableInfo[0]?.props ? tableInfo[0]?.props : []
    if (props.length) {
      let findSemanticFetrievalProp = props.findLast((p) => p.code == 'belongSemanticFetrieval')
      if (findSemanticFetrievalProp) {
        let allField: string[] = []
        allSemanticRetrieval.value = JSON.parse(findSemanticFetrievalProp.jsonValue).map((item) => {
          allField.push(...item.columnName.split(';'))
          return { ...item, value: item.columnName, isSemanticRetrieval: true }
        })
        allField = Array.from(new Set(allField))
        if (allSemanticRetrieval.value.length) {
          allSemanticRetrieval.value.unshift({
            title: '全局检索',
            value: allField.join(';'),
            columnName: allField.join(';'),
            isSemanticRetrieval: true,
            id: '全局检索',
          })
          selectedOption.value = allSemanticRetrieval.value[0]
          search.value.field = '全局检索'
        }
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    console.log('test', allSemanticRetrieval.value)
  }
}
watch(
  () => activeView.value?.id,
  (n, o) => {
    if (n !== o) {
      getAllSemanticsSearchedFields()
      loadFieldQuery(activeView.value?.id)
    }
  },
  { immediate: true },
)

function onPressEnter() {
  if (selectedOption.value?.isSemanticRetrieval) {
    //TODO 语义检索
    // let tableId = activeView.value.id
    // console.log('activeView', activeView.value)
    // console.log('activeView', selectedOption.value.columnName)
    // console.log('search.value.query', search.value.query)
  } else {
    reloadData.trigger({ shouldShowLoading: false, offset: 0 })
  }
}

const displayColumnLabel = computed(() => {
  if (search.value.field) {
    // use search field label if specified
    return columns.value?.find((column) => column.id === search.value.field)?.title
  }

  // use primary value label by default
  const pvColumn = columns.value?.find((column) => column.pv)
  search.value.field = allSemanticRetrieval.value.length ? allSemanticRetrieval.value[0].id : (pvColumn?.id as string)
  return allSemanticRetrieval.value.length ? '全局检索' : pvColumn?.title
})

watchDebounced(
  () => search.value.query,
  () => {
    if (!selectedOption.value?.isSemanticRetrieval) onPressEnter()
  },
  {
    debounce: 500,
    maxWait: 600,
  },
)

const onSelectOption = (column: ColumnType) => {
  search.value.field = column.id as string
  isDropdownOpen.value = false
  selectedOption.value = column
}

const handleShowSearchInput = () => {
  showSearchBox.value = true

  nextTick(() => {
    globalSearchRef.value?.focus()
  })
}

onClickOutside(globalSearchWrapperRef, (e) => {
  const targetEl = e.target as HTMLElement
  if (search.value.query || targetEl.closest('.nc-dropdown-toolbar-search-field-option')) {
    return
  }

  showSearchBox.value = false
})
</script>

<template>
  <div ref="globalSearchWrapperRef" class="nc-global-search-wrapper">
    <a-button
      v-if="!search.query && !showSearchBox"
      class="nc-toolbar-btn"
      data-testid="nc-global-search-show-input"
      @click="handleShowSearchInput"
    >
      <GeneralIcon icon="search" class="h-4 w-4 text-gray-700 group-hover:text-black" />
    </a-button>
    <div
      v-else
      class="flex flex-row border-1 rounded-lg h-7 xs:(h-10 ml-0) ml-1 border-gray-200 overflow-hidden focus-within:border-primary"
      :class="{ 'border-primary': search.query.length !== 0 }"
    >
      <NcDropdown
        v-model:visible="isDropdownOpen"
        :trigger="['click']"
        overlay-class-name="nc-dropdown-toolbar-search-field-option"
      >
        <div
          class="flex items-center group px-2 cursor-pointer border-r-1 border-gray-200 hover:bg-gray-100"
          :class="{ 'bg-gray-50 ': isDropdownOpen }"
          @click="isDropdownOpen = !isDropdownOpen"
        >
          <GeneralIcon icon="search" class="ml-1 mr-2 h-3.5 w-3.5 text-gray-500 group-hover:text-black" />
          <div v-if="!isMobileMode" class="w-16 text-xs font-medium text-gray-400 truncate">
            {{ displayColumnLabel }}
          </div>
          <div class="xs:(text-gray-600) group-hover:text-gray-700 sm:(text-gray-400)">
            <component :is="iconMap.arrowDown" class="text-sm text-inherit" />
          </div>
        </div>
        <template #overlay>
          <SmartsheetToolbarFieldListWithSearch
            :is-parent-open="isDropdownOpen"
            :selected-option-id="search.field"
            show-selected-option
            :options="columns"
            toolbar-menu="globalSearch"
            @selected="onSelectOption"
          />
        </template>
      </NcDropdown>

      <form class="p-0">
        <a-input
          v-if="search.query || showSearchBox"
          v-model:value="search.query"
          size="small"
          class="text-xs w-40 h-full"
          :placeholder="`${selectedOption?.isSemanticRetrieval ? '检索范围' : $t('general.searchIn')} ${displayColumnLabel}`"
          :bordered="false"
          data-testid="search-data-input"
          @keyup.enter="onPressEnter"
        >
        </a-input>
      </form>
    </div>
  </div>
</template>

<style scoped>
:deep(input::placeholder) {
  @apply !text-gray-400;
  line-height: 0.8rem !important;
  font-size: 0.8rem !important;
}
</style>
