import { defineStore } from 'pinia'

//智能分析
export const useaiAnalyticsStore = defineStore('useaiAnalyticsStore', () => {
  const baseUrl = ref('')
  const { $api } = useNuxtApp()
  const { width } = useWindowSize()
  const { isMobileMode } = useGlobal()
  const tablesStore = useTablesStore()
  const { activeTableId } = storeToRefs(useTablesStore())

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
  const _dialogList = ref<{ [key: string]: any }>({})
  const dialogList = computed({
    get() {
      return _dialogList.value[activeTableId.value!] ? _dialogList.value[activeTableId.value!] : []
    },
    set(value) {
      _dialogList.value[value.key as string] = value.value
    },
  })

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
  }
})
