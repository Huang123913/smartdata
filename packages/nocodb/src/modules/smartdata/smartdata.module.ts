import { Module } from '@nestjs/common';
import { SmartDataController } from '~/controllers/smartdata/smartdata.controller';
import { SmartDataService } from '~/services/smartdata/smartdata.service';

@Module({
  controllers: [
    ...(process.env.NC_WORKER_CONTAINER !== 'true'
      ? [SmartDataController]
      : []),
  ],
  providers: [SmartDataService],
  exports: [SmartDataService],
})
export class SmartDataModule {}
