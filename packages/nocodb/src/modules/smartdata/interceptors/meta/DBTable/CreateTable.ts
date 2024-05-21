import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { camelCase, upperFirst } from 'lodash';
import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';

/**
 * # DB Table
 * ## Create Table
 *
 * https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-create
 *
 * ### APIs
 * - /api/v1/db/meta/projects/:baseId/tables
 * - /api/v1/db/meta/projects/:baseId/:sourceId/tables
 * - /api/v2/meta/bases/:baseId/tables
 * - /api/v2/meta/bases/:baseId/:sourceId/tables
 */
@Injectable()
export class CreateTable implements NestInterceptor {
  constructor(
    private readonly mcdm: MCDMService,
    private readonly llm: LLMService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    if (!this.mcdm.isRewrite()) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const tableName = req.body?.table_name;
    if (tableName) {
      const name: string = await this.llm.translate(tableName);
      req.body.table_name = upperFirst(camelCase(name));
    }

    return next.handle();
  }
}
