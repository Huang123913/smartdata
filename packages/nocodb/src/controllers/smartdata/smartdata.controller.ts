import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';

import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller()
export class SmartDataController {
  constructor(
    private readonly llm: LLMService,
    private readonly mcdm: MCDMService,
  ) {}

  @Get(['/api/v2/smartdata/entity'])
  async getEntity(@Query('entityId') entityId: string) {
    return await this.mcdm.getEntity(entityId);
  }

  @Get(['/api/v2/smartdata/entities'])
  async getEntities() {
    return await this.mcdm.getEntities();
  }

  @Post('/api/v2/smartdata/train')
  async train(@Body('ddl') ddl: string | undefined) {
    if (ddl) {
      return await this.llm.trainByDDL(ddl);
    }

    return await this.llm.train();
  }

  @Get(['/api/v2/smartdata/deleteTrainData'])
  async deleteTrainData() {
    return await this.llm.deleteTrainData();
  }

  @Post(['/api/v2/smartdata/createTableByAskingQuestion'])
  async createTableByAskingQuestion(
    @Body()
    data: {
      selectedModel: string;
      question: string;
      ischoose: boolean;
    },
  ) {
    return await this.llm.createTableByAskingQuestion(data);
  }

  @Post(['/api/v2/smartdata/publishModelToExistingModel'])
  async publishModelToExistingModel(
    @Body()
    data: {
      mapingData: object;
      tableData: string;
      existingModelId: string;
      belongSQLDataRefreshPlan: object;
      belongSQLDataType: string;
    },
  ) {
    return await this.mcdm.publishModelToExistingModel(data);
  }

  @Post(['/api/v2/smartdata/publicModelToCatalog'])
  async publicModelToCatalog(
    @Body()
    data: {
      tableData: string;
      sql: string;
      question: string;
      modelName: string;
      belongCatalog: string;
      belongSQLDataRefreshPlan: object;
      belongSQLDataType: string;
    },
  ) {
    return await this.llm.publicModelToCatalog(data);
  }

  @Post(['/api/v2/smartdata/updateModelCatalog'])
  async updateModelCatalog(
    @Body()
    data: {
      entities: any[];
    },
  ) {
    return await this.mcdm.saveModel(data);
  }
  @Post(['/api/v2/smartdata/renameCatalogCustom'])
  async renameCatalogCustom(
    @Body()
    data: {
      id: string;
      name: string;
      name_cn: string;
    },
  ) {
    return await this.mcdm.renameCatalogCustom(data);
  }

  @Post(['/api/v2/smartdata/saveCustomCatalog'])
  async saveCustomCatalog(@Body() data: object) {
    return await this.mcdm.saveCustomCatalog(data);
  }

  @Post(['/api/v2/smartdata/delEntityCatalogCustom'])
  async delEntityCatalogCustom(@Body() data: { id: string }) {
    return await this.mcdm.delEntityCatalogCustom(data);
  }

  @Post(['/api/v2/smartdata/retraining'])
  async retraining(@Body() data: { isUpdate: boolean; entityId: string }) {
    return await this.llm.retraining(data);
  }

  @Post(['/api/v2/smartdata/intelligentImport'])
  async intelligentImport(
    @Body()
    data: {
      tableId: string;
      tableHeader: string;
      allTableMode: string;
    },
  ) {
    return await this.llm.intelligentImport(data);
  }

  @Post(['/api/v2/smartdata/importData'])
  async importData(@Body() data: { entityId: string; tableData: string }) {
    return await this.mcdm.importData(data);
  }

  @Post(['/api/v2/smartdata/copyTableData'])
  async copyTableData(
    @Body()
    data: {
      type: string;
      fromTableId: string;
      toTableId: string;
      columnMappings: { fromColumnId: string; toColumnId: string }[];
      recordIds?: string[];
    },
  ) {
    return await this.mcdm.copyTableData(data);
  }

  @Post(['/api/v2/smartdata/moveModel'])
  async moveModel(
    @Body()
    data: {
      baseId: string;
      catalogId: string;
      tableId: string;
      prependToTableId: string;
    },
  ) {
    return await this.mcdm.moveModel(data);
  }

  @Post(['/api/v2/smartdata/moveCatalog'])
  async moveCatalog(
    @Body()
    data: {
      sourceCatalogId: string;
      targetCatalogId: string;
      ismoveCustomCatalogLast: boolean;
    },
  ) {
    return await this.mcdm.moveCatalog(data);
  }
}
