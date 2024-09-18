<script lang="ts" setup>
import { marked } from 'marked'

import { CaretRightOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  item: any
  contentWidth?: number
}>()

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
const customStyle = 'background: #fff;border: 0;overflow: hidden'
</script>

<template>
  <div class="answer">
    <div class="message markdown-content" v-html="marked(item.data)"></div>
    <a-collapse v-model:activeKey="activeKey" :bordered="false">
      <template #expandIcon="{ isActive }">
        <caret-right-outlined :rotate="isActive ? 90 : 0" />
      </template>
      <a-collapse-panel key="1" header="更多信息" :style="customStyle">
        <div v-for="detailItem in item.detail">
          <ul v-if="!['exe_result'].includes(detailItem.type)">
            <li>
              <h4 class="title-type">{{ typeMap[detailItem.type] }}:</h4>
              <span class="markdown-content" v-html="marked(detailItem.content)"></span>
            </li>
          </ul>
          <template v-else>
            <h4 class="additional-info">{{ detailItem.isExeSuccess ? typeMap[detailItem.type] : 'sql执行错误原因' }}:</h4>
            <DashboardAiAnalyticsTable
              v-if="detailItem.isExeSuccess"
              :item="detailItem.content"
              :contentWidth="contentWidth"
              :type="detailItem.type"
            />
            <div v-else v-html="marked(detailItem.content)"></div>
          </template>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <!-- <h4 v-if="item.detail.length" class="additional-info">附加信息：</h4>
    <div v-for="detailItem in item.detail">
      <ul v-if="!['exe_result'].includes(detailItem.type)">
        <li>
          <h4 class="title-type">{{ typeMap[detailItem.type] }}:</h4>
          <span class="markdown-content" v-html="marked(detailItem.content)"></span>
        </li>
      </ul>
      <template v-else>
        <h4 class="additional-info">{{ detailItem.isExeSuccess ? typeMap[detailItem.type] : 'sql执行错误原因' }}:</h4>
        <DashboardAiAnalyticsTable
          v-if="detailItem.isExeSuccess"
          :item="detailItem.content"
          :contentWidth="contentWidth"
          :type="detailItem.type"
        />
        <div v-else v-html="marked(detailItem.content)"></div>
      </template>
    </div> -->
  </div>
</template>

<style lang="scss">
.answer {
  color: #4a5268;
  .message {
    margin-bottom: 16px;
  }
  .ant-collapse-header {
    padding: 0 !important;
    .ant-collapse-arrow {
      margin-right: 0px !important;
      vertical-align: 1px;
    }
  }
  .ant-collapse-content-box {
    padding: 0 !important;
    padding-top: 8px !important;
  }
  .additional-info {
    font-weight: 800;
    font-size: 16px;
    margin-top: 26px;
    margin-bottom: 2px;
  }
  .title-type {
    font-size: 15px;
    font-weight: 800;
  }
}
</style>
