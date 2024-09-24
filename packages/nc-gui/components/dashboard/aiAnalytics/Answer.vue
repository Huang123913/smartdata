<script lang="ts" setup>
import { Empty } from 'ant-design-vue'
import { marked } from 'marked'

import { CaretRightOutlined, EditOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const props = defineProps<{
  item: any
  contentWidth?: number
  runManualSql: (item: any) => void
}>()
const store = useaiAnalyticsStore()
const { tableNameList } = storeToRefs(store)
const { setTableNameList } = store
const parameters = ref<{ [key: string]: any }>({})

const { copy } = useCopy()

const typeMap: any = {
  error: '错误',
  thought: '分析',
  data_meta: '数据元信息',
  information_gathering: '信息收集',
  table_and_field_description: '表名和字段描述',
  sql: 'sql',
  exe_result: '查询结果',
}
const activeKey = ref(['0'])
const tableName = ref<string>('Table')
const customStyle = 'background: #fff;border: 0;overflow: hidden'
const isEdited = ref<boolean>(false)
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
onMounted(() => {
  tableName.value = tableNameList[props.item.id] || 'Table'
})
const handleEdit = (value: boolean) => {
  if (!tableName.value.trim()) tableName.value = 'Table'
  isEdited.value = value
  setTableNameList(props.item.id, tableName)
}

watch(
  () => props.item,
  (newVal, oldVal) => {
    if (props.item.parametersObj) {
      parameters.value = props.item.parametersObj
    } else {
      if (props.item.parameters.length) {
        props.item.parameters.map((item: any) => {
          if (item.type === 'VARCHAR') {
            parameters.value[item.name as string] = ''
          } else if (item.type === 'INT') {
            parameters.value[item.name as string] = 0
          } else if (item.type === 'BOOLEAN') {
            parameters.value[item.name as string] = false
          }
        })
      }
    }
  },
)

const handleSearch = () => {
  let isChecked = true
  for (let index = 0; index < props.item.parameters.length; index++) {
    const element = props.item.parameters[index]
    if (parameters.value[element.name] === '') {
      message.warn(`${element.name}为必填项`)
      return
    }
  }
  if (!isChecked) return
  props.runManualSql({ ...props.item, parametersObj: { ...parameters.value } })
}

//复制
const onCopyToClipboard = async (text: string) => {
  try {
    await copy(text)
    message.info(t('msg.info.copiedToClipboard'))
  } catch (e: any) {
    message.error(e.message)
  }
}
</script>

<template>
  <div class="answer">
    <div class="message markdown-content" v-html="marked(item.data)"></div>
    <div v-if="item?.errText">
      <ul>
        <li>
          <h4 class="title-type">{{ '错误' }}:</h4>
          <span class="markdown-content" v-html="marked(item.errText)"></span>
        </li>
      </ul>
    </div>
    <a-collapse v-if="item.detail.length" v-model:activeKey="activeKey" :bordered="false">
      <template #expandIcon="{ isActive }">
        <caret-right-outlined :rotate="isActive ? 90 : 0" />
      </template>
      <a-collapse-panel key="1" header="附加信息" :style="customStyle">
        <div v-for="detailItem in item.detail">
          <ul v-if="!['exe_result', 'data_meta'].includes(detailItem.type)">
            <li>
              <h4 class="title-type">{{ typeMap[detailItem.type] }}:</h4>
              <div class="sql-content" v-if="detailItem.type === 'sql'">
                <div class="sql-header">
                  <div class="copy" @click="onCopyToClipboard(detailItem.content)">
                    <GeneralIcon icon="duplicate" class="text-gray-700" />
                    {{ $t('general.duplicate') }}
                  </div>
                </div>
                <div class="sql-text" v-highlight>
                  <code class="sql">
                    {{ detailItem.content }}
                  </code>
                </div>
              </div>
              <span v-else class="markdown-content" v-html="marked(detailItem.content)"></span>
            </li>
          </ul>
          <template v-else>
            <div v-if="detailItem.content" class="data-meta">
              <h4 class="title-type">{{ '数据元信息' }}:</h4>
              <div v-if="detailItem.content?.fields">
                <h5>字段</h5>
                <DashboardAiAnalyticsTable :item="detailItem" :contentWidth="contentWidth" :type="'fields'" />
              </div>
              <div
                v-if="detailItem.content?.parameters && detailItem.content?.parameters.length"
                :style="{
                  margin: '15px 0',
                }"
              >
                <h5>查询条件</h5>
                <DashboardAiAnalyticsTable
                  :item="{ fields: detailItem.parametersNew.fields, tableData: detailItem.parametersNew.tableData }"
                  :contentWidth="contentWidth"
                  :type="'fields'"
                />
              </div>
            </div>
          </template>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <div v-if="item?.parameters.length" class="search-condition">
      <h4 class="additional-info">{{ '查询条件' }}:</h4>
      <div v-for="parameterItem in item?.parameters" class="search-condition-item">
        <span class="title">{{ parameterItem.name }}：</span>
        <div class="value" v-if="parameterItem.type === 'VARCHAR'">
          <a-input v-model:value="parameters[parameterItem.name]" />
        </div>
        <div v-if="parameterItem.type === 'INT'">
          <a-input-number v-model:value="parameters[parameterItem.name]" :precision="0" :min="1" :max="10" />
        </div>
        <div v-if="parameterItem.type === 'BOOLEAN'">
          <a-switch v-model:checked="parameters[parameterItem.name]" />
        </div>
      </div>
      <div class="search-sql-btn" @click="handleSearch">
        <NcButton type="primary">
          {{ '查询' }}
        </NcButton>
      </div>
    </div>
    <div v-if="item?.hasSqlRes">
      <h4 class="additional-info">{{ '查询结果' }}:</h4>
      <a-typography-text v-if="item?.isShowSaveBtn && item?.tableRes?.isExeSuccess" class="list-item-left-content-textAreaValue">
        <span v-if="!isEdited" class="edit-content edit-icon"
          ><span class="edit-text"> {{ tableName }}</span>
          <EditOutlined :title="isEdited ? '确认修改' : '修改表名'" class="edit-outlined" @click="handleEdit(true)"
        /></span>
        <a-input v-else v-model:value="tableName" class="edit-icon">
          <template #suffix>
            <EditOutlined :title="isEdited ? '确认修改' : '修改表名'" @click="handleEdit(false)" />
          </template>
        </a-input>
      </a-typography-text>
      <template v-if="item?.tableRes?.content">
        <DashboardAiAnalyticsTable
          v-if="item?.tableRes?.isExeSuccess"
          :item="item.tableRes.content"
          :contentWidth="contentWidth"
          :type="'exe_result'"
        />
        <div class="markdown-content" v-else v-html="marked(item.tableRes.content)"></div>
      </template>
      <a-empty v-else description="输入查询条件进行查询" :image="simpleImage" />
    </div>
  </div>
