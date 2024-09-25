<script setup lang="ts">
import type { ColumnType } from 'nocodb-sdk'

const isLocked = inject(IsLockedInj, ref(false))

const activeView = inject(ActiveViewInj, ref())

const { isMobileMode } = useGlobal()

const filterComp = ref<typeof ColumnFilter>()

const { nestedFilters, eventBus } = useSmartsheetStoreOrThrow()

// todo: avoid duplicate api call by keeping a filter store
const { nonDeletedFilters, loadFilters } = useViewFilters(
  activeView!,
  undefined,
  computed(() => true),
  () => false,
  nestedFilters.value,
  true,
)

const filtersLength = ref(0)

watch(
  () => activeView?.value?.id,
  async (viewId) => {
    if (viewId) {
      await loadFilters({
        hookId: undefined,
        isWebhook: false,
        loadAllFilters: true,
      })
      filtersLength.value = nonDeletedFilters.value.length || 0
    }
  },
  { immediate: true },
)

const open = ref(false)

const allFilters = ref({})

provide(AllFiltersInj, allFilters)

useMenuCloseOnEsc(open)

const draftFilter = ref({})

eventBus.on(async (event, column: ColumnType) => {
  if (!column) return

  if (event === SmartsheetStoreEvents.FILTER_ADD) {
    draftFilter.value = { fk_column_id: column.id }
    open.value = true
  }
})

const { tableViewInfo } = storeToRefs(useViewsStore())
const parameters = ref<{ [key: string]: any }>({})
const reloadData = inject(ReloadViewDataHookInj)!
const { search } = useFieldQuery()
const handleSearch = () => {
  for (const key in parameters.value) {
    if (parameters.value.hasOwnProperty(key) && parameters.value[key] === '') {
      parameters.value[key] = null
    }
  }
  search.value.queryModelSearchParams = parameters.value
  search.value.isQueryModelSearch = true
  reloadData.trigger({ shouldShowLoading: false, offset: 0 })
}
</script>

<template>
  <NcDropdown
    v-model:visible="open"
    :trigger="['click']"
    overlay-class-name="nc-dropdown-filter-menu nc-toolbar-dropdown"
    class="!xs:hidden"
  >
    <NcButton
      v-e="['c:filter']"
      :disabled="isLocked"
      class="nc-filter-menu-btn nc-toolbar-btn !border-0 !h-7"
      size="small"
      type="secondary"
    >
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-2">
          <component :is="iconMap.filter" class="h-4 w-4" />
          <!-- Filter -->
          <span v-if="!isMobileMode" class="text-capitalize !text-[13px] font-medium">{{ $t('activity.filter') }}</span>
        </div>
        <span v-if="filtersLength" class="bg-brand-50 text-brand-500 py-1 px-2 text-md rounded-md">{{ filtersLength }}</span>
      </div>
    </NcButton>

    <template #overlay>
      <div>
        <div
          class="queryParams pl-5 pt-5 pr-5 pb-5 border-b border-gray-200"
          v-if="tableViewInfo?.queryModelParams && tableViewInfo?.queryModelParams.length"
        >
          <h3 class="query-params-text">查询参数</h3>
          <div class="parameters" v-for="parameterItem in tableViewInfo?.queryModelParams">
            <label>{{ parameterItem.name_cn ?? parameterItem.name }}：</label>
            <div class="value" if="parameterItem.type === 'char'">
              <a-input :placeholder="parameterItem?.description_cn" v-model:value="parameters[parameterItem.name]" />
            </div>
            <div v-if="parameterItem.type === 'number'">
              <a-input-number
                :placeholder="parameterItem?.description_cn"
                v-model:value="parameters[parameterItem.name]"
                :precision="0"
                :min="1"
                :max="10"
              />
            </div>
            <div class="value" v-if="parameterItem.type === 'boolean'">
              <a-switch v-model:checked="parameters[parameterItem.name]" />
            </div>
          </div>
          <div class="search-sql-btn" @click="handleSearch">
            <NcButton type="primary" size="small">
              {{ '查询' }}
            </NcButton>
          </div>
        </div>
        <SmartsheetToolbarColumnFilter
          ref="filterComp"
          v-model:draft-filter="draftFilter"
          class="nc-table-toolbar-menu"
          :auto-save="true"
          data-testid="nc-filter-menu"
          :is-open="open"
          @update:filters-length="filtersLength = $event"
        >
        </SmartsheetToolbarColumnFilter>
      </div>
    </template>
  </NcDropdown>
</template>

<style lang="scss">
.query-model-search {
  .ant-dropdown-content {
    width: 440px !important;
    padding: 10px 10px 20px;
  }
}
.query-params-text {
  font-weight: 600;
  font-size: 15px;
}
.search-sql-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
