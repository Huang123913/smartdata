import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import axios, { type AxiosInstance } from 'axios';

@Injectable()
export class SmartDataService {
  protected llm = axios.create({
    baseURL:
      process.env.LLM_URL ?? `https://c538-14-123-253-17.ngrok-free.app/api/v0`,
  });

  protected mcdm: AxiosInstance = axios.create({
    method: 'POST',
    baseURL: process.env.MCDM_URL ?? `http://databoard-test.yindangu.com`,
  });

  isMcdmRewrite() {
    return process.env?.MCDM_URL == null ? false : true;
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
      data: { entityIds: entityId },
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

  async getTableViewRows(
    tableName: string,
    viewName: string,
    offset: number = 0,
    limit: number = 25,
  ) {
    return await this.mcdm({
      url: `/module-operation!executeOperation?operation=NocodbDBViewRowListTableViewRows&tableName=${tableName}&viewName=${viewName}&offset=${offset}&limit=${limit}`,
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
}
