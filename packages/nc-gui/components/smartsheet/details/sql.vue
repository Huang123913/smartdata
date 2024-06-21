<script setup lang="ts">
const props = defineProps<{
  sqlValue: string
}>()
const { $api } = useNuxtApp()
const { t } = useI18n()
const { copy } = useCopy()
const isShowLoading = ref(false)
const route = useRoute()
const visible = ref(false)
const columns = ref([])
const tableData = ref([])
const { activeTable } = storeToRefs(useTablesStore())
const exeSql = async () => {
  try {
    isShowLoading.value = true
    let result = await $api.smartData.exeSql({ sql: props.sqlValue })
    if (result?.success && result?.data.success) {
      let fields = result?.data?.fields ?? []
      let datas = result?.data?.datas ?? []
      if (fields.length) {
        visible.value = true
        columns.value = fields
        tableData.value = datas
      }
    } else {
      console.error(result)
    }
  } catch (error) {
  } finally {
    isShowLoading.value = false
  }
}
const onCopyToClipboard = async () => {
  try {
    await copy(props.sqlValue)
    message.info(t('msg.info.copiedToClipboard'))
  } catch (e: any) {
    message.error(e.message)
  }
}

const handleClose = (value: boolean) => {
  visible.value = value
}
</script>

<template>
  <div class="sql-tab p-8 w-full">
    <div v-if="sqlValue" class="sql-tab-main h-full w-full">
      <div class="btn-all">
        <NcButton class="copy-btn" type="secondary" size="small" @click="onCopyToClipboard">
          <div class="flex items-center">
            <GeneralIcon icon="copy" class="mr-1" />
            {{ $t('general.copy') }}
          </div>
        </NcButton>
        <NcButton class="exe-btn" type="primary" size="middle" @click="exeSql">
          {{ '执行' }}
        </NcButton>
      </div>
      <div class="sql w-full">
        <MonacoEditor
          class="border-1 border-gray-200 py-4 rounded-lg"
          style="height: calc(100vh - (var(--topbar-height) * 2) - 8rem)"
          :model-value="sqlValue"
          :read-only="true"
          lang="sql"
          :validate="false"
          :disable-deep-compare="true"
          hide-minimap
        />
      </div>
    </div>
    <div class="sql-tab-main no-dta">暂无数据</div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
  <template v-if="visible">
    <SmartsheetToolbarIntelligentImportPreview
      :closePreview="handleClose"
      :visible="visible"
      :propsColumns="columns"
      :propsTableData="tableData"
      :activeTable="activeTable"
      :isDetailImport="true"
    />
  </template>
</template>

<style lang="scss">
.sql-tab {
  .sql-tab-main {
    .btn-all {
      display: flex;
      .copy-btn {
        margin-right: 16px;
      }
    }
    .sql {
      margin: 16px 0;
    }
  }

  .no-dta {
    padding-top: 50px;
    display: flex;
    justify-content: center;
    color: rgba(0, 0, 0, 0.25);
  }
}
</style>
