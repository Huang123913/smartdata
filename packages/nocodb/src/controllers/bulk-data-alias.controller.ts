import { Response } from 'express';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { DataApiLimiterGuard } from '~/guards/data-api-limiter.guard';
import { GlobalGuard } from '~/guards/global/global.guard';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MCDMRewrite } from '~/modules/smartdata/interceptors/MCDMInterceptor';
import {
  MCDMJsonRewrite,
} from '~/modules/smartdata/interceptors/MCDMJsonInterceptor';
import { BulkDataAliasService } from '~/services/bulk-data-alias.service';

import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller()
@UseGuards(DataApiLimiterGuard, GlobalGuard)
export class BulkDataAliasController {
  constructor(private bulkDataAliasService: BulkDataAliasService) {}

  @Post(['/api/v1/db/data/bulk/:orgs/:baseName/:tableName'])
  @HttpCode(200)
  @Acl('bulkDataInsert')
  @UseInterceptors(MCDMJsonRewrite('NocodbDBTableRowBulkInsertTableRows'))
  async bulkDataInsert(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Body() body: any,
  ) {
    const exists = await this.bulkDataAliasService.bulkDataInsert(context, {
      body: body,
      cookie: req,
      baseName: baseName,
      tableName: tableName,
    });

    res.json(exists);
  }

  @Patch(['/api/v1/db/data/bulk/:orgs/:baseName/:tableName'])
  @Acl('bulkDataUpdate')
  @UseInterceptors(MCDMRewrite('NocodbDBTableRowBulkUpdateTableRowsByIDs'))
  async bulkDataUpdate(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Body() body: any,
  ) {
    return await this.bulkDataAliasService.bulkDataUpdate(context, {
      body: body,
      cookie: req,
      baseName: baseName,
      tableName: tableName,
    });
  }

  // todo: Integrate with filterArrJson bulkDataUpdateAll
  @Patch(['/api/v1/db/data/bulk/:orgs/:baseName/:tableName/all'])
  @Acl('bulkDataUpdateAll')
  async bulkDataUpdateAll(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Body() body: any,
  ) {
    return await this.bulkDataAliasService.bulkDataUpdateAll(context, {
      body: body,
      cookie: req,
      baseName: baseName,
      tableName: tableName,
      query: req.query,
    });
  }

  @Delete(['/api/v1/db/data/bulk/:orgs/:baseName/:tableName'])
  @Acl('bulkDataDelete')
  @UseInterceptors(MCDMRewrite('NocodbDBTableRowBulkDeleteTableRowsByIDs'))
  async bulkDataDelete(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
    @Body() body: any,
  ) {
    return await this.bulkDataAliasService.bulkDataDelete(context, {
      body: body,
      cookie: req,
      baseName: baseName,
      tableName: tableName,
    });
  }

  // todo: Integrate with filterArrJson bulkDataDeleteAll

  @Delete(['/api/v1/db/data/bulk/:orgs/:baseName/:tableName/all'])
  @Acl('bulkDataDeleteAll')
  async bulkDataDeleteAll(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('baseName') baseName: string,
    @Param('tableName') tableName: string,
  ) {
    return await this.bulkDataAliasService.bulkDataDeleteAll(context, {
      // cookie: req,
      baseName: baseName,
      tableName: tableName,
      query: req.query,
    });
  }
}
