import axios, { type AxiosInstance } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { v4 as uuidv4 } from 'uuid';
import { MCDMService } from '~/services/smartdata/mcdm.service';

import { Injectable, Logger } from '@nestjs/common';

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
      config.params.projectid = process.env.LLM_PROJECTID ?? 2;
      config.params.orgid = process.env.LLM_ORGID ?? 2;
      return config;
    });

    this.llm.interceptors.response.use(
      (r) => r,
      (r) => {
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
      url: `/ask`,
      params: {
        question,
        id: uuidv4(),
        modelrange,
      },
      headers: {
        'ngrok-skip-browser-warning': 'true',
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
    for (let i = 0; i < selectedModel.length; i++) {
      let modelItem = selectedModel[i];
      if (modelItem?.fields && modelItem.fields.length === 0) {
        let modelInfo = await this.mcdm.getEntity(modelItem.id);
        let fields = modelInfo.length ? modelInfo[0].fields : [];
        modelItem.fields = fields;
      }
    }
    modelrange = selectedModel.map((model) => {
      let props = [];
      if (model.fields.length) {
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
      params: {
        id: uuidv4(),
        table_headers: tableHeader,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async intelligentImport(params: {
    tableHeader: string;
    allTableMode: string;
  }) {
    let { tableHeader, allTableMode } = params;
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
    if (exeRes && typeof exeRes === 'string' && exeRes.indexOf('SELECT') > -1) {
      let sql = exeRes.replace(/;/g, '');
      let exeSqlRes = await this.mcdm.exeSql({ sql });
      exeSqlRes.sql = sql;
      return exeSqlRes;
    }
    return exeRes;
  }
}
