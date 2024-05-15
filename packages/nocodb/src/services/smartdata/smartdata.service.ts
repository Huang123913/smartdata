import axios, { type AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SmartDataService {
  protected llm = axios.create({
    baseURL:
      process.env.LLM_URL ?? `https://a7aa-14-123-254-4.ngrok-free.app/api/v0`,
  });

  protected mcdm: AxiosInstance = axios.create({
    method: 'POST',
    baseURL: process.env.MCDM_URL ?? `http://databoard-test.yindangu.com`,
  });

  isMcdmRewrite() {
    return process.env?.MCDM_URL == null ? false : true;
  }

  async mcdmRewrite(operation: string, req: Request) {
    return await this.mcdm({
      url: '/module-operation!executeOperation',
      params: {
        operation,
        ...req.params,
        ...req.query,
      },
      data: req.body,
    }).then((r) => r.data);
  }

  async train() {
    await this.deleteTrainData();

    const result = [];
    const entities = await this.getEntities();
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.isCatalog == true) continue;

      const trainResult = await this.trainByEntityId(entity.id);
      result.push(trainResult);
    }
    return result;
  }

  async trainByEntityId(entityId: string) {
    const result = Object.create({ id: entityId });
    const entities = await this.getEntity(entityId);
    if (!entities.length) return undefined;

    const entity = entities[0];
    const ddl = await this.getDDL(entityId);
    await this.trainByDDL(ddl);
    result.ddl = ddl;

    const props = entity.props;
    const sqlProp = props.find((p) => p.code == 'belongSQL');
    const promptProp = props.find((p) => p.code == 'belongQuestion');
    if (sqlProp && promptProp) {
      try {
        const sql = JSON.parse(sqlProp.jsonValue).sql;
        const prompt = JSON.parse(promptProp.jsonValue).question;
        await this.trainByPrompt(sql, prompt);
        result.sql = sql;
        result.prompt = prompt;
      } catch {}
    }

    return result;
  }

  async trainByDDL(ddl: string) {
    return await this.llm({
      method: 'POST',
      url: `/train`,
      params: { id: uuidv4(), ddl, orgid: '1', projectid: '1' },
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
        orgid: '1',
        projectid: '1',
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
        orgid: '1',
        projectid: '1',
        types: JSON.stringify(types ?? deftypes),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async getEntity(entityId: string) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/findBizCustomEntity`,
      data: {
        entityIds: entityId,
      },
    }).then((r) => {
      return r.data.data.datas ?? [];
    });
  }

  async getEntities() {
    return await this.mcdm({
      url: `/webapi/ydg_vmcdm_custom_api/getCustomCatalogEntityTree`,
      data: { isPublish: true },
    }).then((r) => {
      return r.data.data?.bizCatalogEntityCustom ?? [];
    });
  }

  async getDDL(entityId: string) {
    return await this.mcdm({
      method: 'POST',
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/generateDDL`,
      data: {
        entityIds: entityId,
      },
    }).then((r) => {
      return r.data.data?.ddl?.join('\n');
    });
  }

  async getSql(
    question: string,
    id: string,
    orgid: string,
    projectid: string,
    modelrange: string,
  ) {
    return await this.llm({
      url: `/ask`,
      params: {
        question,
        id,
        orgid,
        projectid,
        modelrange: modelrange,
      },
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    }).then((r) => {
      return r.data;
    });
  }

  async exeSql(data: { sql: string; params?: object }) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/queryBizCustomEntityData`,
      data,
    }).then((r) => {
      return r.data;
    });
  }

  async saveModel(data: object) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/saveBizCustomEntity`,
      data,
    }).then((r) => {
      return r.data;
    });
  }

  async getBases() {
    return await this.mcdm({
      url: '/module-operation!executeOperation?operation=NocodbBaseListProjects',
    }).then((r) => {
      return r.data;
    });
  }

  async getBase(baseId: string) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbBaseGetBase&baseId=${baseId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async getBaseTables(baseId: string, sourceId: string) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableListTables&baseId=${baseId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async getTableViews(tableId: string) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBViewListViews&tableId=${tableId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async getTable(tableId: string) {
    // http://192.168.0.158:9909/module-operation!executeOperation?operation=NocodbDBTableReadTable&tableId=ab2258e4cdf9d412e1519d91343df4c7
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableReadTable&tableId=${tableId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async getTableViewColumns(tableId: string) {
    // http://192.168.0.158:9909/module-operation!executeOperation?operation=NocodbDBViewColumnListColumnsInView&viewId=ab2258e4cdf9d412e1519d91343df4c7
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBViewColumnListColumnsInView&viewId=${tableId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async readData(tableName: string, rowId: string) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBViewRowGetTableViewRow&viewName=${tableName}&rowId=${rowId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async updateData(tableName: string, rowId: string, body: unknown) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBViewRowUpdateTableViewRow&viewName=${tableName}&rowId=${rowId}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async updateBlukData(tableName: string, body: unknown) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableRowBulkUpdateTableRowsByIDs&tableName=${tableName}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async batchUpdateData(tableName: string, body: unknown) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbTableRecordsUpdateTableRecords&tableId=${tableName}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async deleteData(tableName: string, rowId: string) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBViewRowDeleteTableViewRow&viewName=${tableName}&rowId=${rowId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async deleteBlukData(tableName: string, body: unknown) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableRowBulkDeleteTableRowsByIDs&tableName=${tableName}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async batchDeleteData(tableName: string, body: unknown) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbTableRecordsDeleteTableRecords&tableId=${tableName}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async addColumn(tableName: string, body: any) {
    const updatedColumnName: string = await this.translate(body.column_name);
    body.column_name = updatedColumnName
      .replace(/\s/g, '')
      .replace(/^\S/, (s) => s.toLowerCase());
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableColumnCreateColumn&tableId=${tableName}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async updateColumn(columnId: string, body: unknown) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableColumnUpdateColumn&columnId=${columnId}`,
      data: body,
    }).then((r) => {
      return r.data;
    });
  }

  async deleteColumn(columnId: string) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBTableColumnDeleteColumn&columnId=${columnId}`,
    }).then((r) => {
      return r.data;
    });
  }

  async generateMDTable(params: { entityId: string }) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/generateMDTable`,
      data: {
        entityIds: params.entityId,
      },
    }).then((r) => {
      return r.data.data ?? [];
    });
  }

  async batchInsertOrUpdate(tableInfo: {
    componentCode: string;
    tableName: string;
    datas: string;
  }) {
    return await this.mcdm({
      url: `/restapi/bizentity/data/${tableInfo.componentCode}/${tableInfo.tableName}/batchInsertOrUpdate`,
      data: {
        datas: JSON.parse(tableInfo.datas),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async findMDTableInfo(entityId: string) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/findMDTableInfo`,
      data: {
        entityIds: entityId,
      },
    }).then((r) => {
      return r.data.data.datas ?? [];
    });
  }

  async repair(
    id: string,
    orgid: string,
    projectid: string,
    error_msg: string,
    question: string,
  ) {
    return await this.llm({
      url: `/repair`,
      params: {
        id,
        orgid,
        projectid,
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

  async translateToTableName(id: string, orgid: string, word: string) {
    return await this.llm({
      method: 'POST',
      url: '/translate',
      params: {
        id,
        orgid,
        word,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async translate(text: string) {
    return await this.translateToTableName(uuidv4(), '1', text);
  }
}
