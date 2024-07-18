import axios, { type AxiosInstance } from 'axios';
import FormData from 'form-data';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { v4 as uuidv4 } from 'uuid';
import { MCDMService } from '~/services/smartdata/mcdm.service';
import { Injectable, Logger } from '@nestjs/common';
const fs = require('fs').promises;
const path = require('path');
@Injectable()
export class LLMService {
  protected logger = new Logger(LLMService.name);

  protected llm: AxiosInstance = axios.create({
    baseURL: process.env.LLM_URL,

    httpAgent: process.env.LLM_PROXY
      ? new SocksProxyAgent(process.env.LLM_PROXY)
      : undefined,

    httpsAgent: process.env.LLM_PROXY
      ? new SocksProxyAgent(process.env.LLM_PROXY)
      : undefined,
  });

  constructor(protected readonly mcdm: MCDMService) {
    if (!process.env.LLM_URL) {
      throw new Error(
        `找不到环境变量 'LLM_URL', 请在 'packages/nocodb/.env' 中指定`,
      );
    }

    this.llm.interceptors.request.use((config) => {
      this.logger.debug(`${config.method} ${config.url}`);
      let projectid = process.env.LLM_PROJECTID ?? '2';
      let orgid = process.env.LLM_ORGID ?? '2';
      if (config?.data) {
        config.data.projectid = projectid;
        config.data.orgid = orgid;
      } else if (config?.params) {
        config.params.projectid = projectid;
        config.params.orgid = orgid;
      }
      return config;
    });

    this.llm.interceptors.response.use(
      (r) => r,
      (r) => {
        if (!r.response?.data) throw r;
        const message = r.response.data;
        const { method, baseURL, url, params, data, headers } = r.config;
        const config = { method, baseURL, url, params, data, headers };
        this.logger.error(r.message, { message, config });
        throw r;
      },
    );
  }

