import { Module } from '@nestjs/common';
import { LocalStorageService } from './local.storage.service';
import { LoggerContextService } from './logger.context.service';

@Module({
  providers: [LocalStorageService, LoggerContextService],
  exports: [],
})
export class LoggerModule {}
