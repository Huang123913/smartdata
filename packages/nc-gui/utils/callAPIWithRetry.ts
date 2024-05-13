import chataiApi from '../api/chatai'

async function callRepairWithRetry(id: string, error_msg: string, question: string, maxRetries = 3) {
  let retries = 0
  let returnRes = null
  while (retries < maxRetries) {
    try {
      const response: any = await chataiApi.repair(id, error_msg, question)
      if (response.text.indexOf('SELECT') > -1) {
        let sql = response.text.replace(/;/g, '')
        let result: any = await chataiApi.exeSql({ sql })
        if (result?.success && result?.data.success) {
          result.sql = sql
          return result
        } else {
          returnRes = result
          retries++
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } else {
        retries++
        returnRes = {
          data: {
            datas: [],
            fields: [],
          },
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      retries++
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  return returnRes
}

export { callRepairWithRetry }