</template>

<style lang="scss">
.answer {
  color: #4a5268;
  .message {
    margin-bottom: 16px;
  }
  .ant-collapse-header {
    // border: 1px solid rgba(0, 0, 0, 0.12);
    // padding: 3px 20px 3px 6px !important;
    padding: 0 !important;
    width: fit-content;
    border-radius: 5px !important;
    position: relative;
    left: -1px;
    div {
      //   position: absolute;
      //   right: 4px;
    }
    .ant-collapse-arrow {
      margin-right: 0px !important;
      vertical-align: 1px !important;
    }
  }
  .ant-collapse-content-box {
    padding: 0 !important;
    padding-top: 8px !important;
  }
  .additional-info {
    font-weight: 800;
    font-size: 16px;
    margin-top: 18px;
    margin-bottom: 4px;
  }
  .title-type {
    font-size: 15px;
    font-weight: 800;
  }
  .list-item-left-content-textAreaValue {
    color: rgb(23, 26, 28);
    margin-bottom: 5px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    .edit-content {
      display: flex;
      width: 100%;
      align-items: center;
    }
    .ant-input-suffix {
      position: relative;
      top: -1px;
    }

    .ant-input-affix-wrapper {
      border-radius: 5px;
    }
    .ant-input-affix-wrapper {
      box-sizing: border-box;
      border: 1px solid rgb(217, 217, 217) !important;
    }
    .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
      box-shadow: none;
    }
    .ant-input-affix-wrapper-focused,
    .ant-input-affix-wrapper:focus {
      box-shadow: 0 0 0 2px #0b6bcb !important;
    }
    .edit-outlined {
      margin-left: 5px;
      position: relative;
    }
    input {
      flex: 1;
    }
  }
  .data-meta {
    .data-meta-item {
      margin-bottom: 10px;
    }
    .last-data-meta-item {
      margin-bottom: 0;
    }
  }
}
.search-condition {
  .search-condition-item {
    width: 100%;
    margin-top: 10px;
    .title {
      width: fit-content;
      margin-right: 10px;
      text-align: right;
    }
    .value {
      .ant-input {
        height: 36px;
      }
    }
  }
  .search-sql-btn {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
.sql-content {
  background: #171717;
  border-radius: 10px;
  overflow: hidden;
  .sql-header {
    height: 40px;
    background: #2e343e;
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
    padding: 10px;
  }
  .sql-text {
    padding: 0 3px 10px 10px;
  }
  .copy,
  .nc-icon {
    color: #a1a3a8 !important;
  }
}
.hljs {
  color: #fff !important;
  background: #171717 !important;
}
.hljs-keyword,
.hljs-selector-tag {
  color: #ff7b72 !important;
}
</style>
