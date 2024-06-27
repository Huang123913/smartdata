import { diskStorage } from 'multer';
import { extname } from 'path';
import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Get('/api/v2/smartdata/translate')
  async translate(@Query('word') word: string) {
    return await this.llm.translate(word);
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
  async importData(
    @Body()
    data: {
      entityId: string;
      tableData: string;
      belongSQLDataRefreshPlan: object;
      belongSQLDataType: string;
    },
  ) {
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

  @Post('/api/v2/smartdata/saveUFileInfoToTable')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async saveUFileInfoToTable(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return await this.mcdm.saveUFileInfoToTable(file, body.tableId);
  }
  @Post(['/api/v2/smartdata/saveModelPropsToRefresh'])
  async saveModelPropsToRefresh(
    @Body()
    data: {
      entityId: string;
      belongSQLDataType: string;
      belongSQLDataRefreshPlan: object;
    },
  ) {
    return await this.mcdm.saveModelPropsToRefresh(
      data.entityId,
      data.belongSQLDataType,
      data.belongSQLDataRefreshPlan,
    );
  }

  @Post(['/api/v2/smartdata/insertDataToTable'])
  async insertDataToTable(
    @Body()
    data: {
      insertDatas: any[];
      tableId: string;
    },
  ) {
    return await this.mcdm.insertDataToTable(data.insertDatas, data.tableId);
  }

  @Post(['/api/v2/smartdata/exeSql'])
  async exeSql(
    @Body()
    data: {
      sql: string;
      params?: object;
    },
  ) {
    return await this.mcdm.exeSql(data);
  }

  @Post(['/api/v2/smartdata/saveModelProps'])
  async saveModelProps(
    @Body()
    data: {
      entityId: string;
      belongCode: string;
      data: any;
      option: string;
      optionId: string;
    },
  ) {
    return await this.mcdm.saveModelProps(data);
  }
}
