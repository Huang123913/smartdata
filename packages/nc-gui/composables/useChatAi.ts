function useChatAi() {
  const { $api } = useNuxtApp()

  const exeSql = async (sql: string) => {
    try {
      let result: any = await $api.smartData.exeSql({ sql })
      if (result?.success && result?.data.success) {
        let fields = result?.data?.fields ?? []
        let datas = result?.data?.datas ?? []
        return { success: true, fields, datas }
      } else {
        if (!result?.success) {
          return { success: false, errorDetail: result?.data?.errorDetail?.allStackMsg, isRepair: true }
        }
        if (!result?.data?.success) {
          return { success: false, errorDetail: result?.data?.errorDetail, isRepair: false }
        }
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  return { exeSql }
}

export default useChatAi
