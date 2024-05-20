import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { SmartDataService } from '~/services/smartdata/smartdata.service';
import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';

@Controller()
export class SmartDataController {
  constructor(
    private readonly smartdataService: SmartDataService,
    private readonly llm: LLMService,
    private readonly mcdm: MCDMService,
  ) {}

  @Get(['/api/v2/smartdata/entity'])
  async getEntity(@Query('entityId') entityId: string) {
    return await this.smartdataService.getEntity(entityId);
  }

  @Get(['/api/v2/smartdata/entities'])
  async getEntities() {
    return await this.smartdataService.getEntities();
  }

  @Get(['/api/v2/smartdata/ddl'])
  async getDDL(@Query('entityId') entityId: string) {
    return await this.mcdm.getDDL(entityId);
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

  @Get(['/api/v2/smartdata/getSql'])
  async getSql(
    @Query('question') question: string,
    @Query('id') id: string,
    @Query('orgid') orgid: string,
    @Query('projectid') projectid: string,
    @Query('modelrange') modelrange: string,
  ) {
    return await this.smartdataService.getSql(
      question,
      id,
      orgid,
      projectid,
      modelrange,
    );
  }

  @Post(['/api/v2/smartdata/exeSql'])
  async exeSql(@Body() data: { sql: string; params?: object }) {
    return await this.smartdataService.exeSql(data);
  }

  @Post(['/api/v2/smartdata/saveModel'])
  async saveModel(@Body() data: { entities: any[] }) {
    return await this.smartdataService.saveModel(data);
  }

  @Post(['/api/v2/smartdata/generateMDTable'])
  async generateMDTable(@Body() data: { entityId: string }) {
    return await this.smartdataService.generateMDTable(data);
  }

  @Post(['/api/v2/smartdata/batchInsertOrUpdate'])
  async batchInsertOrUpdate(
    @Body() data: { componentCode: string; tableName: string; datas: string },
  ) {
    return await this.smartdataService.batchInsertOrUpdate(data);
  }

  @Get(['/api/v2/smartdata/findMDTableInfo'])
  async findMDTableInfo(@Query('entityId') entityId: string) {
    return await this.smartdataService.findMDTableInfo(entityId);
  }

  @Post(['/api/v2/smartdata/trainByPrompt'])
  async trainByPrompt(@Body() data: { sql: string; prompt: string }) {
    return await this.llm.trainByPrompt(data.sql, data.prompt);
  }

  @Post('/api/v2/smartdata/trainByDDL')
  async trainByDDL(@Body() data: { ddl: string | undefined }) {
    return await this.llm.trainByDDL(data.ddl);
  }

  @Get(['/api/v2/smartdata/repair'])
  async repair(
    @Query('id') id: string,
    @Query('orgid') orgid: string,
    @Query('projectid') projectid: string,
    @Query('error_msg') error_msg: string,
    @Query('question') question: string,
  ) {
    return await this.smartdataService.repair(
      id,
      orgid,
      projectid,
      error_msg,
      question,
    );
  }

  @Post('/api/v2/smartdata/translateToTableName')
  async translateToTableName(
    @Body() data: { id: string; orgid: string; word: string },
  ) {
    return await this.smartdataService.translateToTableName(
      data.id,
      data.orgid,
      data.word,
    );
  }
}
