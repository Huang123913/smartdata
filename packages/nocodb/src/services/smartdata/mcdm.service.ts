import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { v4 as uuidv4 } from 'uuid';

import { Injectable, Logger } from '@nestjs/common';

interface RewriteOptions {
  req: Request;
}

@Injectable()
export class MCDMService {
  protected logger = new Logger(MCDMService.name);

  protected mcdm: AxiosInstance = axios.create({
    method: 'POST',
    baseURL: process.env.MCDM_URL,

    httpAgent: process.env.MCDM_PROXY
      ? new SocksProxyAgent(process.env.MCDM_PROXY)
      : undefined,

    httpsAgent: process.env.MCDM_PROXY
      ? new SocksProxyAgent(process.env.MCDM_PROXY)
      : undefined,
  });

  constructor() {
    if (!this.isRewrite()) {
      this.logger.error(
        `找不到环境变量 'MCDM_URL', 请在 'packages/nocodb/.env' 中指定`,
      );
      return;
    }

    this.mcdm.interceptors.response.use(
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

  isRewrite() {
    return process.env?.MCDM_URL == null ? false : true;
  }

  async fetch(operation: string, options: RewriteOptions) {
    const { req } = options;

    this.logger.debug(`${req.method} ${req.originalUrl} > ${operation}`);

    req.user.display_name ??= req.user.email;
    const config: AxiosRequestConfig<any> = {
      url: '/module-operation!executeOperation',
      params: {
        operation,
        ...req.params,
        ...req.query,
      },
      data: req.body,
      headers: {
        'v-auth': JSON.stringify(req.user, [
          'id',
          'display_name',
          'user_name',
          'email',
        ]),
      },
    };
    return await this.mcdm(config).then((r) => r.data);
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

  async generateMDTable(entityId: string) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/generateMDTable`,
      data: {
        entityIds: entityId,
      },
    }).then((r) => {
      return r.data.data ?? [];
    });
  }

  async batchInsertOrUpdate(
    componentCode: string,
    tableName: string,
    datas: object,
  ) {
    return await this.mcdm({
      url: `/restapi/bizentity/data/${componentCode}/${tableName}/batchInsertOrUpdate`,
      data: {
        datas,
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

  async publishModelToExistingModel(params: {
    mapingData: object;
    tableData: string;
    existingModelId: string;
  }) {
    let { tableData, existingModelId, mapingData } = params;
    let tableDataObj = JSON.parse(tableData);
    let tableDatas = tableDataObj.datas ?? [];
    let insertData: any[] = [];
    tableDatas.map((item: any) => {
      let data: { [key: string]: any } = {};
      for (const key in mapingData) {
        if (mapingData.hasOwnProperty(key)) {
          data[key] = mapingData[key] ? item[mapingData[key]] : null;
        }
      }
      insertData.push({ ...data, id: uuidv4() });
    });
    let findMdTableInfoRes = await this.findMDTableInfo(existingModelId);
    let tableInfo = findMdTableInfoRes[0];
    tableInfo &&
      (await this.batchInsertOrUpdate(
        tableInfo.componentCode,
        tableInfo.tableName,
        insertData,
      ));
    return { success: true };
  }

  async renameCatalogCustom(params: {
    id: string;
    name: string;
    name_cn: string;
  }) {
    return await this.mcdm({
      url: `/webapi/ydg_vmcdm_custom_api/renameCatalogCustom`,
      params: {
        bizEntityCatalogCustom: JSON.stringify([params]),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async saveCustomCatalog(params: object) {
    return await this.mcdm({
      url: `/webapi/ydg_vmcdm_custom_api/saveCustomCatalog`,
      params: {
        bizEntityCatalogCustom: JSON.stringify([params]),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async delEntityCatalogCustom(params: { id: string }) {
    return await this.mcdm({
      url: `/webapi/ydg_vmcdm_custom_api/delEntityCatalogCustom`,
      params: {
        bizEntityCatalogCustom: JSON.stringify([params]),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async importData(params: { entityId: string; tableData: string }) {
    let { entityId, tableData } = params;
    let tableDatas = JSON.parse(tableData);
    let insertData = tableDatas.map((item: object) => ({
      ...item,
      id: uuidv4(),
    }));
    let findMdTableInfoRes = await this.findMDTableInfo(entityId);
    let tableInfo = findMdTableInfoRes[0];
    let result = null;
    if (tableInfo) {
      result = await this.batchInsertOrUpdate(
        tableInfo.componentCode,
        tableInfo.tableName,
        insertData,
      );
    }
    return result;
  }
}
