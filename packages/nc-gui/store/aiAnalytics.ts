import { defineStore } from 'pinia'

//智能分析
export const useaiAnalyticsStore = defineStore('useaiAnalyticsStore', () => {
  const baseUrl = ref('')
  const { $api } = useNuxtApp()
  const { width } = useWindowSize()
  const { isMobileMode } = useGlobal()
  const tablesStore = useTablesStore()

  //会话id
  const _conversationId = ref<{ [key: string]: any }>({})
  const conversationId = computed({
    get() {
      return _conversationId.value
    },
    set(value) {
      _conversationId.value[value.key as string] = value.value
    },
  })

  //是否打开智能提问
  const _isIntelligentQuestionOpen = ref(false)
  const isIntelligentQuestionOpen = computed({
    get() {
      return (isMobileMode.value && !tablesStore.activeTableId) || _isIntelligentQuestionOpen.value
    },
    set(value) {
      _isIntelligentQuestionOpen.value = value
    },
  })

  //占据页面的宽度占比
  const intelligentQuestionSize = computed(() => {
    return isIntelligentQuestionOpen.value ? 30 : 0
  })

  //移动/PC占据页面的宽度占比
  const mobileNormalizedIntelligentQuestionSize = computed(() => {
    if (isMobileMode.value) {
      return isIntelligentQuestionOpen.value ? 100 : 0
    }
    return intelligentQuestionSize.value
  })

  //具体宽度
  const intelligentQuestionWidth = computed(() => (width.value * mobileNormalizedIntelligentQuestionSize.value) / 100)

  //对话列表
  const dialogList = ref<{ [key: string]: any }>({})
  const setDialogList = (key: string, value: any) => {
    if (dialogList.value[key]) dialogList.value[key].push(value)
    else {
      dialogList.value[key] = [value]
    }
  }
  const deleteDialogList = (tableId: string, isCleanAll: boolean, deleteId: string) => {
    if (isCleanAll) {
      dialogList.value[tableId] = []
      return
    }
    dialogList.value[tableId] = dialogList.value[tableId].filter((item) => item.id !== deleteId)
  }

  //对话列表
  const tableNameList = ref<{ [key: string]: any }>({})
  const setTableNameList = (key: string, value: any) => {
    tableNameList.value[key] = value
  }

  // 历史记录
  const historySessionRecords = ref<{ [key: string]: any }>({})

  //正在发送请求的会话表格
  const sendingTable = ref<{ [key: string]: any }>({})
  const setSendingTable = (conversationId: string, tableId: string) => {
    sendingTable.value[conversationId] = tableId
  }

  const getBaseUrl = async () => {
    baseUrl.value = await $api.smartData.getBaseUrl()
  }

  const _meta = ref<any>(null)

  const metaData = computed({
    get() {
      return _meta.value
    },
    set(value) {
      _meta.value = value
    },
  })

  return {
    dialogList,
    intelligentQuestionWidth,
    isIntelligentQuestionOpen,
    intelligentQuestionSize,
    mobileNormalizedIntelligentQuestionSize,
    baseUrl,
    getBaseUrl,
    conversationId,
    metaData,
    sendingTable,
    setSendingTable,
    setDialogList,
    deleteDialogList,
    setTableNameList,
    tableNameList,
  }
})
