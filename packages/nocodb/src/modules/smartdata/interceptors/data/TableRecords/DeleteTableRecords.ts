import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';

/**
 * # Table Records
 * ## Delete Table Records
 *
 * https://data-apis-v2.nocodb.com/#tag/Table-Records/operation/db-data-table-row-delete
 *
 * ### APIs
 * - /api/v2/tables/:modelId/records
 */
@Injectable()
export class DeleteTableRecords implements NestInterceptor {
  constructor() {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    if (!Array.isArray(req.body)) {
      req.body = [req.body];
    }

    return next.handle();
  }
}
