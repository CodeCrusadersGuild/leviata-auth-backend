import { Module } from '@nestjs/common';
import { LocalStorageLoggerService } from './local.storage.logger.context.service';
import { LoggerContextService } from './logger.context.service';

@Module({
  providers: [LocalStorageLoggerService, LoggerContextService],
  exports: [],
})
export class LoggerModule {}
