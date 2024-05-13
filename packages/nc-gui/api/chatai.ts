import request from './request'

export interface ExeSqlParams {
  sql: string
  params?: object
}

//获取sql
const getSqlApi = async (question: string, id: string, modelrange: any[]) => {
  return await request.get('/api/v0/ask', {
    baseURL: 'https://a7aa-14-123-254-4.ngrok-free.app',
    params: {
      question,
      id,
      orgid: 1,
      projectid: 1,
      modelrange: JSON.stringify(modelrange),
    },
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  })
}

//执行sql查询
// 对已发布的业务模型执行SQL查询。
// 其中params参数非必填，若sql语句有变量的时候，才需要填。
// 如果sql是不包含变量":xxx"的纯字符串，则不需要传params。
// "sql": "select * from simulate_biz_entity_700 where field1 = :variable1 and field2 = :variable2",
//     "params": {
//         "variable1" : "0001",
//         "variable2" : "0002"
//     }
const exeSql = async (data: ExeSqlParams) => {
  return await request.post('/webapi/innersysapi/VMcdmDataServiceWebApi/queryBizCustomEntityData', data)
}

// 获取模型-树形查询自定义模型目录
const getCustomCatalogEntityTree = async () => {
  let data = {
    customGroupId: null,
    customOwnerId: null,
    catalogId: '',
    isCascade: true,
    isPublish: true,
  }
  return await request.post('/webapi/ydg_vmcdm_custom_api/getCustomCatalogEntityTree', data)
}

//查询模型 通过id查询模型，多个用逗号分割
const findBizCustomEntity = async (modelId: string) => {
  return await request.post('/webapi/innersysapi/VMcdmDataServiceWebApi/findBizCustomEntity', {
    entityIds: modelId,
  })
}

//保存模型
const saveModel = async (data: object) => {
  return await request.post('/webapi/innersysapi/VMcdmDataServiceWebApi/saveBizCustomEntity', data)
}

//发布模型-通过id发布模型，多个用逗号分割
const publishModel = async (entityIds: string) => {
  return await request.post('/webapi/innersysapi/VMcdmDataServiceWebApi/saveBizCustomEntity', { entityIds })
}

//批量插入或者更行数据
const batchInsertOrUpdate = async (componentCode: string, tableName: string, datas: any[]) => {
  return await request.post(`/restapi/bizentity/data/${componentCode}/${tableName}/batchInsertOrUpdate`, { datas })
}

//生成ddl-通过模型id，生成DDL语句。多个用逗号分割
//模型必须要先部署成功，才可以调用生成DDL语句。
//一般情况下请求参数detial可以不传，若传入"detail": true则会额外返回detail属性返回详细ddl信息。
const generateDDL = async (entityIds: string) => {
  return await request.post('/webapi/innersysapi/VMcdmDataServiceWebApi/generateDDL', {
    entityIds: entityIds,
    detail: false,
  })
}

// 模型训练接口
const trainModel = async (data: any) => {
  return await request.post(`/api/v0/train?${new URLSearchParams(data).toString()}`, {
    baseURL: 'https://a7aa-14-123-254-4.ngrok-free.app',
  })
}

const repair = async (id: string, error_msg: string, question: string) => {
  return await request.get('/api/v0/repair', {
    baseURL: 'https://a7aa-14-123-254-4.ngrok-free.app',
    params: {
      id,
      orgid: 1,
      projectid: 1,
      error_msg,
      question,
    },
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  })
}

// 获取模型对应的物理表信息
const findMDTableInfo = async (entityIds: string) => {
  return await request.post('/webapi/innersysapi/VMcdmDataServiceWebApi/findMDTableInfo', {
    entityIds: entityIds,
  })
}

export default {
  batchInsertOrUpdate,
  exeSql,
  findBizCustomEntity,
  generateDDL,
  getCustomCatalogEntityTree,
  getSqlApi,
  publishModel,
  saveModel,
  trainModel,
  repair,
  findMDTableInfo,
}
