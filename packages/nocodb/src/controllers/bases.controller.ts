import isDocker from 'is-docker';
import type { BaseType } from 'nocodb-sdk';
import { ProjectReqType } from 'nocodb-sdk';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { GlobalGuard } from '~/guards/global/global.guard';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import { PagedResponseImpl } from '~/helpers/PagedResponse';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { Filter } from '~/models';
import { MCDMRewrite } from '~/modules/smartdata/interceptors/MCDMInterceptor';
import Noco from '~/Noco';
import { BasesService } from '~/services/bases.service';
import { packageVersion } from '~/utils/packageVersion';

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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@UseGuards(MetaApiLimiterGuard, GlobalGuard)
@Controller()
export class BasesController {
  constructor(protected readonly projectsService: BasesService) {}

  @Acl('baseList', {
    scope: 'org',
  })
  @Get(['/api/v1/db/meta/projects/', '/api/v2/meta/bases/'])
  async list(
    @TenantContext() context: NcContext,
    @Query() queryParams: Record<string, any>,
    @Req() req: NcRequest,
  ) {
    const bases = await this.projectsService.baseList(context, {
      user: req.user,
      query: queryParams,
    });
    return new PagedResponseImpl(bases as BaseType[], {
      count: bases.length,
      limit: bases.length,
    });
  }

  @Acl('baseInfoGet')
  @Get([
    '/api/v1/db/meta/projects/:baseId/info',
    '/api/v2/meta/bases/:baseId/info',
  ])
  async baseInfoGet() {
    return {
      Node: process.version,
      Arch: process.arch,
      Platform: process.platform,
      Docker: isDocker(),
      RootDB: Noco.getConfig()?.meta?.db?.client,
      PackageVersion: packageVersion,
    };
  }

  @Acl('baseGet')
  @Get(['/api/v1/db/meta/projects/:baseId', '/api/v2/meta/bases/:baseId'])
  @UseInterceptors(MCDMRewrite('NocodbBaseGetBase'))
  async baseGet(
    @TenantContext() context: NcContext,
    @Param('baseId') baseId: string,
  ) {
    const base = await this.projectsService.getProjectWithInfo(context, {
      baseId: baseId,
    });

    this.projectsService.sanitizeProject(base);

    return base;
  }

  @Acl('baseUpdate')
  @Patch(['/api/v1/db/meta/projects/:baseId', '/api/v2/meta/bases/:baseId'])
  async baseUpdate(
    @TenantContext() context: NcContext,
    @Param('baseId') baseId: string,
    @Body() body: Record<string, any>,
    @Req() req: NcRequest,
  ) {
    const base = await this.projectsService.baseUpdate(context, {
      baseId,
      base: body,
      user: req.user,
      req,
    });

    return base;
  }

  @Acl('baseDelete')
  @Delete(['/api/v1/db/meta/projects/:baseId', '/api/v2/meta/bases/:baseId'])
  async baseDelete(
    @TenantContext() context: NcContext,
    @Param('baseId') baseId: string,
    @Req() req: NcRequest,
  ) {
    const deleted = await this.projectsService.baseSoftDelete(context, {
      baseId,
      user: req.user,
      req,
    });

    return deleted;
  }

  @Acl('baseCreate', {
    scope: 'org',
  })
  @Post(['/api/v1/db/meta/projects', '/api/v2/meta/bases'])
  @HttpCode(200)
  async baseCreate(
    @TenantContext() context: NcContext,
    @Body() baseBody: ProjectReqType,
    @Req() req: NcRequest,
  ) {
    const base = await this.projectsService.baseCreate({
      base: baseBody,
      req,
      user: req['user'],
    });

    return base;
  }

  @Acl('hasEmptyOrNullFilters')
  @Get([
    '/api/v1/db/meta/projects/:baseId/has-empty-or-null-filters',
    '/api/v2/meta/bases/:baseId/has-empty-or-null-filters',
  ])
  async hasEmptyOrNullFilters(
    @TenantContext() context: NcContext,
    @Param('baseId') baseId: string,
  ) {
    return await Filter.hasEmptyOrNullFilters(context, baseId);
  }
}
