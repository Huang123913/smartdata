<script lang="ts" setup>
import { ref } from '#imports'

const props = defineProps<{
  item: any
  showAction: boolean
}>()

const { activeTableId } = storeToRefs(useTablesStore())
const router = useRouter()
const route = router.currentRoute
const { $api } = useNuxtApp()
const { loadProjectTables } = useTablesStore()
const store = useaiAnalyticsStore()
const { tableNameList, savedConversations } = storeToRefs(store)
const isShowLoading = ref(false)
const clicked = ref(false)
const isShowSelectCatalogModal = ref<boolean>(false) //是否显示选择目录弹框
const isPublishCatalog = ref<boolean>(true) //是否发布至模型目录
const targetField = ref<any[]>([]) //目标字段
const emits = defineEmits(['update:showAction'])
const showAction = useVModel(props, 'showAction', emits)
const belongSQLDataRefreshPlan = ref({})
const belongSQLDataType = ref<string>('RealTimeView') //模型数据更新方式-默认实时视图
const selectPublishMode = ref<object>({})

const columns = computed(() => {
  console.log('item', props.item)
  let result = props.item.tableRes.content.fields
  let fileds = result?.filter((item) => item.name !== 'id')
  let newFileds = fileds?.map((item) => {
    return {
      ...item,
      title: item.name_cn ?? item.name ?? item.code,
      dataIndex: item.name ?? item.code,
      name_en: item.name ?? item.code,
      width: '180px',
      value: item.name,
      label: item.name_cn ?? item.name ?? item.code,
    }
  })
  return newFileds
})
const setUpdateTimeValue = (value: string) => {
  belongSQLDataType.value = value
}
const handleSaveToCatalog = () => {
  isShowSelectCatalogModal.value = true
  isPublishCatalog.value = true
  clicked.value = false
  showAction.value = false
}

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
  showAction.value = visible
}

// 选择模型目录弹框取消事件
const handleCancel = () => {
  isShowSelectCatalogModal.value = false
}

// 选择模型目录弹框确定事件
const handleOk = async (selectedCatalog: object) => {
  try {
    isShowSelectCatalogModal.value = false
    isShowLoading.value = true
    let exeRes = null
    let datas = props.item.tableRes.content.datas
    let fields = props.item.tableRes.content.fields
    let findSql = props.item.detail.find((item) => item.type === 'sql')
    if (isPublishCatalog.value) {
      let params = {
        tableData: JSON.stringify({ fields, datas }),
        sql: findSql.content,
        question: '',
        modelName: tableNameList.value[props.item.id],
        belongCatalog: selectedCatalog.id,
        belongSQLDataRefreshPlan: belongSQLDataRefreshPlan.value,
        belongSQLDataType: belongSQLDataType.value,
        savedSession: JSON.stringify(savedConversations.value[activeTableId.value!]),
      }
      exeRes = await $api.smartData.publicModelToCatalog(params)
    } else {
      let params = {
        mapingData: selectedCatalog,
        tableData: JSON.stringify({ fields, datas }),
        existingModelId: selectPublishMode.value.id,
        belongSQLDataRefreshPlan: belongSQLDataRefreshPlan.value,
        belongSQLDataType: belongSQLDataType.value,
      }
      exeRes = await $api.smartData.publishModelToExistingModel(params)
    }
    exeRes && exeRes?.success && message.success('保存成功')
  } catch (e: any) {
    console.log(e)
  } finally {
    isPublishCatalog.value && (await loadProjectTables(route.value.params.baseId, true))
    isShowLoading.value = false
  }
}

const handleSelectTable = () => {
  clicked.value = false
  showAction.value = false
}
</script>
<template>
  <NcDropdown
    :class="{ show: clicked }"
    :trigger="['click']"
    :visible="clicked"
    @visibleChange="handleClickChange"
    :overlayClassName="'save-table-data-to-ai'"
  >
    <div
      @click="
            (e:any) => {
              e.stopPropagation()
              clicked = true
            }
          "
    >
      <GeneralBaseIcon :style="{ position: 'relative', top: '-3px' }">
        <svg
          t="1726212385811"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="13216"
          width="16"
          height="16"
        >
          <path
            d="M737.92 128L896 410.24V896H128V128h609.92m16.64-64H96a32 32 0 0 0-32 32v832a32 32 0 0 0 32 32h832a32 32 0 0 0 32-32V399.36a32 32 0 0 0-6.4-15.36l-173.44-306.56a32 32 0 0 0-25.6-13.44z"
            fill="#2C2C2C"
            p-id="13217"
          ></path>
          <path
            d="M696.32 128a8.32 8.32 0 0 1 8.32 8.32V320H256V128h440.32m0-64H224a32 32 0 0 0-32 32v256a32 32 0 0 0 32 32h512a32 32 0 0 0 32-32V136.32A72.32 72.32 0 0 0 696.32 64zM480 512A96 96 0 1 1 384 608 96 96 0 0 1 480 512m0-64A160 160 0 1 0 640 608 160 160 0 0 0 480 448z"
            fill="#2C2C2C"
            p-id="13218"
          ></path>
        </svg>
      </GeneralBaseIcon>
      {{ '保存至' }}
    </div>

    <template #overlay>
      <NcMenu>
        <NcMenuItem key="catalog" @click="handleSaveToCatalog">
          <div class="flex gap-2 items-center text-gray-700">
            {{ '新模型' }}
          </div>
        </NcMenuItem>
        <NcSubMenu key="existingModel">
          <template #title>
            <div class="flex gap-2 items-center text-gray-700">
              {{ '现有模型' }}
            </div>
          </template>
          <DashboardAiAnalyticsExistingModel
            :handleSelectTable="handleSelectTable"
            :item="item"
            v-model:isShowLoading="isShowLoading"
          />
        </NcSubMenu>
      </NcMenu>
    </template>
  </NcDropdown>

  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
  <!-- 模型目录/字段映射弹框 -->
  <SmartdataChatPlaygroundViewRightIndexTableListSelectCatalogModal
    :visible="isShowSelectCatalogModal"
    :handleCancel="handleCancel"
    :handleOk="handleOk"
    :setUpdateTimeValue="setUpdateTimeValue"
    :isCatalog="isPublishCatalog"
    :targetField="targetField"
    :sourceField="columns"
  />
</template>

<style lang="scss">
.save-table-data-to-ai {
  &:hover .dialog-list-item.action {
    opacity: 1 !important;
  }
  .ant-dropdown-menu-submenu-popup {
    width: 300px !important;
    min-width: 300px !important;
    max-width: 300px !important;
  }
  .ant-dropdown-content {
    min-width: 170px !important;
  }
}
</style>
