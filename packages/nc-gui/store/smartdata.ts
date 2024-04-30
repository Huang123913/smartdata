import { acceptHMRUpdate, defineStore } from 'pinia'

export const useSmartDataStore = defineStore('smartDataStore', () => {
  const { $api } = useNuxtApp()
  const train = $api.smartData.train

  return { train }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSmartDataStore as any, import.meta.hot))
}
