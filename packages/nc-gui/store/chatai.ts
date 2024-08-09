import { defineStore } from 'pinia'

export const useChataiStore = defineStore('chataiStore', () => {
  const { base } = storeToRefs(useBase())
  const { buildTree } = useChatPlaygroundViewStore()
  const { $api } = useNuxtApp()
  const chataiData = reactive<{
    catalogAndTables: any[]
    treeData: any[]
    checkedTable: any[]
    detailedTables: any[]
    allTableData: any[]
  }>({
    catalogAndTables: [],
    treeData: [],
    checkedTable: [],
    detailedTables: [],
    allTableData: [],
  })

  const eventBusToChatai = useEventBus<ChataiStoreEvents>(Symbol('chataiStore'))

  //会话id
  const _conversationId = ref<{ [key: string]: any }>({})
  const conversationId = computed({
    get() {
      return _conversationId.value
    },
    set(value) {
      _conversationId.value = value.value
    },
  })

  const _dialogList = ref<any[]>([])
  const dialogList = computed({
    get() {
      return _dialogList.value
    },
    set(value) {
      _dialogList.value = value
    },
  })

  const _isOpenTableTree = ref(false)
  const isOpenTableTree = computed({
    get() {
      return _isOpenTableTree.value
    },
    set(value) {
      _isOpenTableTree.value = value
    },
  })

  const _sessionTable = ref<any[]>([])
  const sessionTable = computed({
    get() {
      return _sessionTable.value
    },
    set(value) {
      _sessionTable.value = value
    },
  })

  const initData = async (projectid: string = '', tableIds: string[] = []) => {
    let bizCatalogEntityCustom = await $api.smartData.entities()
    if (!bizCatalogEntityCustom.length) return
    bizCatalogEntityCustom = bizCatalogEntityCustom.map((item) => ({ ...item, parentId: item.parentId ? item.parentId : null }))
    chataiData.allTableData = bizCatalogEntityCustom.filter((item) => !item.isCatalog)
    chataiData.catalogAndTables = [
      ...bizCatalogEntityCustom,
      {
        id: null,
        name_cn: '表格目录',
        parentId: '',
        isCatalog: true,
        title: '表格目录',
        key: '0-0',
      },
    ]
    chataiData.treeData = [
      {
        id: null,
        name_cn: '表格目录',
        parentId: 'add-catalog',
        isCatalog: true,
        children: buildTree(bizCatalogEntityCustom, false),
        title: '表格目录',
        key: '0-0',
      },
    ]
    await getTablesInfo()
    await createNewSession(tableIds)
    sessionTable.value = []
  }

  const getTablesInfo = async () => {
    chataiData.detailedTables = await $api.smartData.findAllBizCustomEntity({
      isShowFields: true,
      isShowEntityProps: false,
      isShowFieldProps: false,
    })
  }

  // 删除模型
  const deleteCheckedTable = (ids: string[]) => {
    console.log('ids', ids)
    chataiData.detailedTables = chataiData.detailedTables.filter((item) => !ids.includes(item.id))
    sessionTable.value = sessionTable.value.filter((item) => !ids.includes(item.id))
  }

  const createNewSession = async (tableIds: string[], isBrandNew: boolean = true) => {
    let datafiles = []
    // if (!tableIds.length) tableIds = ['9bfecca0-1e50-4ca9-8431-0278e5df61c1', 'ff8081818ff1e033018ff1e8236120f1']
    for (let index = 0; index < tableIds.length; index++) {
      let tableData: { [key: string]: any } = {}
      let fieldDescriptions: { [key: string]: any } = {}
      let findTable = chataiData.detailedTables.find((item) => item.id === tableIds[index])
      findTable.fields.map((item) => {
        if (!item.isSystem) {
          fieldDescriptions[item.fieldName!] = item.fieldName_cn
          tableData[item.fieldName!] = []
        }
      })
      let response = await $api.dbViewRow.list('noco', base.value.id!, tableIds[index]!, tableIds[index]!)
      let tableDataRes = response?.list
      tableDataRes.map((item) => {
        for (const key in tableData) {
          tableData[key].push(item[fieldDescriptions[key]])
        }
      })
      datafiles.push({
        data: tableData,
        field_descriptions: fieldDescriptions,
        name: findTable.name,
      })
    }
    console.log('datafiles', datafiles)
    // let createSessionRes = await $api.smartData.createSession({
    //   entityId: '',
    //   datafiles: JSON.stringify(datafiles),
    //   isOnlySubmitdata: true,
    // })
    // if (createSessionRes?.conversation_id) {
    //   conversationId.value = createSessionRes.conversation_id
    // }
    if (isBrandNew) dialogList.value = []
  }

  //获取勾选的表格
  const getCheckedTableData = (checkedKeys: string[]) => {
    chataiData.checkedTable = checkedKeys
      .map((checkedKey) => {
        let findNode = chataiData.catalogAndTables.find((item) => item.id === checkedKey)
        if (!findNode) findNode = { isCatalog: true, id: null }
        return findNode
      })
      .filter((item) => !item.isCatalog)
  }

  return {
    chataiData,
    initData,
    conversationId,
    dialogList,
    createNewSession,
    isOpenTableTree,
    getCheckedTableData,
    sessionTable,
    deleteCheckedTable,
    eventBusToChatai,
  }
})
