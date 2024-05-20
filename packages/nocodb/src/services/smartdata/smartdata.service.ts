import axios, { type AxiosInstance } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';

import { Injectable } from '@nestjs/common';

@Injectable()
export class SmartDataService {
  protected llm = axios.create({
    baseURL:
      process.env.LLM_URL ?? `https://a7aa-14-123-254-4.ngrok-free.app/api/v0`,

    httpAgent: process.env.LLM_PROXY
      ? new SocksProxyAgent(process.env.LLM_PROXY)
      : undefined,
    httpsAgent: process.env.LLM_PROXY
      ? new SocksProxyAgent(process.env.LLM_PROXY)
      : undefined,
  });

  protected mcdm: AxiosInstance = axios.create({
    method: 'POST',
    baseURL: process.env.MCDM_URL ?? `http://databoard-test.yindangu.com`,
  });

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
}
