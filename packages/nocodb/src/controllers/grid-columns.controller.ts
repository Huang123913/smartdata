import { GridColumnReqType } from 'nocodb-sdk';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { GlobalGuard } from '~/guards/global/global.guard';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MCDMRewrite } from '~/modules/smartdata/interceptors/MCDMInterceptor';
import { GridColumnsService } from '~/services/grid-columns.service';

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller()
@UseGuards(MetaApiLimiterGuard, GlobalGuard)
export class GridColumnsController {
  constructor(private readonly gridColumnsService: GridColumnsService) {}

  @Get([
    '/api/v1/db/meta/grids/:gridViewId/grid-columns',
    '/api/v2/meta/grids/:gridViewId/grid-columns',
  ])
  @Acl('columnList')
  async columnList(
    @TenantContext() context: NcContext,
    @Param('gridViewId') gridViewId: string,
  ) {
    return await this.gridColumnsService.columnList(context, {
      gridViewId,
    });
  }
  @Patch([
    '/api/v1/db/meta/grid-columns/:gridViewColumnId',
    '/api/v2/meta/grid-columns/:gridViewColumnId',
  ])
  @Acl('gridColumnUpdate')
  @UseInterceptors(MCDMRewrite('NocodbDBViewUpdateGridColumn'))
  async gridColumnUpdate(
    @TenantContext() context: NcContext,
    @Param('gridViewColumnId') gridViewColumnId: string,
    @Body() body: GridColumnReqType,

    @Req() req: NcRequest,
  ) {
    return this.gridColumnsService.gridColumnUpdate(context, {
      gridViewColumnId,
      grid: body,
      req,
    });
  }
}
