import { Module } from '@nestjs/common';
import { LocalStorageService } from './services/local.storage.service';
import { LoggerContextService } from './services/logger.context.service';

@Module({
  providers: [LocalStorageService, LoggerContextService],
  exports: [],
})
export class LoggerModule {}
