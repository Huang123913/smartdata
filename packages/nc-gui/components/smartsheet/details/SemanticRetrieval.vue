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

const allColumnId = computed(() => {
  return fields.value.map((item) => item.id)
})

//获取检索语义
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
          JSON.parse(findSemanticFetrievalProp.jsonValue).map((item) => {
            let title: string[] = []
            item.columnId.map((id) => {
              let findColumn = fields.value.find((item) => item.id === id)
              title.push(findColumn?.title)
            })
            allSemanticRetrieval.value.push({ ...item, title })
          })
        }
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
}

//添加检索语义
const addSemanticRetrieval = async () => {
  try {
    if (fields.value.every((item) => item?.isChecked) && allSemanticRetrieval.value.length > 1) {
      message.warning('存在一个检索语义则默认有全局检索语义')
      return
    }
    isLoading.value = true
    let addColumnId: string[] = []
    let addTitle: string[] = []
    fields.value.map((item) => {
      if (item?.isChecked) {
        addColumnId.push(item.id)
        addTitle.push(item.title)
      }
    })
    if (
      allSemanticRetrieval.value.some((item) => {
        if (item.columnId.length === addColumnId.length) {
          return addColumnId.every((field) => item.columnId.includes(field))
        }
        return false
      })
    ) {
      message.warning('此检索语义已存在')
      return
    }
    let params = {
      id: uuidv4(),
      columnId: addColumnId,
    }
    await $api.smartData.markSemantics({
      entityId: route.params.viewId,
      belongCode: 'belongSemanticFetrieval',
      data: [params],
      option: 'add',
      optionId: '',
    })
    allSemanticRetrieval.value.push({ ...params, title: addTitle })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

//删除检索语义
const deleteSemanticsSearched = async (id: string) => {
  try {
    isShowLoading.value = true
    await $api.smartData.markSemantics({
      entityId: route.params.viewId,
      belongCode: 'belongSemanticFetrieval',
      data: [],
      option: 'del',
      optionId: id,
    })
    allSemanticRetrieval.value = allSemanticRetrieval.value.filter((item) => item.id !== id)
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
}

//给检索语义组合增加字段
const addExistSemanticsSearchedColumn = async (id: string) => {
  try {
    let addColumnId: string[] = []
    let addTitle: string[] = []
    fields.value.map((item) => {
      if (item?.isChecked) {
        addColumnId.push(item.id as string)
        addTitle.push(item.title as string)
      }
    })
    let filterItem = allSemanticRetrieval.value.filter((item) => item.id === id)
    for (let i = 0; i < addColumnId.length; i++) {
      if (filterItem[0].columnId.includes(addColumnId[i])) {
        message.warning('增加的字段存在重复')
        return
      }
    }
    let newColumn = [...filterItem[0].columnId, ...addColumnId]
    if (newColumn.length === allColumnId.value.length) {
      message.warning('添加后是一个全局检索语义，存在一个检索语义则默认有全局检索语义')
      return
    }
    if (
      allSemanticRetrieval.value.some((item) => {
        if (item.columnId.length === newColumn.length) {
          return addColumnId.every((id) => item.columnId.includes(id))
        }
        return false
      })
    ) {
      message.warning('添加后存在重复的语义')
      return
    }
    isShowLoading.value = true
    await $api.smartData.markSemantics({
      entityId: route.params.viewId,
      belongCode: 'belongSemanticFetrieval',
      data: { columnId: addColumnId },
      option: 'addField',
      optionId: id,
    })
    let optionItem = allSemanticRetrieval.value.find((item) => item.id === id)
    optionItem.columnId.push(...addColumnId)
    optionItem.title.push(...addTitle)
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
}

//删除检索语义组合的字段
const delExistSemanticsSearchedColumn = async (optionItem: any, index: number) => {
  try {
    isShowLoading.value = true
    let deleteColumnId = optionItem.columnId[index]
    let deleteTitle = optionItem.title[index]
    await $api.smartData.markSemantics({
      entityId: route.params.viewId,
      belongCode: 'belongSemanticFetrieval',
      data: { columnId: deleteColumnId },
      option: 'delField',
      optionId: optionItem.id,
    })
    let delItem = allSemanticRetrieval.value.find((item) => item.id === optionItem.id)
    delItem.columnId = delItem.columnId.filter((item) => item !== deleteColumnId)
    delItem.title = delItem.title.filter((item) => item !== deleteTitle)
  } catch (error) {
    console.error(error)
  } finally {
    isShowLoading.value = false
  }
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
              <div class="group mb-4 rounded-lg p-2 min-w-full w-min border-1 nc-filter-nested-level-0">
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
                  <GeneralIcon
                    v-if="item.title.length > 1"
                    icon="delete"
                    @click="deleteSemanticsSearched(item.id)"
                    class="text-gray-700 group-del-icon"
                  />
                </div>
                <div class="flex mb-2 items-center justify-between" v-for="(item1, index) in item.title">
                  <span> {{ item1 }}</span>
                  <GeneralIcon
                    v-if="item.title.length > 1"
                    icon="delete"
                    class="text-gray-700"
                    @click="delExistSemanticsSearchedColumn(item, index)"
                  />
                  <GeneralIcon v-else @click="deleteSemanticsSearched(item.id)" icon="delete" class="text-gray-700" />
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
                <NcTooltip class="truncate" show-on-truncate-only>
                  <template #title> {{ item.title }}</template>
                  <span class="column-title">{{ item.title }}</span>
                </NcTooltip>
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
