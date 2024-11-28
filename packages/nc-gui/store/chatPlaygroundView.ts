import { reactive } from 'vue'

import type { ChatPlaygroundViewStoreEvents } from '#imports'
import { useEventBus, useNuxtApp } from '#imports'
import _ from 'lodash'
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

/**
 * 提问建表
 */
export const useChatPlaygroundViewStore = defineStore('chatPlaygroundViewStore', () => {
  const { $api } = useNuxtApp()
  const { loadProjectTables } = useTablesStore()
  // 创建数据仓库
  const chataiData = reactive<{
    treeData: any[]
    projectMap: {
      [key: string]: any
    }
    projectMapCatalogTree: {
      [key: string]: any
    }
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
    isInit: boolean
    projectList: any[]
  }>({
    treeData: [], //控制台左侧树数据
    projectMap: {}, //项目对应的目录、表格
    projectMapCatalogTree: {}, //项目对应的目录树
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
    isInit: false,
    projectList: [],
  })

  // 事件总线
  const eventBus = useEventBus<ChatPlaygroundViewStoreEvents>(Symbol('chatPlaygroundView'))

  //控制台左侧树
  const getTreeData = async (projectList: any[], baseId: string) => {
    chataiData.projectList = projectList
    chataiData.treeData = []
    projectList.map((item) => {
      chataiData.treeData.push({
        ...item,
        isProject: true,
        children: [
          {
            title: 'Empty',
            key: 'Empty' + item.id,
            children: [],
            fields: [],
            parentId: item.id,
            projectId: item.id,
          },
        ],
        key: item.id,
        projectId: item.id,
        isInit: false,
      })
    })
    if (baseId) {
      await getEntityCustomByBaseId(baseId)
      loadProjectTables(baseId)
      chataiData.isInit = true
    }
  }

  //根据项目去获取表格、目录
  let getEntityCustomByBaseId = async (baseId: string, force: boolean = false, callback?: (value: string) => void) => {
    let findProject = findNodeById(chataiData.treeData, baseId)
    if (findProject?.isInit && !force) return
    callback && callback(baseId)
    let bizCatalogEntityCustom = await $api.smartData.entities()
    if (!bizCatalogEntityCustom.length) return
    bizCatalogEntityCustom = bizCatalogEntityCustom.map((item) => ({
      ...item,
      parentId: item.parentId ? item.parentId : null,
      newId: `${baseId}_${item.id}`, //模仿根据不同项目去获取表格、目录
    }))
    findProject.children = buildTree(bizCatalogEntityCustom, true, baseId)
    findProject.children.forEach((node) => sortTreeNodesByOrderNo(node))
    findProject.isInit = true
    chataiData.projectMap[baseId] = bizCatalogEntityCustom //排序
    let filterCaltalog = bizCatalogEntityCustom.filter((item) => item.isCatalog && item.id !== null)
    chataiData.projectMapCatalogTree[baseId] = buildTree(filterCaltalog, false, '')
    chataiData.projectMapCatalogTree[baseId].forEach((node) => sortTreeNodesByOrderNo(node)) //排序
    chataiData.isInit = true
  }

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
          children: buildTree(bizCatalogEntityCustom, true, ''),
          title: '模型目录',
          key: '0-0',
        },
      ]
      // 模型树进行排序
      chataiData.modelTree.forEach((node) => sortTreeNodesByOrderNo(node))
      chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
      chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false, '')
      chataiData.modelCatalogTree.forEach((node) => sortTreeNodesByOrderNo(node))
    } catch (e) {
      console.error(e)
    }
  }

  //获取所有表格
  const getAllModel = async () => {
    chataiData.allModel = await $api.smartData.findAllBizCustomEntity({
      isShowFields: true,
      isShowEntityProps: false,
      isShowFieldProps: false,
    })
  }

  //数据初始化
  const initData = async () => {
    try {
      chataiData.isInit = false
      await getCustomCatalogEntityTree()
      await getAllModel()
    } catch (error) {
      console.error(error)
    } finally {
      chataiData.isInit = true
    }
  }

  // 构建树
  const buildTree = (datas: any[], isAddEmptyChild: boolean, projectId: string, parentId = null): any[] => {
    return datas
      .filter((item: any) => {
        return item.parentId === parentId
      })
      .map((item: any) => {
        let children: any[] = item.isCatalog ? buildTree(datas, isAddEmptyChild, projectId, item.id) : []
        children = children.length
          ? children
          : item.isCatalog && isAddEmptyChild
          ? [
              {
                title: 'Empty',
                key: 'Empty' + item.newId,
                children: [],
                fields: [],
                parentId: item.newId,
                projectId,
              },
            ]
          : []
        return {
          ...item,
          title: item.name_cn,
          key: item.newId,
          children,
          fields: [],
          projectId,
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

  //修改表字段名称
  const updateTableColumnName = (column: object, name: string) => {
    let findItem = chataiData.sessionItem.columns.find((item) => item.id === column.id)
    findItem.name_cn = name
  }

  //创建表
  const createTableToTreeData = async (tableInfo: any) => {
    // let bizCatalogEntityCustom = await $api.smartData.entities()
    // if (!bizCatalogEntityCustom.length) return
    // bizCatalogEntityCustom = bizCatalogEntityCustom.map((item) => ({ ...item, parentId: item.parentId ? item.parentId : null }))
    // let findProject = findNodeById(chataiData.treeData, tableInfo.projectId)
    // console.log('findProject', findProject)
    // findProject.children = buildTree(bizCatalogEntityCustom, true, tableInfo.projectId)
    // console.log('chataiData.treeData', chataiData.treeData)
    getEntityCustomByBaseId(tableInfo.projectId, true)
  }

  //删除表
  const deleteTable = (deleteTable: any) => {
    let parentIdCatlog = findNodeById(chataiData.treeData, !deleteTable.parentId ? deleteTable.projectId : deleteTable.parentId)
    if (parentIdCatlog) {
      parentIdCatlog.children = parentIdCatlog.children.filter((item) => item.id !== deleteTable.id)
      if (parentIdCatlog.children.length === 0) {
        parentIdCatlog.children = [
          {
            title: 'Empty',
            key: 'Empty' + deleteTable.parentId,
            children: [],
            fields: [],
            parentId: deleteTable.parentId,
          },
        ]
      }
    }
  }

  //移动模型
  const moveModel = (
    projectId: string,
    modelId: string,
    originalParentId: string,
    newParentId: string,
    prependToTableId: string,
  ) => {
    let findCatalog = chataiData.modelData.find((item) => item.id === modelId)
    if (findCatalog) {
      findCatalog.parentId = newParentId
    }
    let findModel = findNodeById(chataiData.modelTree, modelId)
    findModel.parentId = newParentId
    let originalParentIdCatlog = originalParentId
      ? findNodeById(chataiData.treeData, originalParentId)
      : findNodeById(chataiData.treeData, projectId)
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
    let newCatalog = newParentId ? findNodeById(chataiData.treeData, newParentId) : findNodeById(chataiData.treeData, projectId)
    if (newCatalog.children.length === 1 && newCatalog.children[0].key.indexOf('Empty') > -1) {
      newCatalog.children = [findModel]
      chataiData.treeData = _.cloneDeep(chataiData.treeData)
      return
    }
    if (prependToTableId) {
      let findIndex = newCatalog.children.findIndex((item) => item.id === prependToTableId)
      newCatalog.children.splice(findIndex, 0, findModel)
    } else {
      newCatalog.children.push(findModel)
    }
    chataiData.treeData = _.cloneDeep(chataiData.treeData)
  }

  //修改目录名称
  const updateCatalogName = (catalog: any, rename: string) => {
    let findCatalog = chataiData.modelData.find((item) => item.id === catalog.id)
    findCatalog.name = rename
    findCatalog.name_cn = rename

    let findCatalogById = findNodeById(chataiData.treeData, catalog.id)
    findCatalogById.name = rename
    findCatalogById.name_cn = rename
    findCatalogById.title = rename
    chataiData.treeData = _.cloneDeep(chataiData.treeData)

    chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false, '')
  }

  //创建目录
  const createCatalog = (catalog: any, projectId?: string) => {
    console.log('catalog', catalog)
    chataiData.modelData.push({ ...catalog })
    chataiData.modelCatalog.push({ ...catalog })
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false, '')
    let findCatalog = findNodeById(chataiData.treeData, projectId ? projectId : catalog.parentId)
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
    chataiData.treeData = _.cloneDeep(chataiData.treeData)
  }

  //移动目录
  const moveCatalog = (catalogId: string, originalParentId: string, newParentId: string, prependToTableId: string) => {
    updateData(catalogId, newParentId)
    let findCatalog = findNodeById(chataiData.modelTree, catalogId)
    findCatalog.parentId = newParentId
    let originalParentIdCatlog = findNodeById(chataiData.treeData, originalParentId)
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
    let newCatalog = findNodeById(chataiData.treeData, newParentId)
    if (newCatalog.children.length === 1 && newCatalog.children[0].key.indexOf('Empty') > -1) {
      newCatalog.children = [findCatalog]
      chataiData.treeData = _.cloneDeep(chataiData.treeData)
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
    chataiData.treeData = _.cloneDeep(chataiData.treeData)
  }

  //删除目录
  const deleteCatalog = (deleteCatalog: any) => {
    let parentIdCatlog = findNodeById(
      chataiData.treeData,
      !deleteCatalog.parentId ? deleteCatalog.projectId : deleteCatalog.parentId,
    )
    if (parentIdCatlog) {
      parentIdCatlog.children = parentIdCatlog.children.filter((item) => item.id !== deleteCatalog.id)
    }
  }

  //更新数据
  const updateData = (catalogId: string, newParentId: string) => {
    let findItem = chataiData.modelData.find((item) => item.id === catalogId)
    findItem.parentId = newParentId
    chataiData.modelCatalog = chataiData.modelData.filter((item) => item.isCatalog && item.id !== null)
    chataiData.modelCatalogTree = buildTree(chataiData.modelCatalog, false, '')
    chataiData.modelCatalogTree.forEach((node) => sortTreeNodesByOrderNo(node))
  }

  //修改项目
  const modifyProjectTitle = (projectId: string, newTitle: string) => {
    let findItem = chataiData.projectList.find((item) => item.id === projectId)
    if (findItem) findItem.title = newTitle
    let findProject = findNodeById(chataiData.treeData, projectId)
    if (findProject) findProject.title = newTitle
    chataiData.treeData = _.cloneDeep(chataiData.treeData)
  }

  //删除项目
  const deleteProjectByBaseId = (baseId: string) => {
    chataiData.projectList = chataiData.projectList.filter((item) => item.id !== baseId)
    chataiData.treeData = chataiData.treeData.filter((item) => item.id !== baseId)
  }

  //增加项目
  const addProject = (project: any) => {
    chataiData.treeData = [
      ...chataiData.treeData,
      {
        ...project,
        isProject: true,
        children: [
          {
            title: 'Empty',
            key: 'Empty' + project.id,
            children: [],
            fields: [],
            parentId: project.id,
            projectId: project.id,
          },
        ],
        key: project.id,
        projectId: project.id,
      },
    ]
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
    updateCatalogName,
    findNodeById,
    updateTableColumnName,
    createCatalog,
    moveModel,
    moveCatalog,
    getAllModel,
    initData,
    getTreeData,
    modifyProjectTitle,
    deleteCatalog,
    createTableToTreeData,
    deleteTable,
    getEntityCustomByBaseId,
    deleteProjectByBaseId,
    addProject,
  }
})
