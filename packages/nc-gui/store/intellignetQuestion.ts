import { defineStore } from 'pinia'

export const useIntelligentQuestionStore = defineStore('intelligentQuestionStore', () => {
  const { activeTableId } = storeToRefs(useTablesStore())
  const { $api } = useNuxtApp()
  const baseUrl = ref('')
  const { width } = useWindowSize()

  const { isMobileMode } = useGlobal()

  const tablesStore = useTablesStore()

  const _conversationId = ref<{ [key: string]: any }>({})

  const conversationId = computed({
    get() {
      return _conversationId.value
    },
    set(value) {
      _conversationId.value[value.key as string] = value.value
    },
  })

  const _isIntelligentQuestionOpen = ref(false)

  const isIntelligentQuestionOpen = computed({
    get() {
      return (isMobileMode.value && !tablesStore.activeTableId) || _isIntelligentQuestionOpen.value
    },
    set(value) {
      _isIntelligentQuestionOpen.value = value
    },
  })

  const intelligentQuestionSize = computed(() => {
    return isIntelligentQuestionOpen.value ? 30 : 0
  })

  const mobileNormalizedIntelligentQuestionSize = computed(() => {
    if (isMobileMode.value) {
      return isIntelligentQuestionOpen.value ? 100 : 0
    }
    return intelligentQuestionSize.value
  })

  const intelligentQuestionWidth = computed(() => (width.value * mobileNormalizedIntelligentQuestionSize.value) / 100)

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

  return {
    dialogList,
    intelligentQuestionWidth,
    isIntelligentQuestionOpen,
    intelligentQuestionSize,
    mobileNormalizedIntelligentQuestionSize,
    baseUrl,
    getBaseUrl,
    conversationId,
  }
})
