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
}
