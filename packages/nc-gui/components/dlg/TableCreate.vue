<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  sourceId: string
  baseId: string
  catalog?: any
}>()
const labelCol = { style: { width: '56px', position: 'relative', top: '3px' } }
const emit = defineEmits(['update:modelValue', 'create'])

const dialogShow = useVModel(props, 'modelValue', emit)

const isAdvanceOptVisible = ref(false)

const inputEl = ref<HTMLInputElement>()

const { addTab } = useTabs()

const { isMysql, isMssql, isPg, isSnowflake } = useBase()

const { loadProjectTables, addTable } = useTablesStore()

const { refreshCommandPalette } = useCommandPalette()

const { table, createTable, generateUniqueTitle, tables, base } = useTableNew({
  async onTableCreate(table) {
    // await loadProject(props.baseId)

    await addTab({
      id: table.id as string,
      title: table.title,
      type: TabType.TABLE,
      baseId: props.baseId,
      // sourceId: props.sourceId,
    })

    addTable(props.baseId, table)
    await loadProjectTables(props.baseId, true)

    emit('create', table)
    dialogShow.value = false
  },
  sourceId: props.sourceId,
  baseId: props.baseId,
})

const useForm = Form.useForm

const validators = computed(() => {
  return {
    title: [
      validateTableName,
      {
        validator: (_: any, value: any) => {
          // validate duplicate alias
          return new Promise((resolve, reject) => {
            if ((tables.value || []).some((t) => t.title === (value || '') && t.source_id === props.sourceId)) {
              return reject(new Error('Duplicate table alias'))
            }
            return resolve(true)
          })
        },
      },
      {
        validator: (rule: any, value: any) => {
          return new Promise<void>((resolve, reject) => {
            let tableNameLengthLimit = 255
            if (isMysql(props.sourceId)) {
              tableNameLengthLimit = 64
            } else if (isPg(props.sourceId)) {
              tableNameLengthLimit = 63
            } else if (isMssql(props.sourceId)) {
              tableNameLengthLimit = 128
            }
            const basePrefix = base?.value?.prefix || ''
            if ((basePrefix + value).length > tableNameLengthLimit) {
              return reject(new Error(`Table name exceeds ${tableNameLengthLimit} characters`))
            }
            resolve()
          })
        },
      },
    ],
    table_name: [validateTableName],
  }
})
const { validate, validateInfos } = useForm(table, validators)

const systemColumnsCheckboxInfo = SYSTEM_COLUMNS.map((c, index) => ({
  value: c,
  disabled: index === 0,
}))

const creating = ref(false)

const isShowSelectCatalogModel = ref<boolean>(false)

const selectedCatalog = ref<any>(null)

const _createTable = async () => {
  if (creating.value) return
  try {
    creating.value = true
    await validate()
    let catalogId = selectedCatalog.value ? selectedCatalog.value.id : null
    await createTable(catalogId)
    dialogShow.value = false
  } catch (e: any) {
    console.error(e)
    e.errorFields.map((f: Record<string, any>) => message.error(f.errors.join(',')))
    if (e.errorFields.length) return
  } finally {
    setTimeout(() => {
      creating.value = false
    }, 500)
    refreshCommandPalette()
  }
}

const handleShowSelectCatalog = (value: boolean) => {
  isShowSelectCatalogModel.value = value
}

const handleSelectCatalogModalOk = (selectedCatalogParam: any) => {
  selectedCatalog.value = selectedCatalogParam
  handleShowSelectCatalog(false)
}

onMounted(() => {
  if (props.catalog) selectedCatalog.value = props.catalog
  generateUniqueTitle()
  nextTick(() => {
    inputEl.value?.focus()
    inputEl.value?.select()
  })
})
</script>

<template>
  <NcModal
    v-model:visible="dialogShow"
    :show-separator="false"
    :header="$t('activity.createTable')"
    size="small"
    @keydown.esc="dialogShow = false"
  >
    <template #header>
      <div class="flex flex-row items-center gap-x-2">
        <GeneralIcon icon="table" class="!text-gray-600/75" />
        {{ $t('activity.createTable') }}
      </div>
    </template>
    <div class="flex flex-col mt-2">
      <a-form
        :label-col="labelCol"
        :model="table"
        name="create-new-table-form"
        @keydown.enter="_createTable"
        @keydown.esc="dialogShow = false"
      >
        <a-form-item label="表名" v-bind="validateInfos.title" class="flex" :class="{ '!mb-1': isSnowflake(props.sourceId) }">
          <a-input
            ref="inputEl"
            v-model:value="table.title"
            class="nc-input-md table-name"
            hide-details
            data-testid="create-table-title-input"
            :placeholder="$t('msg.info.enterTableName')"
          >
            <template #suffix v-if="!catalog">
              <a-button @click="handleShowSelectCatalog(true)" type="text">选择目录</a-button>
            </template>
          </a-input>
          <div v-if="selectedCatalog && !catalog" class="selected-catalog-tip text-gray-400">
            已选目录:{{ selectedCatalog.name_cn }}
          </div>
        </a-form-item>

        <a-form-item label="表描述" class="flex" :class="{ '!mb-1': isSnowflake(props.sourceId) }">
          <a-input
            v-model:value="table.description_cn"
            class="nc-input-md table-name"
            hide-details
            data-testid="create-table-description-input"
            :placeholder="$t('msg.info.enterTableDescription')"
          >
          </a-input>
        </a-form-item>

        <template v-if="isSnowflake(props.sourceId)">
          <a-checkbox v-model:checked="table.is_hybrid" class="!flex flex-row items-center"> Hybrid Table </a-checkbox>
        </template>
        <div class="nc-table-advanced-options" :class="{ active: isAdvanceOptVisible }">
          <div>
            <div class="mb-1">
              <!-- Add Default Columns -->
              {{ $t('msg.info.defaultColumns') }}
            </div>

            <a-row>
              <a-checkbox-group
                v-model:value="table.columns"
                :options="systemColumnsCheckboxInfo"
                class="!flex flex-row justify-between w-full"
              >
                <template #label="{ value }">
                  <a-tooltip v-if="value === 'id'" placement="top" class="!flex">
                    <template #title>
                      <span>{{ $t('msg.idColumnRequired') }}</span>
                    </template>
                    {{ $t('datatype.ID') }}
                  </a-tooltip>
                  <div v-else class="flex">
                    {{ value }}
                  </div>
                </template>
              </a-checkbox-group>
            </a-row>
          </div>
        </div>
        <div class="flex flex-row justify-end gap-x-2">
          <NcButton type="secondary" size="small" @click="dialogShow = false">{{ $t('general.cancel') }}</NcButton>

          <NcButton
            v-e="['a:table:create']"
            type="primary"
            size="small"
            :disabled="validateInfos.title.validateStatus === 'error'"
            :loading="creating"
            @click="_createTable"
          >
            {{ $t('activity.createTable') }}
            <template #loading> {{ $t('title.creatingTable') }} </template>
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
.nc-table-advanced-options {
  max-height: 0;
  transition: 0.3s max-height;
  overflow: hidden;

  &.active {
    max-height: 100px;
  }
}
.table-name {
  .ant-btn {
    background: rgba(0, 0, 0, 0.018);
    padding: 4px 6px;
    margin-right: -3px;
  }
}
.selected-catalog-tip {
  margin-top: 2px;
  font-size: 12px;
  font-family: Manrope, 'Inter', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}
</style>
