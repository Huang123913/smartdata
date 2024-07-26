import { FilterReqType } from 'nocodb-sdk';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { GlobalGuard } from '~/guards/global/global.guard';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import { PagedResponseImpl } from '~/helpers/PagedResponse';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MCDMRewrite } from '~/modules/smartdata/interceptors/MCDMInterceptor';
import { FiltersService } from '~/services/filters.service';

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
export class FiltersController {
  constructor(protected readonly filtersService: FiltersService) {}

  @Get([
    '/api/v1/db/meta/views/:viewId/filters',
    '/api/v2/meta/views/:viewId/filters',
  ])
  @Acl('filterList')
  @UseInterceptors(MCDMRewrite('NocodbDBTableFilterGetViewFilter'))
  async filterList(
    @TenantContext() context: NcContext,
    @Param('viewId') viewId: string,
  ) {
    return new PagedResponseImpl(
      await this.filtersService.filterList(context, {
        viewId,
      }),
    );
  }

  @Post([
    '/api/v1/db/meta/views/:viewId/filters',
    '/api/v2/meta/views/:viewId/filters',
  ])
  @HttpCode(200)
  @Acl('filterCreate')
  @UseInterceptors(MCDMRewrite('NocodbDBTableFilterCreateViewFilter'))
  async filterCreate(
    @TenantContext() context: NcContext,
    @Param('viewId') viewId: string,
    @Body() body: FilterReqType,
    @Req() req: NcRequest,
  ) {
    const filter = await this.filtersService.filterCreate(context, {
      filter: body,
      viewId: viewId,
      user: req.user,
      req,
    });
    return filter;
  }

  @Post([
    '/api/v1/db/meta/hooks/:hookId/filters',
    '/api/v2/meta/hooks/:hookId/filters',
  ])
  @HttpCode(200)
  @Acl('hookFilterCreate')
  async hookFilterCreate(
    @TenantContext() context: NcContext,
    @Param('hookId') hookId: string,
    @Body() body: FilterReqType,
    @Req() req: NcRequest,
  ) {
    const filter = await this.filtersService.hookFilterCreate(context, {
      filter: body,
      hookId,
      user: req.user,
      req,
    });
    return filter;
  }

  @Get(['/api/v1/db/meta/filters/:filterId', '/api/v2/meta/filters/:filterId'])
  @Acl('filterGet')
  async filterGet(
    @TenantContext() context: NcContext,
    @Param('filterId') filterId: string,
  ) {
    return await this.filtersService.filterGet(context, { filterId });
  }

  @Get([
    '/api/v1/db/meta/filters/:filterParentId/children',
    '/api/v2/meta/filters/:filterParentId/children',
  ])
  @Acl('filterChildrenList')
  @UseInterceptors(MCDMRewrite('NocodbDBTableFilterGetFilterGroupChildren'))
  async filterChildrenRead(
    @TenantContext() context: NcContext,
    @Param('filterParentId') filterParentId: string,
  ) {
    return new PagedResponseImpl(
      await this.filtersService.filterChildrenList(context, {
        filterId: filterParentId,
      }),
    );
  }

  @Patch([
    '/api/v1/db/meta/filters/:filterId',
    '/api/v2/meta/filters/:filterId',
  ])
  @Acl('filterUpdate')
  @UseInterceptors(MCDMRewrite('NocodbDBTableFilterUpdateFilter'))
  async filterUpdate(
    @TenantContext() context: NcContext,
    @Param('filterId') filterId: string,
    @Body() body: FilterReqType,
    @Req() req: NcRequest,
  ) {
    const filter = await this.filtersService.filterUpdate(context, {
      filterId: filterId,
      filter: body,
      user: req.user,
      req,
    });
    return filter;
  }

  @Delete([
    '/api/v1/db/meta/filters/:filterId',
    '/api/v2/meta/filters/:filterId',
  ])
  @Acl('filterDelete')
  @UseInterceptors(MCDMRewrite('NocodbDBTableFilterDeleteFilter'))
  async filterDelete(
    @TenantContext() context: NcContext,
    @Param('filterId') filterId: string,
    @Req() req: NcRequest,
  ) {
    const filter = await this.filtersService.filterDelete(context, {
      req,
      filterId,
    });
    return filter;
  }

  @Get([
    '/api/v1/db/meta/hooks/:hookId/filters',
    '/api/v2/meta/hooks/:hookId/filters',
  ])
  @Acl('hookFilterList')
  async hookFilterList(
    @TenantContext() context: NcContext,
    @Param('hookId') hookId: string,
  ) {
    return new PagedResponseImpl(
      await this.filtersService.hookFilterList(context, {
        hookId: hookId,
      }),
    );
  }
}
