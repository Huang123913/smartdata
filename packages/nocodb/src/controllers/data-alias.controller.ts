import { Response } from 'express';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { DataApiLimiterGuard } from '~/guards/data-api-limiter.guard';
import { GlobalGuard } from '~/guards/global/global.guard';
import { parseHrtimeToMilliSeconds } from '~/helpers';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MCDMRewrite } from '~/modules/smartdata/interceptors/MCDMInterceptor';
import {
  MCDMJsonRewrite,
} from '~/modules/smartdata/interceptors/MCDMJsonInterceptor';
import { DatasService } from '~/services/datas.service';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller()
@UseGuards(DataApiLimiterGuard, GlobalGuard)
export class DataAliasController {
  constructor(private readonly datasService: DatasService) {}

  @Post([
    '/api/v1/db/data/:orgs/:baseName/:tableName',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/filterData',
  ])
  @Acl('filterData')
  @UseInterceptors(
    MCDMJsonRewrite('NocodbDBTableRowListTableRows', {
      isSkip: (req) => req.params.viewName != null,
    }),
    MCDMJsonRewrite('NocodbDBViewRowListTableViewRows', {
      isSkip: (req) => req.params.viewName == null,
    }),
  )
  async filterData(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Body() body: any,
    @Query('opt') opt: string,
  ) {
    const startTime = process.hrtime();
    const responseData = await this.datasService.dataList(context, {
      query: req.query,
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      disableOptimization: opt === 'false',
    });
    const elapsedMilliSeconds = parseHrtimeToMilliSeconds(
      process.hrtime(startTime),
    );
    res.setHeader('xc-db-response', elapsedMilliSeconds);
    if (responseData['stats']) {
      responseData['stats'].apiHandlingTime = elapsedMilliSeconds;
    }

    res.json(responseData);
  }

  // todo: Handle the error case where view doesnt belong to model
  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName',
  ])
  @Acl('dataList')
  @UseInterceptors(
    MCDMJsonRewrite('NocodbDBTableRowListTableRows', {
      isSkip: (req) => req.params.viewName != null,
    }),
    MCDMJsonRewrite('NocodbDBViewRowListTableViewRows', {
      isSkip: (req) => req.params.viewName == null,
    }),
  )
  async dataList(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Query('opt') opt: string,
  ) {
    const startTime = process.hrtime();
    const responseData = await this.datasService.dataList(context, {
      query: req.query,
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      disableOptimization: opt === 'false',
    });
    const elapsedMilliSeconds = parseHrtimeToMilliSeconds(
      process.hrtime(startTime),
    );
    res.setHeader('xc-db-response', elapsedMilliSeconds);
    if (responseData['stats']) {
      responseData['stats'].apiHandlingTime = elapsedMilliSeconds;
    }

    res.json(responseData);
  }

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/find-one',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/find-one',
  ])
  @Acl('dataFindOne')
  async dataFindOne(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
  ) {
    return await this.datasService.dataFindOne(context, {
      query: req.query,
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
    });
  }

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/groupby',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/groupby',
  ])
  @Acl('dataGroupBy')
  async dataGroupBy(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
  ) {
    return await this.datasService.dataGroupBy(context, {
      query: req.query,
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
    });
  }

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/count',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/count',
  ])
  @Acl('dataCount')
  @UseInterceptors(MCDMJsonRewrite('NocodbDBViewRowCountTableViewRows'))
  async dataCount(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
  ) {
    const countResult = await this.datasService.dataCount(context, {
      query: req.query,
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
    });

    res.json(countResult);
  }

  @Post([
    '/api/v1/db/data/:orgs/:baseName/:tableName',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName',
  ])
  @HttpCode(200)
  @Acl('dataInsert')
  @UseInterceptors(MCDMRewrite('NocodbDBViewRowCreateTableViewRow'))
  async dataInsert(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Body() body: any,
    @Query('opt') opt: string,
  ) {
    return await this.datasService.dataInsert(context, {
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      body: body,
      cookie: req,
      disableOptimization: opt === 'false',
    });
  }

  @Patch([
    '/api/v1/db/data/:orgs/:baseName/:tableName/:rowId',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/:rowId',
  ])
  @Acl('dataUpdate')
  @UseInterceptors(MCDMRewrite('NocodbDBViewRowUpdateTableViewRow'))
  async dataUpdate(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Param('rowId') rowId: string,
    @Query('opt') opt: string,
  ) {
    return await this.datasService.dataUpdate(context, {
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      body: req.body,
      cookie: req,
      rowId: rowId,
      disableOptimization: opt === 'false',
    });
  }

  @Delete([
    '/api/v1/db/data/:orgs/:baseName/:tableName/:rowId',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/:rowId',
  ])
  @Acl('dataDelete')
  @UseInterceptors(MCDMRewrite('NocodbDBViewRowDeleteTableViewRow'))
  async dataDelete(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Param('rowId') rowId: string,
  ) {
    return await this.datasService.dataDelete(context, {
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      cookie: req,
      rowId: rowId,
    });
  }

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/:rowId',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/:rowId',
  ])
  @Acl('dataRead')
  @UseInterceptors(MCDMRewrite('NocodbDBViewRowGetTableViewRow'))
  async dataRead(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Param('rowId') rowId: string,
    @Query('opt') opt: string,
    @Query('getHiddenColumn') getHiddenColumn: boolean,
  ) {
    return await this.datasService.dataRead(context, {
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      rowId: rowId,
      query: req.query,
      disableOptimization: opt === 'false',
      getHiddenColumn: getHiddenColumn,
    });
  }

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/:rowId/exist',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/:rowId/exist',
  ])
  @Acl('dataExist')
  async dataExist(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Param('rowId') rowId: string,
  ) {
    const exists = await this.datasService.dataExist(context, {
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      rowId: rowId,
      query: req.query,
    });

    res.json(exists);
  }

  // todo: Handle the error case where view doesnt belong to model

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/group/:columnId',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/group/:columnId',
  ])
  @Acl('groupedDataList')
  async groupedDataList(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Param('viewName') viewName: string,
    @Param('columnId') columnId: string,
  ) {
    const startTime = process.hrtime();
    const groupedData = await this.datasService.groupedDataList(context, {
      baseName: baseName,
      tableName: tableName,
      viewName: viewName,
      query: req.query,
      columnId: columnId,
    });
    const elapsedSeconds = parseHrtimeToMilliSeconds(process.hrtime(startTime));
    res.setHeader('xc-db-response', elapsedSeconds);
    res.json(groupedData);
  }
}
