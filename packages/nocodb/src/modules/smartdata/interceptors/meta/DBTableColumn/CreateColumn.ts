import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { camelCase } from 'lodash';
import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';

/**
 * # DB Table Column
 * ## Create Column
 *
 * https://meta-apis-v1.nocodb.com/#tag/DB-Table-Column/operation/db-table-column-create
 *
 * ### APIs
 * - /api/v1/db/meta/tables/:tableId/columns/
 * - /api/v2/meta/tables/:tableId/columns/
 */
@Injectable()
export class CreateColumn implements NestInterceptor {
  protected operation: string = 'NocodbDBTableColumnCreateColumn';

  constructor(
    private readonly mcdm: MCDMService,
    private readonly llm: LLMService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    if (!this.mcdm.isRewrite()) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();

    const columnName = req.body?.column_name;
    if (columnName) {
      const name: string = await this.llm.translate(req.body.column_name);
      req.body.column_name = camelCase(name);
    }

    return next.handle();
  }
}
