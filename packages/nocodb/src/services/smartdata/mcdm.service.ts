import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import FormData from 'form-data';
import * as fs from 'fs';
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

    this.mcdm.interceptors.request.use((config) => {
      this.logger.debug(`${config.method} ${config.url}`);
      return config;
    });

    this.mcdm.interceptors.response.use(
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

  async findAllBizCustomEntity(
    isShowFields: boolean = true,
    isShowEntityProps: boolean = false,
    isShowFieldProps: boolean = false,
  ) {
    return await this.mcdm({
      url: `/webapi/innersysapi/VMcdmDataServiceWebApi/findAllBizCustomEntity`,
      data: {
        isShowFields,
        isShowEntityProps,
        isShowFieldProps,
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
    belongSQLDataRefreshPlan: object;
    belongSQLDataType: string;
  }) {
    let {
      tableData,
      existingModelId,
      mapingData,
      belongSQLDataRefreshPlan,
      belongSQLDataType,
    } = params;
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
    await this.saveModelPropsToRefresh(
      existingModelId,
      belongSQLDataType,
      belongSQLDataRefreshPlan,
    );
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

  async importData(params: {
    entityId: string;
    tableData: string;
    belongSQLDataRefreshPlan: object;
    belongSQLDataType: string;
  }) {
    let { entityId, tableData, belongSQLDataRefreshPlan, belongSQLDataType } =
      params;
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
    await this.saveModelPropsToRefresh(
      entityId,
      belongSQLDataType,
      belongSQLDataRefreshPlan,
    );
    return result;
  }

  async saveModelPropsToRefresh(
    entityId: string,
    belongSQLDataType: string,
    belongSQLDataRefreshPlan: object,
  ) {
    let entities = await this.getEntity(entityId);
    const entity = entities[0];
    const entityProps = entity?.props;
    if (entityProps) {
      let dataTypeProp = entityProps.findLast(
        (p) => p.code == 'belongSQLDataType',
      );
      let dataRefreshPlan = entityProps.findLast(
        (p) => p.code == 'belongSQLDataRefreshPlan',
      );
      let saveDdlProps = [
        {
          id: entityId,
          props: [
            {
              id: dataTypeProp ? dataTypeProp.id : null,
              name: 'belongSQLDataType',
              code: 'belongSQLDataType',
              value: belongSQLDataType,
            },
            {
              id: dataRefreshPlan ? dataRefreshPlan.id : null,
              name: 'belongSQLDataRefreshPlan',
              code: 'belongSQLDataRefreshPlan',
              jsonValue: JSON.stringify(belongSQLDataRefreshPlan),
            },
          ],
        },
      ];
      await this.saveModel({ entities: saveDdlProps });
    }
  }

  async copyTableData(params: {
    type: string;
    fromTableId: string;
    toTableId: string;
    columnMappings: { fromColumnId: string; toColumnId: string }[];
    recordIds?: string[];
  }) {
    return await this.mcdm({
      method: 'POST',
      url: `/module-operation!executeOperation?operation=NocodbDBTableDuplicateToTable`,
      data: params,
    }).then((r) => {
      return r.data;
    });
  }

  async moveModel(params: {
    baseId: string;
    catalogId: string;
    tableId: string;
    prependToTableId: string;
  }) {
    return await this.mcdm({
      method: 'GET',
      url: '/module-operation!executeOperation?operation=NocodbDBTableReorderTable',
      params: params,
    }).then((r) => {
      return r.data;
    });
  }

  async moveCatalog(params: {
    sourceCatalogId: string;
    targetCatalogId: string;
    ismoveCustomCatalogLast: boolean;
  }) {
    let result = null;
    if (params.ismoveCustomCatalogLast) {
      result = await this.moveCustomCatalogLast(params);
    } else {
      result = await this.moveCustomCatalog(params);
    }
    return result;
  }

  async moveCustomCatalog(params: {
    sourceCatalogId: string;
    targetCatalogId: string;
  }) {
    let { sourceCatalogId, targetCatalogId } = params;
    return await this.mcdm({
      url: `/webapi/ydg_vmcdm_custom_api/moveCustomCatalog`,
      params: {
        sourceCatalogId: sourceCatalogId,
        targetCatalogId: targetCatalogId,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async moveCustomCatalogLast(params: {
    sourceCatalogId: string;
    targetCatalogId: string;
  }) {
    let { sourceCatalogId, targetCatalogId } = params;
    return await this.mcdm({
      url: `/webapi/ydg_vmcdm_custom_api/moveCustomCatalogLast`,
      params: {
        sourceCatalogId: sourceCatalogId,
        targetCatalogId: targetCatalogId,
      },
    }).then((r) => {
      return r.data;
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const formData = new FormData();
    const fileStream = fs.createReadStream(file.path);
    formData.append(
      'file',
      fileStream,
      Buffer.from(file.originalname, 'latin1').toString('utf8'),
    );
    return await this.mcdm({
      method: 'POST',
      url: `/module-operation!executeOperation?operation=FileUpload`,
      data: formData,
    }).then((r) => {
      fs.unlinkSync(file.path); // 删除本地存储的文件
      return r.data;
    });
  }

  async saveUFileInfoToTable(file: Express.Multer.File, tableId: string) {
    let fileInfo = await this.uploadFile(file);
    let entities = await this.getEntity(tableId);
    const entity = entities.length ? entities[0] : null;
    const entityProps = entity ? entity?.props : null;
    let res = null;
    if (entityProps) {
      let belongIntelligentImportSQLProp = entityProps.findLast(
        (p) => p.code == 'belongUploadFileInfo',
      );
      let savedValue = belongIntelligentImportSQLProp
        ? [...JSON.parse(belongIntelligentImportSQLProp.jsonValue), fileInfo]
        : [fileInfo];
      let saveDdlProps = [
        {
          id: tableId,
          props: [
            {
              id: belongIntelligentImportSQLProp
                ? belongIntelligentImportSQLProp.id
                : null,
              name: 'belongUploadFileInfo',
              code: 'belongUploadFileInfo',
              jsonValue: JSON.stringify(savedValue),
            },
          ],
        },
      ];
      res = await this.saveModel({ entities: saveDdlProps });
    }
    return res;
  }

  async insertDataToTable(insertDatas: any[], tableId: string) {
    let res = null;
    let findMdTableInfoRes = await this.findMDTableInfo(tableId);
    let tableInfo = findMdTableInfoRes[0];
    if (tableInfo && insertDatas) {
      let datas = insertDatas.map((item: object) => ({
        ...item,
        id: uuidv4(),
      }));
      res = await this.batchInsertOrUpdate(
        tableInfo.componentCode,
        tableInfo.tableName,
        datas,
      );
    }
    return res;
  }

  async saveModelProps(params: {
    entityId: string;
    belongCode: string;
    data: any;
    option: string;
    optionId: string;
  }) {
    let { entityId, belongCode, data, option, optionId } = params;
    let entities = await this.getEntity(entityId);
    const entity = entities[0];
    const entityProps = entity?.props;
    let res = null;
    if (entityProps) {
      let findProp = entityProps.findLast((p) => p.code == belongCode);
      let savedValue = [];
      if (option === 'add') {
        savedValue = findProp
          ? [...JSON.parse(findProp.jsonValue), ...data]
          : data;
      } else if (option === 'del') {
        savedValue = JSON.parse(findProp.jsonValue).filter(
          (item) => item.id !== optionId,
        );
      } else if (option === 'addField') {
        savedValue = JSON.parse(findProp.jsonValue);
        let optionItem = savedValue.find((item) => item.id === optionId);
        optionItem.columnId.push(...data.columnId);
      } else {
        // option === 'delField'
        savedValue = JSON.parse(findProp.jsonValue);
        let optionItem = savedValue.find((item) => item.id === optionId);
        optionItem.columnId = optionItem.columnId.filter(
          (item) => item !== data.columnId,
        );
      }
      let saveDdlProps = [
        {
          id: entityId,
          props: [
            {
              id: findProp ? findProp.id : null,
              name: belongCode,
              code: belongCode,
              jsonValue: JSON.stringify(savedValue),
            },
          ],
        },
      ];
      res = await this.saveModel({ entities: saveDdlProps });
    }
    return res;
  }

  //标记语义
  async markSemantics(params: {
    entityId: string;
    belongCode: string;
    data: any;
    option: string;
    optionId: string;
  }) {
    let { entityId, belongCode, data, option, optionId } = params;
    await this.saveModelProps({ entityId, belongCode, data, option, optionId });
    let res = await this.execBizEntityDataSemanticAanalysis(entityId);
    return res;
  }

  //对模型发起语义分析
  async execBizEntityDataSemanticAanalysis(entityId: string) {
    return await this.mcdm({
      method: 'POST',
      url: `/module-operation!executeOperation?operation=DuckdbSemanticAnalysis`,
      data: {
        entityId: `${entityId}`,
      },
    }).then((r) => {
      return r.data;
    });
  }

  //发送处理完成的语义分析文件
  async receiveProcessedSemanticAnalysisFileIds(
    received: {
      entityId: string;
      toBeProcessedFileId: string;
      processedFileId: string;
    }[],
  ) {
    return await this.mcdm({
      method: 'POST',
      url: `/module-operation!executeOperation?operation=DuckdbReceiveProcessedSemanticAnalysisFileIds`,
      data: {
        received,
      },
    }).then((r) => {
      return r.data;
    });
  }

  //查询待处理语义分析文件列表
  async getToBeProcessedSemanticAnalysisFileIds() {
    return await this.mcdm({
      method: 'GET',
      url: `/module-operation!executeOperation?operation=DuckdbGetToBeProcessedSemanticAnalysisFileIds`,
    }).then((r) => {
      return r.data;
    });
  }

  async uploadFileNew(formData) {
    return await this.mcdm({
      method: 'POST',
      url: `/module-operation!executeOperation?operation=FileUpload`,
      data: formData,
    }).then((r) => {
      return r.data;
    });
  }

  async downLoadFile(fileId: string) {
    return await this.mcdm({
      method: 'GET',
      url: `/module-operation!executeOperation`,
      params: {
        operation: 'FileDown',
        token: JSON.stringify({
          data: {
            isMulti: false,
            dataId: `${fileId}`,
            isShow: 0,
          },
        }),
      },
      responseType: 'stream', // 确保返回数据是一个流
    }).then((r) => {
      return r.data;
    });
  }

  async readMd() {
    return await this.mcdm({
      method: 'GET',
      url: `/module-operation!executeOperation`,
      params: {
        operation: 'FileDown',
        token: JSON.stringify({
          data: {
            isMulti: false,
            dataId: 'ff80818190bfd6f90190bffc353f23ba',
            isShow: 0,
          },
        }),
      },
      responseType: 'arraybuffer',
    }).then((r) => {
      const fileContent = Buffer.from(r.data, 'binary').toString('utf-8');
      return fileContent;
    });
  }

  async getBaseUrl() {
    return process.env.MCDM_URL;
  }
}
