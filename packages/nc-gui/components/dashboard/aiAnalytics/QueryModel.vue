<script lang="ts" setup>
import 'dayjs/locale/zh-cn'

import { v4 as uuidv4 } from 'uuid'

import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  visible: boolean
  item: any
}>()
const { loadProjectTables } = useTablesStore()
const { user } = useGlobal()
const tableName = ref('')
const emits = defineEmits(['update:visible'])
const visible = useVModel(props, 'visible', emits)
const parameters = ref<{ [key: string]: any }>({})
const isShowSelectCatalogModel = ref(false)
const { $api } = useNuxtApp()
const description = ref('')
const { base } = storeToRefs(useBase())
const fieldTypeMap: { [key: string]: string } = {
  VARCHAR: 'char',
  INT: 'number',
}
const isShowLoading = ref(false)
// watch(
//   () => props.item,
//   (newVal, oldVal) => {
//     if (props.item?.parameters.length) {
//       props.item.parameters.map((item: any) => {
//         if (item.type === 'VARCHAR') {
//           parameters.value[item.name as string] = ''
//         } else if (item.type === 'INT') {
//           parameters.value[item.name as string] = 0
//         } else if (item.type === 'BOOLEAN') {
//           parameters.value[item.name as string] = false
//         }
//       })
//     }
//   },
//   {
//     immediate: true,
//   },
// )
const handleOk = (value: any) => {
  if (value == 'next') {
    if (!tableName.value.trim()) {
      message.warn('模型名称不能为空')
      return
    }
    visible.value = false
    isShowSelectCatalogModel.value = true
  }
  console.log('base.value', base.value)
}

const handleShowSelectCatalog = (value: boolean) => {
  isShowSelectCatalogModel.value = value
}

const handleSelectCatalogModalOk = async (selectedCatalogParam: any) => {
  if (!selectedCatalogParam) {
    message.warn('请选择目录!')
    return
  }
  handleShowSelectCatalog(false)
  isShowLoading.value = true
  try {
    console.log('selectedCatalogParam', selectedCatalogParam)
    console.log('props', props.item)
    console.log('parameters', parameters.value)

    let findDataMeta = props.item.detail.find((item: any) => item.type === 'data_meta')
    let fields = findDataMeta.tableData.map((item: any) => {
      return {
        fieldName: item.name,
        fieldName_cn: item.chinese_name ?? item.name,
        fieldCode: uuidv4(),
        description: '',
        description_cn: item.description,
        // scale: 0, //  小数位的精度
        // fieldPrecision: 255, //  字段的长度
        fieldSysDataType: fieldTypeMap[item.type], // 字段类型：char文本/text长文本/number数值/boolean布尔/date日期/longDate长日期/integer整形/file文件
      }
    })
    let queryParams = []
    if (props.item?.parameters && props.item.parameters.length) {
      queryParams = props.item.parameters.map((item: any) => {
        let returnObj = {
          name: item.name,
          name_cn: item.chinese_name ?? item.name,
          type: fieldTypeMap[item.type], // 字段类型：char文本/text长文本/number数值/boolean布尔/date日期/longDate长日期/integer整形/file文件
          description: '',
          description_cn: item.description,
        }
        if (parameters.value[item.name]) returnObj.initvalue = parameters.value[item.name] // 查询参数默认值
        return returnObj
      })
    }

    let queryModelParams = {
      name_cn: tableName.value,
      description: '',
      description_cn: description.value,
      belongCatalog: selectedCatalogParam.id,
      customGroupId: '', //所属团体id，一般为企业ID
      customGroupName: '', //所属团队名称，一般为企业名字
      projectCode: base.value.id, //所属项目，一般为项目唯一标识
      projectName: base.value.title, //所属项目名称，一般为项目名称
      sql: props.item.sql,
      fields,
      queryParams,
      customOwnerId: user.value?.id,
      customOwnerName: user.value?.display_name ?? user.value?.email,
    }
    console.log('queryModelParams', queryModelParams)
    let res = await $api.smartData.createQueryModel(queryModelParams)
    if (res.success && res.data.success) {
      message.success('创建成功！')
    } else {
      message.error(res.data?.errorDetail)
    }
  } catch (error) {
    console.log(error)
  } finally {
    await loadProjectTables(base.value.id!, true)
    isShowLoading.value = false
    tableName.value = ''
    description.value = ''
  }
}
</script>

