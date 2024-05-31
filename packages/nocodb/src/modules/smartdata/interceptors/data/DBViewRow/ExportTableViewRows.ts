import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import papaparse from 'papaparse';
import { of } from 'rxjs';
import * as XLSX from 'xlsx';

import { MCDMService } from '~/services/smartdata/mcdm.service';

type ExportType = 'csv' | 'excel';

/**
 * # DB View Row
 * ## Export Table View Rows
 *
 * https://data-apis-v1.nocodb.com/#tag/DB-View-Row/operation/db-view-row-export
 *
 * ### APIs
 * - /api/v1/db/data/:orgs/:baseName/:tableName/export/excel
 * - /api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/export/excel
 * - /api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/export/csv
 * - /api/v1/db/data/:orgs/:baseName/:tableName/export/csv
 */
@Injectable()
class ExportTableViewRowsInterceptor implements NestInterceptor {
  constructor(
    private readonly mcdm: MCDMService,
    private readonly operation: string,
    private readonly exportType: ExportType,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    if (!this.mcdm.isRewrite()) return next.handle();

    const req = context.switchToHttp().getRequest();
    const result = await this.fetch(req);

    if (this.exportType == 'csv') {
      this.exportCsv(context, result);
    } else if (this.exportType == 'excel') {
      this.exportExcel(context, result);
    }

    return of(null);
  }

  async fetch(req: Request) {
    // return Promise.resolve({
    //   data: [
    //     { Title: 'title1', age: 1 },
    //     { Title: 'title2', age: 3 },
    //     { Title: 'title3', age: 3 },
    //     { Title: 'title4', age: 4 },
    //   ],
    //   fields: ['Title', 'age'],
    //   title: 'title',
    //   offset: -1,
    //   elapsed: 6.778912,
    // });

    const query = req.query;
    const params = req.params;

    req.params = {};
    req.query = {
      operation: this.operation,
    };

    req.body = {
      operation: this.operation,
      ...params,
      ...query,
    };

    return this.mcdm.fetch(this.operation, { req });
  }

  exportCsv(context: ExecutionContext, result) {
    const { title, data, fields, offset, elapsed } = result;
    const name = title ?? 'data';

    const csvData = papaparse.unparse(
      { fields: fields, data: data },
      { escapeFormulae: true },
    );

    const res = context.switchToHttp().getResponse();
    res.set({
      'Access-Control-Expose-Headers': 'nc-export-offset',
      'nc-export-offset': offset ?? -1,
      'nc-export-elapsed-time': elapsed ?? 0,
      'Content-Disposition': `attachment; filename="${name}-export.csv"`,
    });

    res.send(csvData);
  }

  exportExcel(context: ExecutionContext, result) {
    const { title, data, fields, offset, elapsed } = result;
    const name = title ?? 'data';

    const wb = XLSX.utils.book_new();
    const excelData = XLSX.utils.json_to_sheet(data, { header: fields });
    XLSX.utils.book_append_sheet(wb, excelData, name);
    const buf = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    const res = context.switchToHttp().getResponse();
    res.set({
      'Access-Control-Expose-Headers': 'nc-export-offset',
      'nc-export-offset': offset ?? -1,
      'nc-export-elapsed-time': elapsed ?? 0,
      'Content-Disposition': `attachment; filename="${name}-export.xlsx"`,
    });

    res.end(buf);
  }
}

export function ExportTableViewRows(
  operation: string,
  exportType: ExportType,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor extends ExportTableViewRowsInterceptor {
    constructor(mcdm: MCDMService) {
      super(mcdm, operation, exportType);
    }
  }

  return Interceptor;
}
