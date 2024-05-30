import { reactive } from 'vue'

import type { ChatPlaygroundViewStoreEvents } from '#imports'
import { useEventBus, useNuxtApp } from '#imports'
import { defineStore } from 'pinia'

import chataiApi from '../api/chatai'

export interface SessionItem {
  id: string
  textAreaValue: string
  sql: string
  selectedModel: string
  tabledata: string
  tip: string
}

export const useChatPlaygroundViewStore = defineStore('chatPlaygroundViewStore', () => {
  const { $api } = useNuxtApp()
  // 创建数据仓库
  const chataiData = reactive<{
    modelData: any[]
    modelTree: any[]
    modelCatalog: any[]
    modelCatalogTree: any[]
    checkedModelData: any[]
    sessionItem: SessionItem
    isOpenModel: boolean
    modelFields: {
      [key: string]: any
    }
  }>({
    modelData: [], //模型数据
    modelTree: [], //模型树
    modelCatalog: [], //模型目录
    modelCatalogTree: [], //模型目录树
    checkedModelData: [], //选中的模型
    sessionItem: {
      id: '',
      textAreaValue: '',
      sql: '',
      selectedModel: '',
      tabledata: '',
      tip: '',
    }, //展示的会话信息
    modelFields: {}, //选择了的字段映射到对应模型
    isOpenModel: false,
  })

  const eventBus = useEventBus<ChatPlaygroundViewStoreEvents>(Symbol('chatPlaygroundView'))

  //获取模型数据
  const getCustomCatalogEntityTree = async () => {
    try {
      let bizCatalogEntityCustom = await $api.smartData.entities()
      if (!bizCatalogEntityCustom.length) return
      chataiData.modelData = [
        ...bizCatalogEntityCustom,
        {
          id: null,
          name_cn: '模型目录',
          parentId: '',
          isCatalog: true,
          title: '模型目录',
          key: '0-0',
        },
      ]
      chataiData.modelTree = [
        {
          id: null,
          name_cn: '模型目录',
          parentId: 'add-catalog',
          isCatalog: true,
          children: buildTree(bizCatalogEntityCustom),
          title: '模型目录',
          key: '0-0',
        },
      ]
      chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
      chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog)
    } catch (e) {
      console.error(e)
    }
  }

  // 构建树
  const buildTree = (datas: any[], parentId = null): any[] => {
    return datas
      .filter((item: any) => item.parentId === parentId)
      .map((item: any) => {
        let children: any[] = item.isCatalog ? buildTree(datas, item.id) : []
        return { ...item, title: item.name_cn, key: item.id, children, fields: [] }
      })
  }

  //设置展示的会话信息
  const setSessionItem = (data: SessionItem) => {
    chataiData.sessionItem = data
  }

  //获取勾选的模型
  const getCheckedModelData = (checkedKeys: string[]) => {
    chataiData.checkedModelData = checkedKeys
      .map((checkedKey) => {
        let findNode = chataiData.modelData.find((item) => item.id === checkedKey)
        if (!findNode) findNode = { isCatalog: true, id: null }
        if (chataiData.modelFields.hasOwnProperty(findNode.id)) {
          findNode.fields = chataiData.modelFields[findNode.id].map((item: any) => ({ ...item }))
        } else {
          findNode.fields = []
        }
        return findNode
      })
      .filter((item) => !item.isCatalog)
  }

  //设置模型已选字段
  const setModelFields = (id: string, fields: any[]) => {
    chataiData.modelFields[id] = fields
    let findModel = chataiData.checkedModelData.find((item) => item.id === id)
    if (findModel) findModel.fields = fields.map((item) => ({ ...item }))
  }

  // 删除模型
  const deleteModel = (id: string) => {
    chataiData.checkedModelData = chataiData.checkedModelData.filter((item) => item.id !== id)
  }

  //删除字段
  const deleteFile = (field: any, modelId: string) => {
    let findModelItem = chataiData.checkedModelData.find((item) => item.id === modelId)
    let fields = chataiData.modelFields[modelId].filter((item: any) => item.id !== field.id)
    findModelItem.fields = fields
    chataiData.modelFields[modelId] = fields
  }

  const setChataiDataIsOpenMode = (value: boolean) => {
    chataiData.isOpenModel = value
  }

  // 修改模型目录
  const updateModelCatalog = (modelId: string, catalogId: string) => {
    let findModel = chataiData.modelData.find((item) => item.id === modelId)
    findModel.parentId = catalogId
    chataiData.modelTree = [
      {
        id: null,
        name_cn: '模型目录',
        parentId: 'add-catalog',
        isCatalog: true,
        children: buildTree(chataiData.modelData),
        title: '模型目录',
        key: '0-0',
      },
    ]
  }

  const updateCatalogName = (catalog: any, rename: string) => {
    let findCatalog = chataiData.modelData.find((item) => item.id === catalog.id)
    findCatalog.name = rename
    findCatalog.name_cn = rename
    chataiData.modelTree = [
      {
        id: null,
        name_cn: '模型目录',
        parentId: 'add-catalog',
        isCatalog: true,
        children: buildTree(chataiData.modelData),
        title: '模型目录',
        key: '0-0',
      },
    ]
    chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog)
  }

  return {
    chataiData,
    chataiApi,
    setSessionItem,
    getCustomCatalogEntityTree,
    getCheckedModelData,
    deleteFile,
    deleteModel,
    setModelFields,
    buildTree,
    setChataiDataIsOpenMode,
    eventBus,
    updateModelCatalog,
    updateCatalogName,
  }
})
