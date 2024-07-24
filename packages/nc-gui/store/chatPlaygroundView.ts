import { reactive } from 'vue'

import type { ChatPlaygroundViewStoreEvents } from '#imports'
import { useEventBus, useNuxtApp } from '#imports'
import { defineStore } from 'pinia'

export interface SessionItem {
  id: string
  textAreaValue: string
  sql: string
  selectedModel: string
  tabledata: string
  columns: any[]
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
    allModel: any[]
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
    allModel: [],
    checkedModelData: [], //选中的模型
    sessionItem: {
      id: '',
      textAreaValue: '',
      sql: '',
      selectedModel: '',
      tabledata: '',
      columns: [],
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
      bizCatalogEntityCustom = bizCatalogEntityCustom.map((item) => ({ ...item, parentId: item.parentId ? item.parentId : null }))
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
          children: buildTree(bizCatalogEntityCustom, true),
          title: '模型目录',
          key: '0-0',
        },
      ]
      // 模型树进行排序
      chataiData.modelTree.forEach((node) => sortTreeNodesByOrderNo(node))
      chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
      chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false)
      chataiData.modelCatalogTree.forEach((node) => sortTreeNodesByOrderNo(node))
    } catch (e) {
      console.error(e)
    }
  }

  const getAllModel = async () => {
    chataiData.allModel = await $api.smartData.findAllBizCustomEntity({
      isShowFields: true,
      isShowEntityProps: false,
      isShowFieldProps: false,
    })
  }

  // 构建树
  const buildTree = (datas: any[], isAddEmptyChild: boolean, parentId = null): any[] => {
    return datas
      .filter((item: any) => {
        return item.parentId === parentId
      })
      .map((item: any) => {
        let children: any[] = item.isCatalog ? buildTree(datas, isAddEmptyChild, item.id) : []
        children = children.length
          ? children
          : item.isCatalog && isAddEmptyChild
          ? [
              {
                title: 'Empty',
                key: 'Empty' + item.id,
                children: [],
                fields: [],
                parentId: item.id,
              },
            ]
          : []
        return {
          ...item,
          title: item.name_cn,
          key: item.id,
          children,
          fields: [],
        }
      })
  }

  // 排序
  const sortTreeNodesByOrderNo = (node: any) => {
    if (node?.children && node.children.length) {
      let catalog = node.children.filter((item: any) => item.isCatalog)
      let model = node.children.filter((item: any) => !item.isCatalog)
      catalog.sort((a: any, b: any) => {
        if (a.orderNo === null && b.orderNo === null) {
          return 0
        }
        if (a.orderNo === null) {
          return 1
        }
        if (b.orderNo === null) {
          return -1
        }
        return a.orderNo - b.orderNo
      })
      model.sort((a: any, b: any) => {
        if (a.orderNo === null && b.orderNo === null) {
          return 0
        }
        if (a.orderNo === null) {
          return 1
        }
        if (b.orderNo === null) {
          return -1
        }
        return a.orderNo - b.orderNo
      })
      node.children = [...catalog, ...model]
      // 递归对每个子节点进行排序
      node.children.forEach((child: any) => sortTreeNodesByOrderNo(child))
    }
  }

  // 在模型树根据id查找节点
  const findNodeById: any = (nodes: any, nodeId: string) => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return node
      } else if (node?.children && node.children.length) {
        const found = findNodeById(node.children, nodeId)
        if (found) return found
      }
    }
    return null
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
  const updateModelCatalog = (modelId: string, catalogId: string, orderNo?: number) => {
    let findModel = chataiData.modelData.find((item) => item.id === modelId)
    findModel.parentId = catalogId
    chataiData.modelTree = [
      {
        id: null,
        name_cn: '模型目录',
        parentId: 'add-catalog',
        isCatalog: true,
        children: buildTree(chataiData.modelData, false),
        title: '模型目录',
        key: '0-0',
      },
    ]
    // chataiData.modelTree.forEach((node) => sortTreeNodesByOrderNo(node))
  }

  //修改表字段名称
  const updateTableColumnName = (column: object, name: string) => {
    let findItem = chataiData.sessionItem.columns.find((item) => item.id === column.id)
    findItem.name_cn = name
  }

  //移动模型
  const moveModel = (modelId: string, originalParentId: string, newParentId: string, prependToTableId: string) => {
    let findModel = findNodeById(chataiData.modelTree, modelId)
    findModel.parentId = newParentId
    let originalParentIdCatlog = findNodeById(chataiData.modelTree, originalParentId)
    originalParentIdCatlog.children = originalParentIdCatlog.children.filter((item) => item.id !== modelId)
    if (!originalParentIdCatlog.children.length) {
      originalParentIdCatlog.children = [
        {
          title: 'Empty',
          key: 'Empty' + originalParentId,
          children: [],
          fields: [],
          parentId: originalParentId,
        },
      ]
    }
    let newCatalog = findNodeById(chataiData.modelTree, newParentId)
    if (newCatalog.children.length === 1 && newCatalog.children[0].key.indexOf('Empty') > -1) {
      newCatalog.children = [findModel]
      return
    }
    if (prependToTableId) {
      let findIndex = newCatalog.children.findIndex((item) => item.id === prependToTableId)
      newCatalog.children.splice(findIndex, 0, findModel)
    } else {
      newCatalog.children.push(findModel)
    }
  }

  //修改目录名称
  const updateCatalogName = (catalog: any, rename: string) => {
    let findCatalog = chataiData.modelData.find((item) => item.id === catalog.id)
    findCatalog.name = rename
    findCatalog.name_cn = rename

    let findCatalogById = findNodeById(chataiData.modelTree, catalog.id)
    findCatalogById.name = rename
    findCatalogById.name_cn = rename
    findCatalogById.title = rename

    chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false)
  }

  //创建目录
  const createCatalog = (catalog: any) => {
    chataiData.modelData.push({ ...catalog })
    chataiData.modelCatalog.push({ ...catalog })
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false)
    let findCatalog = catalog.parentId ? findNodeById(chataiData.modelTree, catalog.parentId) : chataiData.modelTree[0]
    let findLastIndex = findCatalog.children.findLastIndex((item: any) => item.isCatalog)
    if (findCatalog.children.length === 1 && findCatalog.children[0].key.indexOf('Empty') > -1) {
      findCatalog.children = [
        {
          ...catalog,
          title: catalog.name_cn,
          key: catalog.id,
          isCatalog: true,
          children: [
            {
              title: 'Empty',
              key: 'Empty' + catalog.id,
              fields: [],
              isCatalog: false,
              parentId: catalog.id,
            },
          ],
          fields: [],
        },
      ]
      return
    }
    findCatalog.children.splice(findLastIndex + 1, 0, {
      ...catalog,
      title: catalog.name_cn,
      key: catalog.id,
      isCatalog: true,
      children: [
        {
          title: 'Empty',
          key: 'Empty' + catalog.id,
          fields: [],
          isCatalog: false,
          parentId: catalog.id,
        },
      ],
      fields: [],
    })
  }

  //移动目录
  const moveCatalog = (catalogId: string, originalParentId: string, newParentId: string, prependToTableId: string) => {
    updateData(catalogId, newParentId)
    let findCatalog = findNodeById(chataiData.modelTree, catalogId)
    findCatalog.parentId = newParentId
    let originalParentIdCatlog = originalParentId ? findNodeById(chataiData.modelTree, originalParentId) : chataiData.modelTree[0]
    originalParentIdCatlog.children = originalParentIdCatlog.children.filter((item: any) => item.id !== catalogId)
    if (!originalParentIdCatlog.children.length) {
      originalParentIdCatlog.children = [
        {
          title: 'Empty',
          key: 'Empty' + originalParentId,
          children: [],
          fields: [],
          parentId: originalParentId,
        },
      ]
    }
    let newCatalog = newParentId ? findNodeById(chataiData.modelTree, newParentId) : chataiData.modelTree[0]
    if (newCatalog.children.length === 1 && newCatalog.children[0].key.indexOf('Empty') > -1) {
      newCatalog.children = [findCatalog]
      return
    }
    if (prependToTableId) {
      let findIndex = newCatalog.children.findIndex((item: any) => item.id === prependToTableId)
      findIndex = findIndex === -1 ? 0 : findIndex
      newCatalog.children.splice(findIndex, 0, findCatalog)
    } else {
      let findLastIndex = newCatalog.children.findLastIndex((item: any) => item.isCatalog)
      newCatalog.children.splice(findLastIndex + 1, 0, findCatalog)
    }
  }

  //更新数据
  const updateData = (catalogId: string, newParentId: string) => {
    let findItem = chataiData.modelData.find((item) => item.id === catalogId)
    findItem.parentId = newParentId
    chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false)
    chataiData.modelCatalogTree.forEach((node) => sortTreeNodesByOrderNo(node))
  }

  return {
    chataiData,
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
    findNodeById,
    updateTableColumnName,
    createCatalog,
    moveModel,
    moveCatalog,
    getAllModel,
  }
})
