import { SmartDataController } from '~/controllers/smartdata/smartdata.controller';
import { LLMService } from '~/services/smartdata/llm.service';
import { MCDMService } from '~/services/smartdata/mcdm.service';

import { Module } from '@nestjs/common';

@Module({
  controllers: [
    ...(process.env.NC_WORKER_CONTAINER !== 'true'
      ? [SmartDataController]
      : []),
  ],
  providers: [LLMService, MCDMService],
  exports: [LLMService, MCDMService],
})
export class SmartDataModule {}
