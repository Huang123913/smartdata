import { Response } from 'express';
import * as XLSX from 'xlsx';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import { DataApiLimiterGuard } from '~/guards/data-api-limiter.guard';
import { GlobalGuard } from '~/guards/global/global.guard';
import {
  extractCsvData,
  extractXlsxData,
} from '~/helpers/dataHelpers';
import {
  NcContext,
  NcRequest,
} from '~/interface/config';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { View } from '~/models';
import {
  ExportTableViewRows,
} from '~/modules/smartdata/interceptors/data/DBViewRow/ExportTableViewRows';
import { DatasService } from '~/services/datas.service';

import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller()
@UseGuards(DataApiLimiterGuard, GlobalGuard)
export class DataAliasExportController {
  constructor(private datasService: DatasService) {}

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/export/excel',
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/export/excel',
  ])
  @Acl('exportExcel')
  @UseInterceptors(
    ExportTableViewRows('NocodbDBTableRowExportTableViewRows', 'excel'),
  )
  async excelDataExport(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
  ) {
    const { model, view } =
      await this.datasService.getViewAndModelFromRequestByAliasOrId(
        context,
        req,
      );
    let targetView = view;
    if (!targetView) {
      targetView = await View.getDefaultView(context, model.id);
    }
    const { offset, elapsed, data } = await extractXlsxData(
      context,
      targetView,
      req,
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, data, targetView.title);
    const buf = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    res.set({
      'Access-Control-Expose-Headers': 'nc-export-offset',
      'nc-export-offset': offset,
      'nc-export-elapsed-time': elapsed,
      'Content-Disposition': `attachment; filename="${encodeURI(
        targetView.title,
      )}-export.xlsx"`,
    });
    res.end(buf);
  }

  @Get([
    '/api/v1/db/data/:orgs/:baseName/:tableName/views/:viewName/export/csv',
    '/api/v1/db/data/:orgs/:baseName/:tableName/export/csv',
  ])
  @Acl('exportCsv')
  @UseInterceptors(
    ExportTableViewRows('NocodbDBTableRowExportTableViewRows', 'csv'),
  )
  async csvDataExport(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Res() res: Response,
  ) {
    const { model, view } =
      await this.datasService.getViewAndModelFromRequestByAliasOrId(
        context,
        req,
      );
    let targetView = view;
    if (!targetView) {
      targetView = await View.getDefaultView(context, model.id);
    }
    const { offset, elapsed, data } = await extractCsvData(
      context,
      targetView,
      req,
    );

    res.set({
      'Access-Control-Expose-Headers': 'nc-export-offset',
      'nc-export-offset': offset,
      'nc-export-elapsed-time': elapsed,
      'Content-Disposition': `attachment; filename="${encodeURI(
        targetView.title,
      )}-export.csv"`,
    });
    res.send(data);
  }
}
