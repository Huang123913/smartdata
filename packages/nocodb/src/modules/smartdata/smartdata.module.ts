import { Module } from '@nestjs/common';
import { SmartDataController } from '~/controllers/smartdata/smartdata.controller';
import { SmartDataService } from '~/services/smartdata/smartdata.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';
import { LLMService } from '~/services/smartdata/llm.service';

@Module({
  controllers: [
    ...(process.env.NC_WORKER_CONTAINER !== 'true'
      ? [SmartDataController]
      : []),
  ],
  providers: [LLMService, MCDMService, SmartDataService],
  exports: [LLMService, MCDMService, SmartDataService],
})
export class SmartDataModule {}