  async train() {
    await this.deleteTrainData();
    const wait = (time: number) =>
      new Promise((resolve) => setTimeout(resolve, time));
    const result = [];
    const entities = await this.mcdm.getEntities();
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.isCatalog == true) continue;
      const trainResult = await this.trainByEntityId(entity.id);
      result.push(trainResult);
      await wait(800);
    }
    return result;
  }

  async trainByEntityId(entityId: string) {
    const result = Object.create({ id: entityId });
    const entities = await this.mcdm.getEntity(entityId);
    if (!entities.length) return undefined;
    const entity = entities[0];
    const entityProps = entity?.props;
    let ddlProp = null;
    if (entityProps)
      ddlProp = entityProps.findLast((p) => p.code == 'belongDdlId');
    const ddl = await this.mcdm.getDDL(entityId);
    const trainrRes = await this.trainByDDL(ddl);
    if (trainrRes) {
      let saveDdlProps = [
        {
          id: entityId,
          props: [
            {
              id: ddlProp ? ddlProp.id : null,
              name: 'belongDdlId',
              code: 'belongDdlId',
              value: trainrRes.id,
            },
          ],
        },
      ];
      result.saveDdlPropsRes = await this.mcdm.saveModel({
        entities: saveDdlProps,
      });
    }
    result.ddl = ddl;

    // const entity = entities[0];
    // const props = entity.props;
    // const sqlProp = props.find((p) => p.code == 'belongSQL');
    // const promptProp = props.find((p) => p.code == 'belongQuestion');
    // if (sqlProp && promptProp) {
    //   try {
    //     const sql = JSON.parse(sqlProp.jsonValue).sql;
    //     const prompt = JSON.parse(promptProp.jsonValue).question;
    //     await this.trainByPrompt(sql, prompt);
    //     result.sql = sql;
    //     result.prompt = prompt;
    //   } catch {}
    // }

    return result;
  }

  async trainByDDL(ddl: string) {
    return await this.llm({
      method: 'POST',
      url: `/train`,
      params: { id: uuidv4(), ddl },
    }).then((r) => {
      return r.data;
    });
  }

  async trainByPrompt(sql: string, prompt: string) {
    return await this.llm({
      method: 'POST',
      url: `/train`,
      params: {
        id: uuidv4(),
        question: prompt,
        sql: sql,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async deleteTrainData(types?: Array<'ddl' | 'sqlquestion' | 'doc'>) {
    const deftypes = ['ddl', 'sqlquestion'];
    return await this.llm({
      method: 'POST',
      url: `/cleartrain`,
      params: {
        types: JSON.stringify(types ?? deftypes),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async translate(text: string) {
    return await this.llm({
      method: 'POST',
      url: '/translate',
      params: {
        id: uuidv4(),
        orgid: '1',
        word: text,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async createTableByAskingQuestion(params: {
    selectedModel: string;
    question: string;
    ischoose: boolean;
  }) {
    let { selectedModel, question, ischoose } = params;
    let modelList = await this.getModelrange(JSON.parse(selectedModel));
    let modelrange = JSON.stringify({
      ischoose: ischoose,
      modellist: modelList,
    });
    let getSqlRes = await this.getSql(question, modelrange);
    if (getSqlRes) {
      let sql = getSqlRes.text;
      let sqlId = getSqlRes.id;
      if (sql.indexOf('SELECT') === -1)
        return { isSqlErr: true, sqlErrTip: sql };
      sql = sql.replace(/;/g, '');
      let exeSqlRes = await this.mcdm.exeSql({ sql });
      let isExeFailed = !exeSqlRes?.success || !exeSqlRes?.data?.success;
      if (isExeFailed) {
        let isVsqlErr =
          exeSqlRes?.exceptionType &&
          exeSqlRes?.exceptionType.indexOf('VSQL') > -1;
        if (isVsqlErr)
          return {
            isSqlExeErrOfVSQL: true,
            data: { fields: [], datas: [] },
            sql: sql,
            sqlExeRes: exeSqlRes,
          };
        let err_msg = exeSqlRes?.success
          ? exeSqlRes?.data.errorDetail
          : exeSqlRes?.data.errorDetail.allStackMsg;
        let newExeRes = await this.repeatRepair(sqlId, err_msg, question);
        if (!newExeRes?.success || !newExeRes?.data.success) {
          return {
            isRepairSuccess: false,
            success: false,
            data: { fields: [], datas: [] },
            sql: sql,
            sqlExeRes: exeSqlRes,
          };
        }
        exeSqlRes = newExeRes;
      } else {
        exeSqlRes.sql = sql;
      }
      return exeSqlRes;
    }
  }

  async getSql(question: string, modelrange: string) {
    return await this.llm({
      method: 'POST',
      url: `/ask`,
      data: {
        question,
        id: uuidv4(),
        modelrange,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async repair(id: string, error_msg: string, question: string) {
    return await this.llm({
      url: `/repair`,
      params: {
        id,
        error_msg,
        question,
      },
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    }).then((r) => {
      return r.data;
    });
  }

  async getModelrange(selectedModel: any[]) {
    let modelrange = [];
    modelrange = selectedModel.map((model) => {
      let props = [];
      if (model?.fields && model.fields.length) {
        props = model.fields.map((field) => {
          return { prop_name: field.fieldName };
        });
      }
      return { model_name: model.name, props };
    });
    return JSON.stringify(modelrange);
  }

  async repeatRepair(
    id: string,
    error_msg: string,
    question: string,
    maxRetries: number = 3,
  ) {
    let retriesCount = 0;
    let returnRes = null;
    while (retriesCount < maxRetries) {
      try {
        let response: any = this.repair(id, error_msg, question);
        if (response.text.indexOf('SELECT') > -1) {
          let sql = response.text.replace(/;/g, '');
          let result: any = await this.mcdm.exeSql({ sql });
          if (result?.success && result?.data.success) {
            result.sql = sql;
            return result;
          } else {
            retriesCount++;
            let isVsqlErr =
              result?.exceptionType &&
              result?.exceptionType.indexOf('VSQL') > -1;
            if (isVsqlErr) {
              returnRes = result;
            } else {
              let err_msg: string = result?.success
                ? result?.data.errorDetail
                : result?.data.errorDetail.allStackMsg;
              if (maxRetries - retriesCount > 0) {
                let repeateRes = await this.repeatRepair(
                  response.id,
                  err_msg,
                  question,
                  maxRetries - retriesCount,
                );
                returnRes = repeateRes;
              } else {
                returnRes = result;
              }
            }
          }
        } else {
          retriesCount++;
          returnRes = { success: false };
        }
      } catch (error) {
        retriesCount++;
      }
    }
    return returnRes;
  }

  async publicModelToCatalog(params: {
    tableData: string;
    sql: string;
    question: string;
    modelName: string;
    belongCatalog: string;
    belongSQLDataRefreshPlan: object;
    belongSQLDataType: string;
  }) {
    let {
      tableData,
      sql,
      question,
      modelName,
      belongCatalog,
      belongSQLDataRefreshPlan,
      belongSQLDataType,
    } = params;
    let tableDataObj = JSON.parse(tableData);
    let tableDatas = tableDataObj.datas ?? [];
    let tableFields = tableDataObj.fields ?? [];
    let fields = tableFields.map((item) => {
      return {
        id: uuidv4(),
        fieldCode: item.code,
        fieldName: item.name,
        fieldName_cn: item.name_cn || item.name,
        fieldSysDataType: item.sysDataType,
        fieldPrecision: item.fieldPrecision,
        scale: item.scale,
      };
    });
    let entitieId = uuidv4();
    let translatedModel = await this.translate(modelName);
    translatedModel = translatedModel.replace(/\s/g, '');
    let entities = [
      {
        id: entitieId,
        name: translatedModel,
        code: `query_entity_${Date.now()}`,
        name_cn: modelName,
        belongCatalog,
        props: [
          {
            name: 'belongSQL',
            code: 'belongSQL',
            jsonValue: JSON.stringify({ sql }),
          },
          {
            name: 'belongQuestion',
            code: 'belongQuestion',
            jsonValue: JSON.stringify({ question }),
          },
          {
            name: 'belongSQLDataRefreshPlan',
            code: 'belongSQLDataRefreshPlan',
            jsonValue: JSON.stringify(belongSQLDataRefreshPlan),
          },
          {
            name: 'belongSQLDataType',
            code: 'belongSQLDataType',
            value: belongSQLDataType,
          },
        ],
        fields,
      },
    ];
    // 保存模型
    await this.mcdm.saveModel({ entities: entities });
    // 发布模型
    let generateMDTableResutl = await this.mcdm.generateMDTable(entitieId);
    let tableInfoRes = generateMDTableResutl?.tableInfo
      ? generateMDTableResutl?.tableInfo[0]
      : null;
    //查有数据就往表里插入数据
    if (tableInfoRes && tableDatas.length) {
      let datas = tableDatas.map((item: object) => ({
        ...item,
        id: uuidv4(),
      }));
      let { componentCode, tableName } = tableInfoRes;
      await this.mcdm.batchInsertOrUpdate(componentCode, tableName, datas);
    }
    // 生成ddl
    let generatedDDL = await this.mcdm.getDDL(entitieId);
    if (generatedDDL) {
      let ddl = await this.trainByDDL(generatedDDL);
      // await this.llm.trainByPrompt(sql, question);
      if (ddl) {
        let savePropsEntities = [
          {
            id: entitieId,
            props: [
              {
                name: 'belongDdlId',
                code: 'belongDdlId',
                value: ddl.id,
              },
            ],
          },
        ];
        await this.mcdm.saveModel({ entities: savePropsEntities });
      }
    }
    return { success: true };
  }

  async retraining(params: { isUpdate: boolean; entityId: string }) {
    let { isUpdate, entityId } = params;
    const entities = await this.mcdm.getEntity(entityId);
    const entity = entities[0];
    let result: null;
    const entityProps = entity.props;
    const ddlProp = entityProps.findLast((p) => p.code == 'belongDdlId');
    if (ddlProp && ddlProp.value)
      result = await this.removetrainbyids([ddlProp.value]);
    if (isUpdate) {
      result = await this.trainByEntityId(entityId);
    }
    return result;
  }

  async removetrainbyids(ids: string[]) {
    return await this.llm({
      method: 'POST',
      url: '/removetrainbyids',
      params: {
        ids: JSON.stringify(ids),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async analyzingHeadersGenerateTable(tableHeader: string) {
    return await this.llm({
      method: 'POST',
      url: '/AnalyzingHeadersGenerateTable',
      data: {
        id: uuidv4(),
        table_headers: tableHeader,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async intelligentImport(params: {
    tableId: string;
    tableHeader: string;
    allTableMode: string;
  }) {
    let { tableId, tableHeader, allTableMode } = params;
    let modelList = await this.getModelrange(JSON.parse(allTableMode));
    let tableHeaderObj = JSON.parse(tableHeader);
    let tableHeaders = {
      ...tableHeaderObj,
      modelrange: {
        ischoose: false,
        modellist: JSON.parse(modelList),
      },
    };
    let exeRes = await this.analyzingHeadersGenerateTable(
      JSON.stringify(tableHeaders),
    );
    if (exeRes && exeRes.text.indexOf('SELECT') > -1) {
      let sql = exeRes.text.replace(/;/g, '');
      let sqlId = exeRes.id;
      let exeSqlRes = await this.mcdm.exeSql({ sql });
      let entities = await this.mcdm.getEntity(tableId);
      const entity = entities.length ? entities[0] : null;
      const entityProps = entity ? entity?.props : null;
      if (entityProps) {
        let belongIntelligentImportSQLProp = entityProps.findLast(
          (p) => p.code == 'belongIntelligentImportSQLId',
        );
        let savedValue = belongIntelligentImportSQLProp
          ? [...JSON.parse(belongIntelligentImportSQLProp.jsonValue), sqlId]
          : [sqlId];
        let saveDdlProps = [
          {
            id: tableId,
            props: [
              {
                id: belongIntelligentImportSQLProp
                  ? belongIntelligentImportSQLProp.id
                  : null,
                name: 'belongIntelligentImportSQLId',
                code: 'belongIntelligentImportSQLId',
                jsonValue: JSON.stringify(savedValue),
              },
            ],
          },
        ];
        await this.mcdm.saveModel({ entities: saveDdlProps });
      }
      exeSqlRes.sql = sql;
      exeSqlRes.sqlId = sqlId;

      return exeSqlRes;
    }
    return exeRes;
  }

  async toBeProcessed(params: {
    entityId: string;
    columnsJson: string;
    fileId: string;
  }) {
    let { entityId, columnsJson, fileId } = params;
    let llmFile = await this.embeddingparquet(columnsJson, fileId);
    const formData = new FormData();
    formData.append('file', llmFile, `${uuidv4()}.parquet`);
    let uploadFileInfo = await this.mcdm.uploadFileNew(formData);
    let res = await this.mcdm.receiveProcessedSemanticAnalysisFileIds([
      {
        entityId,
        toBeProcessedFileId: fileId,
        processedFileId: uploadFileInfo.id,
      },
    ]);
    return res;
  }

  //数据向量化
  async embeddingparquet(columnsJson: string, fileId: string) {
    let orgid = process.env.LLM_ORGID ?? '2';
    let mcdmFile = await this.mcdm.downLoadFile(fileId);
    const formData = new FormData();
    formData.append('file', mcdmFile, `${fileId}.parquet`);
    formData.append('id', uuidv4());
    formData.append('columns', columnsJson);
    formData.append('orgid', orgid);
    return await this.llm({
      method: 'POST',
      url: `/embeddingparquet`,
      data: formData,
      responseType: 'stream', // 确保返回数据是一个流
    }).then((r) => {
      return r.data;
    });
  }

  //语义搜索
  async semanticSearch(params: { text: string }) {
    let res = await this.embeddingtext(params.text);
    return res;
  }

  //文本向量化
  async embeddingtext(text: string) {
    return await this.llm({
      method: 'POST',
      url: `/embeddingtext`,
      params: {
        id: uuidv4(),
        text: text,
      },
    }).then((r) => {
      return r.data;
    });
  }
}
