import { acceptHMRUpdate, defineStore } from 'pinia'

export const useSmartDataStore = defineStore('smartDataStore', () => {
  const { $api } = useNuxtApp()
  const { ncNavigateTo } = useGlobal()
  const router = useRouter()
  const route = router.currentRoute

  const train = $api.smartData.train

  const navigateToPlayground = () => {
    const baseId = route.value.params.baseId as string
    router.push({
      name: `index-typeOrId-baseId-playground`,
      params: {
        baseId: baseId,
      },
    })
  }

  const navigateToComingSoon = () => {
    navigateTo('/coming-soon')
  }

  return { train, navigateToPlayground, navigateToComingSoon }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSmartDataStore as any, import.meta.hot))
}
