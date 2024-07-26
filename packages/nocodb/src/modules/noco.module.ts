import multer from 'multer';
/* Metas */
import { NC_ATTACHMENT_FIELD_SIZE } from '~/constants';
import { ApiDocsController } from '~/controllers/api-docs/api-docs.controller';
import { ApiTokensController } from '~/controllers/api-tokens.controller';
import {
  AttachmentsSecureController,
} from '~/controllers/attachments-secure.controller';
import { AttachmentsController } from '~/controllers/attachments.controller';
import { AuditsController } from '~/controllers/audits.controller';
import { BaseUsersController } from '~/controllers/base-users.controller';
import { BasesController } from '~/controllers/bases.controller';
import {
  BulkDataAliasController,
} from '~/controllers/bulk-data-alias.controller';
import { CachesController } from '~/controllers/caches.controller';
import {
  CalendarDatasController,
} from '~/controllers/calendars-datas.controller';
import { CalendarsController } from '~/controllers/calendars.controller';
import { ColumnsController } from '~/controllers/columns.controller';
import {
  CommandPaletteController,
} from '~/controllers/command-palette.controller';
import { CommentsController } from '~/controllers/comments.controller';
import {
  DataAliasExportController,
} from '~/controllers/data-alias-export.controller';
import {
  DataAliasNestedController,
} from '~/controllers/data-alias-nested.controller';
import { DataAliasController } from '~/controllers/data-alias.controller';
/* Datas */
import { DataTableController } from '~/controllers/data-table.controller';
import { DatasController } from '~/controllers/datas.controller';
import { ExtensionsController } from '~/controllers/extensions.controller';
import { FiltersController } from '~/controllers/filters.controller';
import { FormColumnsController } from '~/controllers/form-columns.controller';
import { FormsController } from '~/controllers/forms.controller';
import { GalleriesController } from '~/controllers/galleries.controller';
import { GridColumnsController } from '~/controllers/grid-columns.controller';
import { GridsController } from '~/controllers/grids.controller';
import { HooksController } from '~/controllers/hooks.controller';
import { JobsMetaController } from '~/controllers/jobs-meta.controller';
import { KanbansController } from '~/controllers/kanbans.controller';
import { MapsController } from '~/controllers/maps.controller';
import { MetaDiffsController } from '~/controllers/meta-diffs.controller';
import {
  ModelVisibilitiesController,
} from '~/controllers/model-visibilities.controller';
import {
  NotificationsController,
} from '~/controllers/notifications.controller';
import {
  OldDatasController,
} from '~/controllers/old-datas/old-datas.controller';
import { OldDatasService } from '~/controllers/old-datas/old-datas.service';
import { OrgLcenseController } from '~/controllers/org-lcense.controller';
import { OrgTokensController } from '~/controllers/org-tokens.controller';
import { OrgUsersController } from '~/controllers/org-users.controller';
import { PluginsController } from '~/controllers/plugins.controller';
import {
  PublicDatasExportController,
} from '~/controllers/public-datas-export.controller';
import { PublicDatasController } from '~/controllers/public-datas.controller';
import { PublicMetasController } from '~/controllers/public-metas.controller';
import { SharedBasesController } from '~/controllers/shared-bases.controller';
import { SortsController } from '~/controllers/sorts.controller';
import { SourcesController } from '~/controllers/sources.controller';
import { SyncController } from '~/controllers/sync.controller';
import { TablesController } from '~/controllers/tables.controller';
/* User */
import { UsersController } from '~/controllers/users/users.controller';
import { UtilsController } from '~/controllers/utils.controller';
import { ViewColumnsController } from '~/controllers/view-columns.controller';
import { ViewsController } from '~/controllers/views.controller';
import { SocketGateway } from '~/gateways/socket.gateway';
import { GlobalGuard } from '~/guards/global/global.guard';
import { MetaService } from '~/meta/meta.service';
/* Modules */
import {
  EventEmitterModule,
} from '~/modules/event-emitter/event-emitter.module';
import { JobsModule } from '~/modules/jobs/jobs.module';
/* Generic */
import {
  InitMetaServiceProvider,
} from '~/providers/init-meta-service.provider';
import { JwtStrategyProvider } from '~/providers/jwt-strategy.provider';
import { ApiDocsService } from '~/services/api-docs/api-docs.service';
import { ApiTokensService } from '~/services/api-tokens.service';
import { AppHooksListenerService } from '~/services/app-hooks-listener.service';
import { AppHooksService } from '~/services/app-hooks/app-hooks.service';
import { AttachmentsService } from '~/services/attachments.service';
import { AuditsService } from '~/services/audits.service';
import { BaseUsersService } from '~/services/base-users/base-users.service';
import { BasesService } from '~/services/bases.service';
import { BulkDataAliasService } from '~/services/bulk-data-alias.service';
import { CachesService } from '~/services/caches.service';
import { CalendarDatasService } from '~/services/calendar-datas.service';
import { CalendarsService } from '~/services/calendars.service';
import { ColumnsService } from '~/services/columns.service';
import { CommandPaletteService } from '~/services/command-palette.service';
import { CommentsService } from '~/services/comments.service';
import { DataAliasNestedService } from '~/services/data-alias-nested.service';
import { DataTableService } from '~/services/data-table.service';
import { DatasService } from '~/services/datas.service';
import { ExtensionsService } from '~/services/extensions.service';
import { FiltersService } from '~/services/filters.service';
import { FormColumnsService } from '~/services/form-columns.service';
import { FormsService } from '~/services/forms.service';
import { GalleriesService } from '~/services/galleries.service';
import { GridColumnsService } from '~/services/grid-columns.service';
import { GridsService } from '~/services/grids.service';
import { HookHandlerService } from '~/services/hook-handler.service';
import { HooksService } from '~/services/hooks.service';
import { JobsMetaService } from '~/services/jobs-meta.service';
import { KanbansService } from '~/services/kanbans.service';
import { MapsService } from '~/services/maps.service';
import { MetaDiffsService } from '~/services/meta-diffs.service';
import {
  ModelVisibilitiesService,
} from '~/services/model-visibilities.service';
import {
  NotificationsService,
} from '~/services/notifications/notifications.service';
import { OrgLcenseService } from '~/services/org-lcense.service';
import { OrgTokensEeService } from '~/services/org-tokens-ee.service';
import { OrgTokensService } from '~/services/org-tokens.service';
import { OrgUsersService } from '~/services/org-users.service';
import { PluginsService } from '~/services/plugins.service';
import {
  PublicDatasExportService,
} from '~/services/public-datas-export.service';
import { PublicDatasService } from '~/services/public-datas.service';
import { PublicMetasService } from '~/services/public-metas.service';
import { SharedBasesService } from '~/services/shared-bases.service';
import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';
import { SortsService } from '~/services/sorts.service';
import { SourcesService } from '~/services/sources.service';
import { SyncService } from '~/services/sync.service';
import { TablesService } from '~/services/tables.service';
import { TelemetryService } from '~/services/telemetry.service';
import { UsersService } from '~/services/users/users.service';
import { UtilsService } from '~/services/utils.service';
import { ViewColumnsService } from '~/services/view-columns.service';
import { ViewsService } from '~/services/views.service';
import { JwtStrategy } from '~/strategies/jwt.strategy';

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

