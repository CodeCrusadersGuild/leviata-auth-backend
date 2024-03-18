import { Module } from '@nestjs/common';
import { CallerService } from './services/caller.service';
import { LocalStorageService } from './services/local.storage.service';
import { LoggerBuilderService } from './services/logger.builder.service';
import { LoggerContextService } from './services/logger.context.service';
import { StackTraceService } from './services/stack.trace.service';

@Module({
  providers: [
    CallerService,
    LocalStorageService,
    LoggerBuilderService,
    LoggerContextService,
    StackTraceService,
  ],
  exports: [],
})
export class LoggerModule {}
