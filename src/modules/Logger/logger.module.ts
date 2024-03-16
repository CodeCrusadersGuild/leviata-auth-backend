import { Module } from '@nestjs/common';
import { LocalStorageLoggerService } from './local.storage.logger.context.service';

@Module({
  providers: [LocalStorageLoggerService],
  exports: [],
})
export class LoggerModule {}