export const nocoModuleMetadata = {
  imports: [
    EventEmitterModule,
    JobsModule,
    MulterModule.register({
      storage: multer.diskStorage({}),
      limits: {
        fieldSize: NC_ATTACHMENT_FIELD_SIZE,
      },
    }),
  ],
  controllers: [
    ...(process.env.NC_WORKER_CONTAINER !== 'true'
      ? [
          /* Users */
          UsersController,

          /* Metas */
          ApiDocsController,
          ApiTokensController,
          ...(process.env.NC_SECURE_ATTACHMENTS === 'true'
            ? [AttachmentsSecureController]
            : [AttachmentsController]),
          AuditsController,
          SourcesController,
          CachesController,
          CalendarsController,
          ColumnsController,
          CommentsController,
          FiltersController,
          FormColumnsController,
          FormsController,
          GalleriesController,
          GridColumnsController,
          GridsController,
          HooksController,
          KanbansController,
          MapsController,
          MetaDiffsController,
          ModelVisibilitiesController,
          OrgLcenseController,
          OrgTokensController,
          OrgUsersController,
          PluginsController,
          BaseUsersController,
          BasesController,
          PublicMetasController,
          ViewsController,
          ViewColumnsController,
          UtilsController,
          TablesController,
          SyncController,
          SortsController,
          SharedBasesController,
          NotificationsController,
          CommandPaletteController,
          ExtensionsController,
          JobsMetaController,

          /* Datas */
          DataTableController,
          DatasController,
          CalendarDatasController,
          BulkDataAliasController,
          DataAliasController,
          DataAliasNestedController,
          DataAliasExportController,
          OldDatasController,
          PublicDatasController,
          PublicDatasExportController,
        ]
      : []),
  ],
  providers: [
    /* Generic */
    InitMetaServiceProvider,
    JwtStrategyProvider,
    GlobalGuard,
    SocketGateway,
    AppHooksService,
    AppHooksListenerService,
    TelemetryService,
    HookHandlerService,

    /* Users */
    UsersService,

    /* Metas */
    ApiDocsService,
    ApiTokensService,
    AttachmentsService,
    AuditsService,
    SourcesService,
    CachesService,
    CalendarsService,
    ColumnsService,
    CommentsService,
    FiltersService,
    FormColumnsService,
    FormsService,
    GalleriesService,
    GridColumnsService,
    GridsService,
    HooksService,
    KanbansService,
    MapsService,
    MetaDiffsService,
    ModelVisibilitiesService,
    OrgLcenseService,
    OrgTokensEeService,
    OrgTokensService,
    OrgUsersService,
    PluginsService,
    BaseUsersService,
    BasesService,
    PublicMetasService,
    ViewsService,
    ViewColumnsService,
    UtilsService,
    TablesService,
    SyncService,
    SortsService,
    SharedBasesService,
    NotificationsService,
    CommandPaletteService,
    ExtensionsService,
    JobsMetaService,

    /* Datas */
    DataTableService,
    DatasService,
    BulkDataAliasService,
    DataAliasNestedService,
    CalendarDatasService,
    OldDatasService,
    PublicDatasService,
    PublicDatasExportService,
    MCDMService,
    LLMService,
  ],
  exports: [
    /* Generic */
    AppHooksService,
    TelemetryService,
    HookHandlerService,
    JwtStrategy,

    /* Users */
    UsersService,

    /* Metas */
    MetaService,
    TablesService,
    ColumnsService,
    FiltersService,
    SortsService,
    ViewsService,
    ViewColumnsService,
    GridsService,
    CalendarsService,
    GridColumnsService,
    FormsService,
    FormColumnsService,
    GalleriesService,
    KanbansService,
    BasesService,
    AttachmentsService,
    BaseUsersService,
    HooksService,
    MetaDiffsService,
    SourcesService,
    UtilsService,

    /* Datas */
    DatasService,
    BulkDataAliasService,
    // SmartData
    MCDMService,
    LLMService,
  ],
};

@Module(nocoModuleMetadata)
export class NocoModule {}
