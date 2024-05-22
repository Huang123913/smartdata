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
 * ## Update Table
 *
 * https://meta-apis-v1.nocodb.com/#tag/DB-Table/operation/db-table-update
 *
 * ### APIs
 * - /api/v1/db/meta/tables/:tableId
 * - /api/v2/meta/tables/:tableId
 */
@Injectable()
export class UpdateTable implements NestInterceptor {
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
