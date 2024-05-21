import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig, type AxiosInstance } from 'axios';
import { Request } from 'express';

interface RewriteOptions {
  req: Request;
}

@Injectable()
export class MCDMService {
  protected logger = new Logger(MCDMService.name);

  protected mcdm: AxiosInstance = axios.create({
    method: 'POST',
    baseURL: process.env.MCDM_URL ?? `http://databoard-test.yindangu.com`,
  });

  constructor() {}

  isRewrite() {
    return process.env?.MCDM_URL == null ? false : true;
  }

  async fetch(operation: string, options: RewriteOptions) {
    const { req } = options;

    this.logger.debug(`${req.method} ${req.originalUrl} > ${operation}`);

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
    return await this.mcdm(config)
      .then((r) => {
        return r.data;
      })
      .catch((reason) => {
        this.logger.error(reason);
        this.logger.error(config);
        throw reason;
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
}
