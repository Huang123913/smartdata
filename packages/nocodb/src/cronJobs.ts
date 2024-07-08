import { Api } from 'nocodb-sdk';
import cron from 'node-cron';

let entityIdData: string[] = [];
export function setEntityIdData(isAdd: boolean, id: string) {
  if (isAdd) {
    !entityIdData.includes(id) && entityIdData.push(id);
  } else {
    if (entityIdData.includes(id))
      entityIdData = entityIdData.filter((item) => item !== id);
  }
  return true;
}

export async function startCronJobs() {
  const api = new Api({
    baseURL: process.env.NC_PUBLIC_URL || 'http://localhost:8080',
  });
  // 定义定时任务 每隔一小时 跳过0点 0 1-23/1 * * *
  cron.schedule('0 1-23/1 * * *', async () => {
    let continueEntity = [];
    try {
      return;
      let response =
        await api.smartData.getToBeProcessedSemanticAnalysisFileIds();
      let toBeProcessed = response.toBeProcessed;
      if (toBeProcessed?.length) {
        for (let index = 0; index < toBeProcessed.length; index++) {
          const item = toBeProcessed[index];
          if (entityIdData.includes(item.entityId)) {
            continueEntity.push(item.entityId);
            continue;
          }
          await api.smartData.toBeProcessed({
            entityId: item.entityId,
            columnsJson: item.columnsJson,
            fileId: item.fileId,
          });
        }
        if (continueEntity.length) {
          continueEntity.map((item) => setEntityIdData(false, item));
        }
      }
    } catch (error) {
      console.error('Error calling the SmartData API:', error);
    }
  });
}
