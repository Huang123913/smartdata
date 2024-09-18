<script lang="ts" setup>
import { marked } from 'marked'

import { CaretRightOutlined, EditOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  item: any
  contentWidth?: number
}>()
const store = useaiAnalyticsStore()
const { tableNameList } = storeToRefs(store)
const { setTableNameList } = store

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
onMounted(() => {
  tableName.value = tableNameList[props.item.id] || 'Table'
})
const handleEdit = (value: boolean) => {
  if (!tableName.value.trim()) tableName.value = 'Table'
  isEdited.value = value
  setTableNameList(props.item.id, tableName)
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
              <span class="markdown-content" v-html="marked(detailItem.content)"></span>
            </li>
          </ul>
          <template v-else>
            <div v-if="detailItem.content" class="data-meta">
              <h4 class="title-type">{{ '数据元信息' }}:</h4>
              <div v-if="detailItem.content?.fields">
                <h5>字段</h5>
                <DashboardAiAnalyticsTable :item="detailItem" :contentWidth="contentWidth" :type="'fields'" />
              </div>
            </div>
          </template>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <div v-if="item?.hasSqlRes">
      <h4 class="additional-info">{{ '查询结果' }}:</h4>
      <a-typography-text v-if="item?.tableRes.isExeSuccess" class="list-item-left-content-textAreaValue">
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
      <DashboardAiAnalyticsTable
        v-if="item?.tableRes.isExeSuccess"
        :item="item.tableRes.content"
        :contentWidth="contentWidth"
        :type="'exe_result'"
      />
      <div class="markdown-content" v-else v-html="marked(item.tableRes.content)"></div>
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
</style>
