import { SmartDataService } from '~/services/smartdata/smartdata.service';

import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller()
export class SmartDataController {
  constructor(private readonly smartdataService: SmartDataService) {}

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
    return await this.smartdataService.getDDL(entityId);
  }

  @Post('/api/v2/smartdata/train')
  async train(@Body('ddl') ddl: string | undefined) {
    if (ddl) {
      return await this.smartdataService.trainByDDL(ddl);
    }

    return await this.smartdataService.train();
  }

  @Get(['/api/v2/smartdata/deleteTrainData'])
  async deleteTrainData() {
    return await this.smartdataService.deleteTrainData();
  }

  @Get(['/api/v2/smartdata/getSql'])
  async getSql(
    @Query('question') question: string,
    @Query('id') id: string,
    @Query('modelrange') modelrange: any[],
  ) {
    return await this.smartdataService.getSql(question, id, modelrange);
  }

  @Post(['/api/v2/smartdata/exeSql'])
  async exeSql(@Body('data') data: { sql: string; params?: object }) {
    return await this.smartdataService.exeSql(data);
  }
}
