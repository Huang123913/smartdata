<script setup lang="ts">
import { Empty } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'

import Icon from '@ant-design/icons-vue'

const route = useRoute()
const fields = inject(FieldsInj, ref([]))
const isLoading = ref(false)
const { $api } = useNuxtApp()
const allSemanticRetrieval = ref([])
const isShowLoading = ref(false)
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

onMounted(() => {
  getAllSemanticsSearchedFields()
})

const isCanAdd = computed(() => {
  return fields.value.some((item) => item?.isChecked)
})

const allColumnName = computed(() => {
  return fields.value.map((item) => item.column_name).join(';')
})

const addSemanticRetrieval = async () => {
  try {
    if (fields.value.every((item) => item?.isChecked) && allSemanticRetrieval.value.length > 1) {
      message.warning('存在一个检索语义则默认有全局检索语义')
      return
    }
    isLoading.value = true
    let addField = ''
    let addTitle = ''
    fields.value.map((item) => {
      if (item?.isChecked) {
        addField += item.column_name + ';'
        addTitle += item.title + ';'
      }
    })
    addField = addField.replace(/;$/, '')
    addTitle = addTitle.replace(/;$/, '')
    if (allSemanticRetrieval.value.some((item) => item.columnName === addField)) {
      message.warning('此检索语义已存在')
      return
    }
    let params = {
      id: uuidv4(),
      columnName: addField,
      title: addTitle,
    }
    await $api.smartData.saveModelProps({
      entityId: route.params.viewId,
      belongCode: 'belongSemanticFetrieval',
      data: [params],
      option: 'add',
      optionId: '',
    })
    allSemanticRetrieval.value.push(params)
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const getAllSemanticsSearchedFields = async () => {
  try {
    if (route?.params?.viewId) {
      isShowLoading.value = true
      let tableInfo = await $api.smartData.entity({
        entityId: route.params.viewId,
      })
      let props = tableInfo[0]?.props ? tableInfo[0]?.props : []
      if (props.length) {
        let findSemanticFetrievalProp = props.findLast((p) => p.code == 'belongSemanticFetrieval')
        if (findSemanticFetrievalProp) {
          allSemanticRetrieval.value = JSON.parse(findSemanticFetrievalProp.jsonValue)
        }
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
}

const deleteSemanticsSearched = async (id: string) => {
  await $api.smartData.saveModelProps({
    entityId: route.params.viewId,
    belongCode: 'belongSemanticFetrieval',
    data: [],
    option: 'del',
    optionId: id,
  })
  allSemanticRetrieval.value = allSemanticRetrieval.value.filter((item) => item.id !== id)
}

const addExistSemanticsSearchedColumn = async (id: string) => {
  let addField: string[] = []
  let addTitle: string[] = []
  fields.value.map((item) => {
    if (item?.isChecked) {
      addField.push(item.column_name as string)
      addTitle.push(item.title as string)
    }
  })
  let filterItem = allSemanticRetrieval.value.filter((item) => item.id === id)
  let isRepeat = false
  for (let i = 0; i < addField.length; i++) {
    if (filterItem[0].columnName.indexOf(addField[i]) > -1) {
      isRepeat = true
      break
    }
  }
  if (isRepeat) {
    message.warning('增加的字段存在重复')
    return
  }
  let newColumn = filterItem[0].columnName + ';' + addField.join(';')
  if (newColumn.length === allColumnName.value.length) {
    message.warning('存在一个检索语义则默认有全局检索语义')
    return
  }
  if (
    allSemanticRetrieval.value.some((item) => {
      if (item.columnName.length === newColumn.length) {
        return addField.every((field) => item.columnName.indexOf(field) > -1)
      }
      return false
    })
  ) {
    message.warning('添加后存在重复的语义')
    return
  }
  await $api.smartData.saveModelProps({
    entityId: route.params.viewId,
    belongCode: 'belongSemanticFetrieval',
    data: { columnName: addField.join(';'), title: addTitle.join(';') },
    option: 'addField',
    optionId: id,
  })
  let optionItem = allSemanticRetrieval.value.find((item) => item.id === id)
  optionItem.columnName = optionItem.columnName + ';' + addField.join(';')
  optionItem.title = optionItem.title + ';' + addTitle.join(';')
}

const delExistSemanticsSearchedColumn = async (optionItem: any, index: number) => {
  let deleteColumn = optionItem.columnName.split(';')[index]
  let deleteTitle = optionItem.title.split(';')[index]
  await $api.smartData.saveModelProps({
    entityId: route.params.viewId,
    belongCode: 'belongSemanticFetrieval',
    data: { columnName: deleteColumn, title: deleteTitle },
    option: 'delField',
    optionId: optionItem.id,
  })
  let delItem = allSemanticRetrieval.value.find((item) => item.id === optionItem.id)
  delItem.columnName = optionItem.columnName
    .split(';')
    .filter((item) => item !== deleteColumn)
    .join(';')
  delItem.title = optionItem.title
    .split(';')
    .filter((item) => item !== deleteTitle)
    .join(';')
}

const handleCheck = (item: any) => {
  item.isChecked = !item.isChecked
}
</script>

<template>
  <div class="semantic-retrieval-tab w-full p-5">
    <div class="max-w-250 h-full w-full mx-auto content">
      <NcButton type="primary" class="mt-8 add-btn" :disabled="!isCanAdd" :loading="isLoading" @click="addSemanticRetrieval">
        {{ '增加可检索语义' }}
        <template #loading> {{ '增加可检索语义' }} </template>
      </NcButton>
      <div class="main flex rounded-lg border-1 overflow-clip border-gray-200">
        <div class="left border-r border-gray-200">
          <div class="left-header border-b border-gray-200">可检索语义</div>
          <div class="left-list" v-if="allSemanticRetrieval.length">
            <template v-for="item in allSemanticRetrieval">
              <div
                class="group mb-4 rounded-lg p-2 min-w-full w-min border-1 nc-filter-nested-level-0"
                v-if="item.title.indexOf(';') > -1"
              >
                <div class="group-icon">
                  <GeneralIcon
                    @click="addExistSemanticsSearchedColumn(item.id)"
                    v-if="isCanAdd"
                    icon="plus"
                    class="text-gray-700"
                  />
                  <icon v-else>
                    <template #component>
                      <svg
                        t="1719394041956"
                        class="icon"
                        viewBox="0 0 1025 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="2296"
                        width="16"
                        height="16"
                      >
                        <path
                          d="M895.531061 485.788536 535.640488 485.788536 535.640488 125.897963c0-13.5716-11.001648-24.573248-24.573248-24.573248s-24.573248 11.001648-24.573248 24.573248l0 359.890572L126.604444 485.788536c-13.5716 0-24.573248 11.001648-24.573248 24.573248s11.001648 24.573248 24.573248 24.573248l359.889548 0 0 359.890572c0 13.5716 11.001648 24.573248 24.573248 24.573248s24.573248-11.001648 24.573248-24.573248L535.640488 534.934007l359.890572 0c13.5716 0 24.573248-11.001648 24.573248-24.573248S909.102661 485.788536 895.531061 485.788536z"
                          fill="#D5D5D9"
                          p-id="2297"
                        ></path>
                      </svg>
                    </template>
                  </icon>
                  <GeneralIcon icon="delete" @click="deleteSemanticsSearched(item.id)" class="text-gray-700 group-del-icon" />
                </div>
                <div class="flex mb-2 items-center justify-between" v-for="(item1, index) in item.title.split(';')">
                  <span> {{ item1 }}</span>
                  <GeneralIcon icon="delete" class="text-gray-700" @click="delExistSemanticsSearchedColumn(item, index)" />
                </div>
              </div>
              <div class="mb-4 group rounded-lg p-2 min-w-full w-min border-1 nc-filter-nested-level-0" v-else>
                <div class="group-icon">
                  <GeneralIcon
                    @click="addExistSemanticsSearchedColumn(item.id)"
                    v-if="isCanAdd"
                    icon="plus"
                    class="text-gray-700"
                  />
                  <icon v-else>
                    <template #component>
                      <svg
                        t="1719394041956"
                        class="icon"
                        viewBox="0 0 1025 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="2296"
                        width="16"
                        height="16"
                      >
                        <path
                          d="M895.531061 485.788536 535.640488 485.788536 535.640488 125.897963c0-13.5716-11.001648-24.573248-24.573248-24.573248s-24.573248 11.001648-24.573248 24.573248l0 359.890572L126.604444 485.788536c-13.5716 0-24.573248 11.001648-24.573248 24.573248s11.001648 24.573248 24.573248 24.573248l359.889548 0 0 359.890572c0 13.5716 11.001648 24.573248 24.573248 24.573248s24.573248-11.001648 24.573248-24.573248L535.640488 534.934007l359.890572 0c13.5716 0 24.573248-11.001648 24.573248-24.573248S909.102661 485.788536 895.531061 485.788536z"
                          fill="#D5D5D9"
                          p-id="2297"
                        ></path>
                      </svg>
                    </template>
                  </icon>
                </div>
                <div class="flex justify-between items-center">
                  <span>{{ item.title }}</span>
                  <GeneralIcon @click="deleteSemanticsSearched(item.id)" icon="delete" class="text-gray-700" />
                </div>
              </div>
            </template>
          </div>

          <!-- 无数据 -->
          <div v-if="!allSemanticRetrieval.length" class="no-data">
            <a-empty description="暂无可检索语义" :image="simpleImage" />
          </div>
        </div>
        <div class="right">
          <div class="right-header border-b border-gray-200">表格字段</div>
          <a-list class="fidlds-list" item-layout="horizontal" :data-source="fields">
            <template #renderItem="{ item }">
              <a-list-item @click="handleCheck(item)">
                <NcCheckbox v-model:checked="item.isChecked" />
                <span class="column-title">{{ item.title }}</span>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss">
.semantic-retrieval-tab {
  height: calc(100vh - 2 * var(--topbar-height));
  .content {
    display: flex;
    flex-direction: column;
    .add-btn {
      align-self: flex-end;
      margin: 0;
    }
    .main {
      height: calc(100% - 2.5rem);
      width: 100%;
      margin-top: 8px;
      .left {
        width: 60%;
        height: 100%;
        .left-header {
          height: 50px;
          line-height: 50px;
          padding: 0 16px;
          font-size: 16px;
          font-weight: 600;
        }
        .left-list {
          padding: 16px;
          max-height: calc(100% - 50px);
          overflow-y: auto;
          overflow-x: hidden;
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
          &::-webkit-scrollbar-track {
            background-color: #e0e0e0;
            border-radius: 10px;
          }
          .group {
            padding: 16px 8px;
            .group-icon {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              margin-bottom: 16px;
              .group-del-icon {
                margin-left: 6px;
                position: relative;
                top: 1px;
              }
            }
          }
          .nc-icon,
          .material-symbols {
            cursor: pointer;
          }
        }

        .no-data {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .right {
        width: 40%;
        display: flex;
        flex-direction: column;
        .right-header {
          height: 50px;
          line-height: 50px;
          padding: 0 16px;
          font-size: 16px;
          font-weight: 600;
        }
        .fidlds-list {
          padding: 8px 16px;
          max-height: calc(100% - 50px);
          overflow-y: auto;
          overflow-x: hidden;
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
          &::-webkit-scrollbar-track {
            background-color: #e0e0e0;
            border-radius: 10px;
          }
          .ant-list-item {
            border: none;
            justify-content: flex-start;
            padding: 7px 0;
            cursor: pointer;
            .column-title {
              margin-left: 5px;
            }
          }
        }
      }
    }
  }
}
</style>
