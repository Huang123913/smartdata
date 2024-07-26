import { ColumnReqType } from 'nocodb-sdk';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { GlobalGuard } from '~/guards/global/global.guard';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import type { Column } from '~/models';
import { MCDMRewrite } from '~/modules/smartdata/interceptors/MCDMInterceptor';
import {
  CreateColumn,
} from '~/modules/smartdata/interceptors/meta/DBTableColumn/CreateColumn';
import {
  UpdateColumn,
} from '~/modules/smartdata/interceptors/meta/DBTableColumn/UpdateColumn';
import { ColumnsService } from '~/services/columns.service';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller()
@UseGuards(MetaApiLimiterGuard, GlobalGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post([
    '/api/v1/db/meta/tables/:tableId/columns/',
    '/api/v2/meta/tables/:tableId/columns/',
  ])
  @HttpCode(200)
  @Acl('columnAdd')
  @UseInterceptors(CreateColumn, MCDMRewrite('NocodbDBTableColumnCreateColumn'))
  async columnAdd(
    @TenantContext() context: NcContext,
    @Param('tableId') tableId: string,
    @Body() body: ColumnReqType,
    @Req() req: NcRequest,
  ) {
    return await this.columnsService.columnAdd(context, {
      tableId,
      column: body,
      req,
      user: req.user,
    });
  }

  @Patch([
    '/api/v1/db/meta/columns/:columnId',
    '/api/v2/meta/columns/:columnId',
  ])
  @Acl('columnUpdate')
  @UseInterceptors(UpdateColumn, MCDMRewrite('NocodbDBTableColumnUpdateColumn'))
  async columnUpdate(
    @TenantContext() context: NcContext,
    @Param('columnId') columnId: string,
    @Body() body: ColumnReqType,
    @Req() req: NcRequest,
  ) {
    return await this.columnsService.columnUpdate(context, {
      columnId: columnId,
      column: body,
      req,
      user: req.user,
    });
  }

  @Delete([
    '/api/v1/db/meta/columns/:columnId',
    '/api/v2/meta/columns/:columnId',
  ])
  @Acl('columnDelete')
  @UseInterceptors(MCDMRewrite('NocodbDBTableColumnDeleteColumn'))
  async columnDelete(
    @TenantContext() context: NcContext,
    @Param('columnId') columnId: string,
    @Req() req: NcRequest,
  ) {
    return await this.columnsService.columnDelete(context, {
      columnId,
      req,
      user: req.user,
    });
  }

  @Get(['/api/v1/db/meta/columns/:columnId', '/api/v2/meta/columns/:columnId'])
  @Acl('columnGet')
  async columnGet(
    @TenantContext() context: NcContext,
    @Param('columnId') columnId: string,
  ) {
    return await this.columnsService.columnGet(context, { columnId });
  }

  @Post([
    '/api/v1/db/meta/columns/:columnId/primary',
    '/api/v2/meta/columns/:columnId/primary',
  ])
  @HttpCode(200)
  @Acl('columnSetAsPrimary')
  @UseInterceptors(MCDMRewrite('NocodbDBTableColumnCreatePrimaryValue'))
  async columnSetAsPrimary(
    @TenantContext() context: NcContext,
    @Param('columnId') columnId: string,
  ) {
    return await this.columnsService.columnSetAsPrimary(context, { columnId });
  }

  @Get([
    '/api/v1/db/meta/tables/:tableId/columns/hash',
    '/api/v2/meta/tables/:tableId/columns/hash',
  ])
  @Acl('columnsHash')
  async columnsHash(
    @TenantContext() context: NcContext,
    @Param('tableId') tableId: string,
  ) {
    return await this.columnsService.columnsHash(context, tableId);
  }

  @Post([
    '/api/v1/db/meta/tables/:tableId/columns/bulk',
    '/api/v2/meta/tables/:tableId/columns/bulk',
  ])
  @HttpCode(200)
  @Acl('columnBulk')
  async columnBulk(
    @TenantContext() context: NcContext,
    @Param('tableId') tableId: string,
    @Body()
    body: {
      hash: string;
      ops: {
        op: 'add' | 'update' | 'delete';
        column: Partial<Column>;
      }[];
    },
    @Req() req: NcRequest,
  ) {
    return await this.columnsService.columnBulk(context, tableId, body, req);
  }
}
