import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';

import { SmartDataService } from '~/services/smartdata/smartdata.service';

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
}