<template>
  <a-modal
    :closable="false"
    class="create-query-model"
    cancelText="取消"
    okText="下一步"
    v-model:visible="visible"
    @ok="handleOk('next')"
    :zIndex="999"
  >
    <template #title>
      <div class="set-update-time-modal-header">
        <span class="text-lg font-medium">{{ '创建查询模型' }}</span>
        <close-outlined class="colse-btn" @click="handleOk(false)" />
      </div>
    </template>
    <a-form layout="vertical">
      <a-form-item label="名称：">
        <a-input v-model:value="tableName" />
      </a-form-item>
      <a-form-item label="描述：">
        <a-input v-model:value="description" />
      </a-form-item>
      <a-form-item v-if="item.parameters.length">
        <h4>参数默认值</h4>
        <div class="parameters" v-for="parameterItem in item.parameters">
          <label>{{ parameterItem.name }}：</label>
          <div class="value" if="parameterItem.type === 'VARCHAR'">
            <a-input v-model:value="parameters[parameterItem.name]" />
          </div>
          <div v-if="parameterItem.type === 'INT'">
            <a-input-number v-model:value="parameters[parameterItem.name]" :precision="0" :min="1" :max="10" />
          </div>
          <div class="value" v-if="parameterItem.type === 'BOOLEAN'">
            <a-switch v-model:checked="parameters[parameterItem.name]" />
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
  <DlgSelectCatalog
    :visible="isShowSelectCatalogModel"
    :handleShowSelectCatalog="handleShowSelectCatalog"
    :handleModalOk="handleSelectCatalogModalOk"
    :modelTitle="'选择目录'"
  ></DlgSelectCatalog>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.create-query-model {
  .ant-modal-content {
    padding: 16px 16px 0 16px !important;
    .ant-modal-header {
      padding: 8px 0 16px 0 !important;
      .ant-modal-title {
        font-size: 1.125rem;
        font-weight: 550;
      }
      .set-update-time-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .colse-btn {
          position: relative;
          top: 0px;
          color: rgb(99, 107, 116);
        }
      }
    }
    .ant-modal-body {
      min-height: 200px;
      padding: 16px 0px 16px 8px !important;
      .ant-form-vertical {
        height: 290px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 8px;
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 10px;
        }
        &::-webkit-scrollbar-thumb:hover {
          background-color: rgb(168, 168, 168);
          border-radius: 10px;
        }
      }
      .ant-picker {
        width: 100%;
      }
      .range-days-of-month {
        display: flex;
        align-items: center;
        margin-top: 10px;
        .ant-input-number {
          flex: 1;
          .ant-input-number-handler-wrap {
            display: none;
          }
          .ant-input-number-input {
            text-align: right;
          }
        }
      }
      .ant-form-item {
        margin: 0 0 13px;
      }
    }
    .ant-modal-footer {
      padding: 16px;
      .ant-btn {
        border-radius: 0.5rem;
        color: rgb(55, 65, 81);
        font-weight: 550;
        &:hover {
          background-color: rgba(244, 244, 245);
          border-color: rgba(231, 231, 233);
        }
      }
      .ant-btn-primary {
        color: white;
        border: none;
        &:hover {
          background-color: rgba(41, 82, 204);
        }
      }
    }
  }
  .ant-modal-close {
    top: 32px !important;
    right: 15px;
  }
  .parameters {
    // display: flex;
  }
  // label {
  //   height: 31px;
  //   width: 100px;
  //   line-height: 31px;
  //   text-align: right;
  //   margin-right: 10px;
  //   white-space: nowrap;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }
  // .value {
  //   flex: 1;
  // }
  h4 {
    font-weight: 600;
    font-size: 16px;
  }
}
</style>
